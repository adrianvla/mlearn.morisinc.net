//get url hash
const URLS = {
    "linux-standalone":"https://github.com/adrianvla/mLearn/releases/download/v1.3.2/mLearn-1.3.2-linux-amd64.zip",
    "linux-installer":"https://github.com/adrianvla/mLearn/releases/download/v1.3.2/mlearn_1.3.2_amd64.deb",
    "windows-standalone":"https://github.com/adrianvla/mLearn/releases/download/v1.3.2/mLearn-1.3.2-win.zip",
    "windows-installer":"https://github.com/adrianvla/mLearn/releases/download/v1.3.2/mLearn.Setup.1.3.2.exe",
    "macos":"https://github.com/adrianvla/mLearn/releases/download/v1.3.2/mLearn-1.3.2-mac.dmg",
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