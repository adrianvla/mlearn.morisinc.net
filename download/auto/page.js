//get url hash
const URLS = {
    "linux":"https://github.com/adrianvla/mLearn/releases/download/release/mLearn-linux-x64.zip",
    "windows":"https://github.com/adrianvla/mLearn/releases/download/release/mLearn-win32-x64.zip",
    "macos":"https://github.com/adrianvla/mLearn/releases/download/release/mLearn_universal.dmg",
};


$(document).ready(()=>{
    const hash = window.location.hash.replace("#","");
    if(URLS[hash]){
        $("h1 span").text(hash);
        $(".download a").attr("href",URLS[hash]);
        window.location.href = URLS[hash];
    }else{
        $("h1").text("An error has occured, please try again.");
    }
});