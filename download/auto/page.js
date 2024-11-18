//get url hash
const URLS = {
    "linux":"https://mlearn.morisinc.net/static/linux/mLearn-linux-x64.zip",
    "windows":"https://mlearn.morisinc.net/static/win32/mLearn-win32-x64.zip",
    "macos_x86":"https://mlearn.morisinc.net/static/darwin/mLearn_x86.dmg",
    "macos_arm64":"https://mlearn.morisinc.net/static/darwin/mLearn_arm64.dmg",
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