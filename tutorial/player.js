// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        videoId: 'QEt7qFTiKik',
        playerVars: {
            'playsinline': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
    // Mark player ready and process any pending selection
    playerReady = true;
    try {
        currentVideoId = player && player.getVideoData ? player.getVideoData().video_id : null;
    } catch (e) {
        currentVideoId = null;
    }
    if (pendingSelect) {
        const { videoId, startSeconds } = pendingSelect;
        if (videoId && videoId === currentVideoId) {
            player.seekTo(startSeconds || 0, true);
            player.playVideo();
        } else if (videoId) {
            player.loadVideoById({ videoId, startSeconds: startSeconds || 0 });
        }
        pendingSelect = null;
    }
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
function onPlayerStateChange(event) {
    try {
        if (event && event.data === YT.PlayerState.PLAYING) {
            // Update currentVideoId on actual play
            try { currentVideoId = player.getVideoData().video_id; } catch (_) {}
            startTimeCheck();
        } else if (event && (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED)) {
            stopTimeCheck();
        }
    } catch (_) {}
}
function stopVideo() {
    player.stopVideo();
}

const tutorials = {
    "Install mLearn on MacOS":{timestamp:"0:00", videoId:'QEt7qFTiKik'},
    "Install mLearn on Windows 11":{timestamp:"0:00", videoId:'bEBCl3XxIsc'},
    "Watch a video in mLearn":{timestamp:"0:56", videoId:'QEt7qFTiKik'},
    "Watch a video in your browser using mLearn Tethered mode":{timestamp:"2:33", videoId:'QEt7qFTiKik'},
    "Setup port-forwarding for mLearn Mobile Mode / Watch Together Mode":{timestamp:"3:34", videoId:'QEt7qFTiKik'},
    "How to install mLearn Mobile":{timestamp:"4:54", videoId:'QEt7qFTiKik'},
    "Using mLearn on Mobile to watch videos":{timestamp:"6:57", videoId:'QEt7qFTiKik'},
    "mLearn Watch-Together Mode":{timestamp:"8:23", videoId:'QEt7qFTiKik'},
    "Installing mLearn Companion Flashcard App on Mobile":{timestamp:"10:48", videoId:'QEt7qFTiKik'},
    "Syncing mLearn Companion Flashcard App with mLearn for PC/Mac":{timestamp:"11:12", videoId:'QEt7qFTiKik'},
    "Instructing mLearn to prepare you to a language exam":{timestamp:"11:45", videoId:'QEt7qFTiKik'},
};

// --- Tutorial list + player controls ---
let playerReady = false;
let currentVideoId = null;
let pendingSelect = null;
let selectedSegment = null; // { videoId, startSeconds, endSeconds }

let chaptersByVideo = {};
function buildChaptersByVideo() {
    const byVid = {};
    Object.keys(tutorials).forEach(title => {
        const { videoId, timestamp } = tutorials[title];
        const startSeconds = parseTimestamp(timestamp);
        if (!byVid[videoId]) byVid[videoId] = [];
        byVid[videoId].push({ title, startSeconds });
    });
    Object.keys(byVid).forEach(v => byVid[v].sort((a, b) => a.startSeconds - b.startSeconds));
    chaptersByVideo = byVid;
}

function parseTimestamp(ts) {
    if (!ts || typeof ts !== 'string') return 0;
    const parts = ts.split(':').map(p => parseInt(p, 10));
    if (parts.some(n => Number.isNaN(n))) return 0;
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return parts[0] || 0;
}

function selectTutorial(title, sourceEl) {
    const info = tutorials[title];
    if (!info) return;
    const startSeconds = parseTimestamp(info.timestamp);
    // compute endSeconds as next chapter start in the same video (if any)
    const endSeconds = (function () {
        const arr = chaptersByVideo[info.videoId] || [];
        const idx = arr.findIndex(c => c.startSeconds === startSeconds);
        if (idx === -1) return Infinity;
        const next = arr[idx + 1];
        return next ? next.startSeconds : Infinity;
    })();
    selectedSegment = { videoId: info.videoId, startSeconds, endSeconds };

    // UI active state
    try {
        document.querySelectorAll('.tutorial-list .nav-item').forEach(el => el.classList.remove('active'));
        if (sourceEl) sourceEl.classList.add('active');
    } catch (_) {}

    if (!player || !playerReady) {
    pendingSelect = { videoId: info.videoId, startSeconds };
        return;
    }

    try {
        if (info.videoId === currentVideoId) {
            player.seekTo(startSeconds, true);
            player.playVideo();
        } else {
            currentVideoId = info.videoId;
            player.loadVideoById({ videoId: info.videoId, startSeconds });
        }
    } catch (e) {
        // no-op
    }
}

// Build the list in .tutorial-list
(function buildTutorialList() {
    const list = document.querySelector('.tutorial-list');
    if (!list) return;

    // Remove any placeholder tutorial items
    list.querySelectorAll('.nav-item').forEach(el => el.remove());

    buildChaptersByVideo();

    Object.keys(tutorials).forEach((title, idx, arr) => {
        const item = document.createElement('div');
        item.className = 'nav-item faint';
        const span = document.createElement('span');
        span.textContent = title;
        item.appendChild(span);
        item.addEventListener('click', () => selectTutorial(title, item));
        list.appendChild(item);
    });
    {
        const sep = document.createElement('div');
        sep.className = 'sep';
        list.appendChild(sep);
    }
})();

// --- Stop at next tutorial boundary ---
let timecheckInterval = null;
function startTimeCheck() {
    if (timecheckInterval) return;
    timecheckInterval = setInterval(checkBoundary, 250);
}
function stopTimeCheck() {
    if (timecheckInterval) {
        clearInterval(timecheckInterval);
        timecheckInterval = null;
    }
}
function checkBoundary() {
    if (!player || !selectedSegment) return;
    // Only enforce for the selected video
    let vidId;
    try { vidId = player.getVideoData().video_id; } catch (_) { vidId = null; }
    if (vidId !== selectedSegment.videoId) return;
    let t = 0;
    try { t = player.getCurrentTime(); } catch (_) { t = 0; }
    const end = selectedSegment.endSeconds ?? Infinity;
    if (Number.isFinite(end) && t >= (end - 0.05)) {
        try {
            player.pauseVideo();
            // Seek to just before the boundary to avoid rolling into the next chapter
            const back = Math.max(0, end - 0.1);
            player.seekTo(back, true);
        } catch (_) {}
        stopTimeCheck();
        // Clear the selection so pressing play won't immediately re-pause
        selectedSegment = null;
    }
}