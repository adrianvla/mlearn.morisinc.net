//get url hash
const version = "1.3.6";


$(document).ready(()=>{
    const URLS = {
        "linux-standalone":`https://github.com/adrianvla/mLearn/releases/download/v${version}/mLearn-${version}-linux-amd64.zip`,
        "linux-installer":`https://github.com/adrianvla/mLearn/releases/download/v${version}/mlearn_${version}_amd64.deb`,
        "windows-standalone":`https://github.com/adrianvla/mLearn/releases/download/v${version}/mLearn-${version}-win.zip`,
        "windows-installer":`https://github.com/adrianvla/mLearn/releases/download/v${version}/mLearn.Setup.${version}.exe`,
        "macos":`https://github.com/adrianvla/mLearn/releases/download/v${version}/mLearn-${version}-mac.dmg`,
    };
    const hash = window.location.hash.replace("#","");
    if(URLS[hash]){
        $("title").text(`Download mLearn ${version} - ${hash}`);
        $("h1 span").text(hash);
        $("h2 span").text(`v${version}`);
        $(".download a").attr("href",URLS[hash]);
        window.location.href = URLS[hash];
    }else{
        $("h1").text("An error has occured, please try again.");
        $("title").text(`Download mLearn - ERROR`);
    }
});