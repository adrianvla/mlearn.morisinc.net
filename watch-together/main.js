let webSocket = null;
let HLSObject = null;
let hasOwnSubs = null;
let subs = null;
let lastIndex = 0;
let lastSub = null;
let last_lastIndex = 0;
let subsOffsetTime = 0;
let serverURL = null;
const video = document.getElementById('fullscreen-video');
const volumeSlider = document.getElementById('volume');
const progressBar = document.getElementById('progress-bar');
const videoControls = document.getElementById('video-controls');
const qualitySelect = document.getElementById('video-quality');
const findSub = time => {
    if (subs.length === 0) return null;

    // Iterate from the last found index to find the current subtitle
    for (let i = lastIndex; i < subs.length; i++) {
        if (time >= subs[i].start && time <= subs[i].end) {
            return i;
        }
    }

    // If not found, iterate from the beginning to the last found index
    for (let i = 0; i < lastIndex; i++) {
        if (time >= subs[i].start && time <= subs[i].end) {
            return i;
        }
    }
    let closestIndex = 0;
    let closestTimeDiff = Math.min(Math.abs(time - subs[0].start),Math.abs(time - subs[0].end));

    // Iterate through the subtitles to find the closest one
    for (let i = 1; i < subs.length; i++) {
        let timeDiff = Math.min(Math.abs(time - subs[i].start),Math.abs(time - subs[i].end));
        if (timeDiff < closestTimeDiff) {
            closestTimeDiff = timeDiff;
            closestIndex = i;
        }
    }

    return closestIndex;
};

const findCurrentSub = (currentTime) => {
    if (subs.length === 0) return null;

    // Check if the current time is within the range of the last found subtitle
    if (currentTime >= subs[lastIndex].start && currentTime <= subs[lastIndex].end) {
        return subs[lastIndex];
    }

    // Iterate from the last found index to find the current subtitle
    for (let i = lastIndex; i < subs.length; i++) {
        if (currentTime >= subs[i].start && currentTime <= subs[i].end) {
            lastIndex = i;
            return subs[i];
        }
    }

    // If not found, iterate from the beginning to the last found index
    for (let i = 0; i < lastIndex; i++) {
        if (currentTime >= subs[i].start && currentTime <= subs[i].end) {
            lastIndex = i;
            return subs[i];
        }
    }

    return null;
};
const modify_sub = async (subtitle)=>{
    if(last_lastIndex == lastIndex) return;
    last_lastIndex = lastIndex;
    $(".subtitles").addClass("quick-transition");
    $(".subtitles").addClass("not-shown");
    subtitle = subtitle.replace(/(<([^>]+)>)/gi, "");
    $(".subtitles").html("<span class=\"subtitle_word\">"+subtitle+"</span>");

    $(".subtitles").removeClass("quick-transition");
    $(".subtitles").removeClass("not-shown");
};


const parseTime = (timeString,type) => {
    let timeRegex = null;
    if(type=="."){
        timeRegex = /(\d+):(\d{2}):(\d{2}\.\d{2})/;
    }else{
        timeRegex = /(\d+):(\d{2}):(\d{2},\d{3})/;
    }
    const match = timeRegex.exec(timeString);
    if (!match) {
        throw new Error('Invalid time format');
    }
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = parseFloat(match[3].replaceAll(",","."));
    return (hours * 3600) + (minutes * 60) + seconds;
};


const readSubtitleFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            if (file.name.endsWith('.srt')) {
                let parsed = parseSRT(content);
                parsed.forEach((sub) => {
                    sub.start = parseTime(sub.start,",");
                    sub.end = parseTime(sub.end,",");
                });
                resolve(parsed);
            } else if (file.name.endsWith('.ass')) {
                let parsed = parseASS(content);
                parsed.forEach((sub) => {
                    sub.start = parseTime(sub.start,".");
                    sub.end = parseTime(sub.end,".");
                });
                resolve(parsed);
            } else {
                reject('Unsupported file type');
            }
        };
        reader.onerror = () => reject('Error reading file');
        reader.readAsText(file);
    });
};

