//get url hash
const URLS = {
    "linux":"https://github.com/adrianvla/mLearn/releases/download/release/mLearn-linux-x64.zip",
    "windows":"https://github.com/adrianvla/mLearn/releases/download/release/mLearn-win32-x64.zip",
    "macos_x86":"https://github.com/adrianvla/mLearn/releases/download/release/mLearn_x86.dmg",
    "macos_arm64":"https://github.com/adrianvla/mLearn/releases/download/release/mLearn_arm64.dmg",
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