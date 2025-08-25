$(".subtitle_word").on("mouseenter", function() {
    const l = this.querySelector(".subtitle_hover");
    if(!l) return;
    const $l = $(l);

    let calcW = 600;
    $l.css("width",`${calcW}px`);
    let hover_left = -(calcW-$(this).width())/2;
    $l.css("left",`${hover_left}px`);

    const $hover = $l;
    calcW = $hover.find(".footer").width()+26;
    if(calcW < 250) {
        calcW = 250;
        $hover.find(".footer").css("width","100%");
    }
    $hover.css("width",`${calcW}px`);
    hover_left = -(calcW-$(this).width())/2;
    $hover.css("left",`${hover_left}px`);

    $l.addClass("show-hover");
});

$(".subtitle_word").each(function() {
    const l = this.querySelector(".subtitle_hover");
    if(!l) return;
    const $l = $(l);
    let $this = $(this);
    const delayHideHoverEl = (hoverEl, newEl) => {
        setTimeout(() => {
            if (!hoverEl[0].matches(':hover') && !newEl[0].matches(':hover')) {
                hoverEl.removeClass('show-hover');
            }
        }, 300);
    };

    $(this).on("mouseleave",async function(){
        delayHideHoverEl($l, $this);
    });
});



const unknownStatusPillHTML = (uuid) => {
    return `<div class="pill pill-btn red" onclick='changeKnownBtnStatus("${uuid}", 1);' id="status-pill-${uuid}">
    <span class="icon">
        <img src="assets/icons/cross2.svg" alt="">
    </span>
    <span>Unknown</span>
</div>`;
};
const learningStatusPillHTML = (uuid) => {
    return `<div class="pill pill-btn orange" onclick='changeKnownBtnStatus("${uuid}", 2);' id="status-pill-${uuid}">
    <span class="icon">
        <img src="assets/icons/check.svg" alt="">
    </span>
    <span>Learning</span>
</div>`;
};
const knownStatusPillHTML = (uuid) => {
    return `<div class="pill pill-btn green" onclick='changeKnownBtnStatus("${uuid}", 0);' id="status-pill-${uuid}">
    <span class="icon">
        <img src="assets/icons/check.svg" alt="">
    </span>
    <span>Known</span>
</div>`;
};

const generateStatusPillHTML = async (uuid,status) => {
    if(status == 0){
        return unknownStatusPillHTML(uuid);
    }else if(status == 1){
        return learningStatusPillHTML(uuid);
    }else if(status == 2){
        return knownStatusPillHTML(uuid);
    }
    return "";
};

const changeKnownBtnStatus = async (uuid, status) => {
    const id = `status-pill-${uuid}`;
    const el = document.getElementById(id);
    el.outerHTML = await generateStatusPillHTML(uuid,status);
};
window.clickAddFlashcardBtn = (uuid)=>{
    alert("This feature is not available in the demo.");
};


window.changeKnownBtnStatus = changeKnownBtnStatus;