const parseSRT = (content) => {
    const subtitles = [];
    // Updated regex to handle both \n and \r\n
    const srtRegex = /(\d+)(?:\r?\n)(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})(?:\r?\n)([\s\S]*?)(?=\r?\n\d|\r?\n*$)/g;
    let match;

    while ((match = srtRegex.exec(content)) !== null) {
        subtitles.push({
            start: match[2],
            end: match[3],
            text: match[4].replace(/(?:\r?\n)/g, ' ') // Replace line breaks with space in the subtitle text
        });
    }

    return subtitles;
};


const parseASS = (content) => {
    const subtitles = [];
    const assRegex = /Dialogue:\s*(\d+),(\d+:\d+:\d+\.\d+),(\d+:\d+:\d+\.\d+),([^,]*),([^,]*),(\d+),(\d+),(\d+),([^,]*),(.+)/g;
    let match;
    while ((match = assRegex.exec(content)) !== null) {
        const text = match[10].replace(/\\N/g, ' ').replace(/{.*?}/g, ''); // Remove formatting tags
        subtitles.push({
            start: match[2],
            end: match[3],
            text: text
        });
    }
    return subtitles;
};

const updateVideo = async (time) => {
    if(subs == null) return;
    let currentSub = findCurrentSub(time);
    if (!currentSub){
        $(".subtitles").addClass("not-shown");
        return;
    }
    if (currentSub === lastSub) return;
    $(".subtitles").html("");
    await modify_sub(currentSub.text);
    lastSub = currentSub;
};

