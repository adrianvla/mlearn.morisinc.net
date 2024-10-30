$(".animate-blur").html(function (index, html) {
    return html.replace(/\b([\w.]+?)\b/g, "<span class='word'><span class='elevator'><span>$1</span></span></span>");
});
const addGsapAnimations = ()=>{

    gsap.fromTo(".note",{opacity:0},{
        opacity:0.5,
        duration:1.5,
        ease: "power3.out",
        scrollTrigger: {
            trigger: ".note",
            start: "top center",
            end: "top center",
            scrub: 1,
            markers: false,
            once:true
        }
    })

    gsap.to(".separator",{
        width:"100%",
        scrollTrigger: {
            trigger: ".separator",
            start: "top center",
            end: "bottom center",
            scrub: 3,
            markers: false
        }
    });
    gsap.to(".after-hero-separator",{
        width:"100%",
        scrollTrigger: {
            trigger: ".hero-img",
            start: "top center",
            end: "bottom center",
            scrub: 3,
            markers: false
        }
    });

    gsap.to(".hero-img .img-c", {
        rotateX: 0,
        rotateY: 0,
        rotate:0,
        scale:1,
        translateX:0,
        mask:"none",
        scrollTrigger: {
            trigger: ".hero-img",
            start: "top center",
            end: "center center",
            scrub: 1
        }
    });

    gsap.to(".hero-img .img-c .fader",{
        opacity:0,
        scrollTrigger: {
            trigger: ".hero-img",
            start: "top center",
            end: "center center",
            scrub: 2
        }
    });

    gsap.to(".hero-img", {
        paddingTop:0,
        paddingBottom:"150px",
        scrollTrigger: {
            trigger: ".hero-img",
            start: "top center",
            end: "center center",
            scrub: 0.5
        }
    });

};
$(document).ready(()=>{
    gsap.registerPlugin(ScrollTrigger);
    //wrap every word in class .animate-blur with span using jquery for all elements
    //make every word a fixed width
    $(".word").each(function () {
        $(this).find(".elevator").css("width", $(this).width());
        $(this).find(".elevator").css("height", $(this).height());
        $(this).find(".elevator span").css("width", $(this).width()).css("height", $(this).height()).addClass('animatable');
    });

    //animate the words using scrolltrigger
    $(".animate-blur").each(function () {
        let options = {
            trigger: this,
            start: "top center+=350px",
            end: "bottom center",
            scrub: 1,
            markers: false,
            once: true
        };
        if($(this).is(".already-visible")) options = {};
        let tl = gsap.timeline({
            scrollTrigger: options
        });
        $(this).find(".word").each(function () {
            tl.fromTo($(this).find(".animatable")[0],{opacity:0}, {
                top: 0,
                rotate: 0,
                duration: 0.5,
                opacity:1,
                ease: "power3.out"
            },"-=1.3");
            tl.to(this,{
                filter:"blur(0px)",
                duration:1.5,
                ease: "power3.out"
            },"<");
        });
        if($(this).is(".already-visible")) tl.play();
    });

    let tl2 = gsap.timeline({
        scrollTrigger: {
            trigger: ".cards",
            start: "top center",
            end: "bottom center+=400px",
            scrub: 1,
            markers: false,
            once: true
        }
    });
    $(".card").each(function () {
        tl2.fromTo(this,{opacity:0}, {
            top: 0,
            rotate: 0,
            duration: 0.5,
            opacity:1,
            ease: "power3.out"
        },"-=1.3");
        tl2.fromTo(this,{filter:"blur(16px)"},{
            filter:"blur(0px)",
            duration:1.5,
            ease: "power3.out"
        },"<");
    });
    try{addGsapAnimations();}catch(e){
        console.log(e);
        setTimeout(addGsapAnimations,1000);
    }
    $("#features,#features1").on("click", function () {
        $("html, body").animate({
            scrollTop: $("section.features").offset().top
        }, 1000);
    });
    $("#usage,#usage1").on("click", function () {
        $("html, body").animate({
            scrollTop: $("section.guide").offset().top
        }, 1000);
    });
    $("#faq,#faq1").on("click", function () {
        $("html, body").animate({
            scrollTop: $("section.faq").offset().top
        }, 1000);
    });
    //if window location hash
    if(window.location.hash === "#features"){
        $("html, body").animate({
            scrollTop: $("section.features").offset().top
        }, 1000);
    }else if(window.location.hash === "#usage"){
        $("html, body").animate({
            scrollTop: $("section.guide").offset().top
        }, 1000);
    }else if(window.location.hash === "#faq"){
        $("html, body").animate({
            scrollTop: $("section.faq").offset().top
        }, 1000);
    }

    $("#github,#github1").on("click", function () {
        //open the github repo in a new tab
        window.open("https://github.com/adrianvla/mLearn", "_blank");
    });
    //for each card, on document mouse move, set the --mouse-x and --mouse-y css variables relative to the card
    $(document).on("mousemove", function (e) {
        $(".card").each(function () {
            let x = e.pageX - $(this).offset().left;
            let y = e.pageY - $(this).offset().top;
            $(this).css("--mouse-x", x+"px");
            $(this).css("--mouse-y", y+"px");
        });
    });
    let faqTL = gsap.timeline();
    $(".faq-item").on("click",function(){
        $(".answer").removeClass("show");
        $(this).find(".answer").toggleClass("show");
        if(faqTL) faqTL.kill();
        faqTL = gsap.timeline();
        faqTL.to(".answer:not(.show)",{
            height:"0px",
            marginTop:0,
            marginBottom:0,
            duration:0.5
        });
        faqTL.to($(this).find(".answer")[0],{
            height:$(this).find(".answer span").height(),
            marginTop:"16px",
            marginBottom:"16px",
            duration:0.5
        },"<");
    });


});