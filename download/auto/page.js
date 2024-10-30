//get url hash
const URLS = {
    "linux":"https://mlearn.morisinc.net/static/linux/mLearn_linux_x86.zip",
    "windows":"https://mlearn.morisinc.net/static/win32/mLearn_win32_x86.zip",
    "macos_x86":"https://mlearn.morisinc.net/static/darwin/mLearn_darwin_x86.zip",
    "macos_arm64":"https://mlearn.morisinc.net/static/darwin/mLearn_darwin_arm64.zip",
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