const videoTimeUpdateCallback = () => {
    updateVideo(video.currentTime+subsOffsetTime);
    const progress = (video.currentTime / video.duration) * 1000;
    progressBar.value = progress;
    $(".total-time").text(new Date(video.duration * 1000).toISOString().substr(11, 8));
    $(".current-time").text(new Date(video.currentTime * 1000).toISOString().substr(11, 8));
};
function updateBufferBar() {
    if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration;
        if (duration > 0) {
            const bufferWidth = (bufferedEnd / duration) * 100;
            document.body.style.setProperty('--buffer-width', `${bufferWidth}%`);
        }
    }
}
const loadStream = (text) => {
    if (!/^https?:\/\//i.test(serverURL)) {
        serverURL = "https://" + serverURL; // Default to HTTPS if no protocol is present
    }
    text = serverURL+"?url="+text;
    if(HLSObject) HLSObject.destroy();
    HLSObject = new Hls();
    HLSObject.loadSource(text);
    HLSObject.attachMedia(video);

    HLSObject.on(Hls.Events.MANIFEST_PARSED, function () {
        // video.play();
        const levels = HLSObject.levels;
        qualitySelect.innerHTML = '<option value="-1">Auto</option>';
        levels.forEach((level, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.text = `${level.height}p`;
            if(level.height != 0)
                qualitySelect.appendChild(option);
        });
    });
    HLSObject.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        console.log(`Switched to level ${data.level}`);
    });

    qualitySelect.addEventListener('change', (event) => {
        HLSObject.currentLevel = parseInt(event.target.value, 10);
    });
    HLSObject.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        console.log(`Switched to level ${data.level}`);
    });
    HLSObject.on(Hls.Events.ERROR, function (event, data) {
        if (data.fatal) {
            switch (data.type) {
                case Hls.ErrorTypes.MEDIA_ERROR:
                    console.log('fatal media error encountered, try to recover');
                    HLSObject.recoverMediaError();
                    break;
                case Hls.ErrorTypes.NETWORK_ERROR:
                    console.error('fatal network error encountered', data);
                    show_notification("Network error encountered, are you using a VPN? Is your internet connection stable?");
                    break;
                default:
                    // cannot recover
                    show_notification("Fatal streaming error encountered, try again.");
                    HLSObject.destroy();
                    break;
            }
        }
    });

    HLSObject.on(Hls.Events.BUFFER_APPENDING, () => {
        updateBufferBar();
    });

    HLSObject.on(Hls.Events.BUFFER_APPENDED, () => {
        updateBufferBar();
    });

    HLSObject.on(Hls.Events.BUFFER_FLUSHED, () => {
        updateBufferBar();
    });
    $(".recently-c").addClass("hide");
};
$(document).ready(()=>{
    let file_input = document.createElement('input');
    file_input.type = 'file';
    file_input.addEventListener('change', async (event) => {
        await manageFiles(event.target.files);
    });

    $("#connect").click(()=>{
        $(".sync-subs").removeClass("not-shown");
        hasOwnSubs = $("#own-subs").is(":checked");
        if(hasOwnSubs){
            file_input.click();
        }
        let url = $("#url").val().replace(/^[a-zA-Z]+:\/\//, '');
        serverURL = url;
        console.log("Connecting to wss://"+url);
        webSocket = new WebSocket("wss://"+url);
        webSocket.onopen = ()=>{
            console.log("Connected to the server.");
            $(".recently-c").remove();
            webSocket.send("{}");
        };
        webSocket.onmessage = (message)=>{
            console.log("Message received: " + message.data);
            let msg = JSON.parse(message.data);
            switch(msg.action){
                case "play":
                    video.play();
                    if(msg.time) video.currentTime = msg.time;
                    break;
                case "pause":
                    video.pause();
                    if(msg.time) video.currentTime = msg.time;
                    break;
                case "start":
                    loadStream(msg.url);
                    break;
                case "request-response":
                    loadStream(msg.url);
                    video.currentTime = msg.time;
                    if(msg.video_playing) video.play();
                    break;
                case "sync":
                    video.currentTime = msg.time;
                    break;
                case "subtitles":
                    if(!hasOwnSubs){
                        $(".subtitles").html(msg.subtitle);
                    }
                    document.body.style.setProperty('--subtitle-font-size', `${msg.size}px`);
                    break;
            }
        };
        webSocket.onclose = ()=>{
            console.log("Connection closed.");
        };
    });
    const manageFiles = async (files) => {
        console.log(files);
        if (files.length > 0) {
            const file = files[0];
            const fileName = file.name;
            if (fileName.endsWith('.srt') || fileName.endsWith('.ass')) {
                let temp = await readSubtitleFile(file);
                subs = temp.sort((a, b) => a.start - b.start);
            }
        }
    };


    volumeSlider.addEventListener('input', () => {
        video.volume = volumeSlider.value;
    });
    video.addEventListener('timeupdate',videoTimeUpdateCallback);

    let hideControlsTimeout;

    const showControls = () => {
        videoControls.classList.add('visible');
        document.body.classList.remove('hide-cursor');
        $(".sync-subs").addClass('visible');
        clearTimeout(hideControlsTimeout);
        hideControlsTimeout = setTimeout(() => {
            videoControls.classList.remove('visible');
            document.body.classList.add('hide-cursor');
            $(".sync-subs").removeClass('visible');
        }, 2000); // Hide controls after 2 seconds of inactivity
    };

    document.addEventListener('mousemove', showControls);

    $(".sync-subs input").val("0.00");
    $(".sync-subs .backward").click(()=>{
        let current_time = video.currentTime+subsOffsetTime;
        let current_sub = findSub(current_time);
        current_sub = subs[current_sub-1];
        if(current_sub){
            subsOffsetTime = current_sub.start - video.currentTime;
        }
        $(".sync-subs input").val(subsOffsetTime.toFixed(2));
        if(isNaN(subsOffsetTime)) subsOffsetTime = 0;
        videoTimeUpdateCallback();
    });
    $(".sync-subs .forward").click(()=>{
        let current_time = video.currentTime+subsOffsetTime;
        let next_sub = findSub(current_time);
        next_sub = subs[next_sub+1];
        if(next_sub){
            subsOffsetTime = next_sub.start - video.currentTime;
        }
        $(".sync-subs input").val(subsOffsetTime.toFixed(2));
        if(isNaN(subsOffsetTime)) subsOffsetTime = 0;
        videoTimeUpdateCallback();
    });
    $(".sync-subs input").change(()=>{
        let val = parseFloat($(".sync-subs input").val());
        if(isNaN(val)) return;
        subsOffsetTime = val;
        $(".sync-subs input").val(val.toFixed(2));
        videoTimeUpdateCallback();
    });
});