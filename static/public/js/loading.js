let init_loading_bg = document.querySelector(".init_loading_bg");
let init_loadingImg = document.querySelector(".init_loadingImg");
let init_loading_logo = document.querySelector(".init_loading_logo");
let options = document.querySelector(".options");
let loading_poweredBy = document.querySelector(".poweredBy");

window.onload = () => {
    // 加载完成，隐藏动画，显示内容
    var id = setTimeout(function function_name() {
        init_loading_logo.style.opacity = "0";
        loading_poweredBy.style.opacity = "0";
    }, 500);
    var id = setTimeout(function function_name() {
        init_loadingImg.style.border = '10px solid #04AAEB';
    }, 1000);
    var id = setTimeout(function function_name() {
        init_loadingImg.style.animation = "";
        init_loadingImg.style.transform = " rotate(0deg)";
        init_loadingImg.style.width = "100%";
        init_loadingImg.style.height = "100%";
        init_loadingImg.style.borderRadius = "5px";
        init_loadingImg.style.border = '5px solid #57d4ff';
    }, 1500);
    var id = setTimeout(function function_name() {
        init_loading_bg.style.transitionDuration = "0.5s";
        init_loading_bg.style.opacity = "0";
    }, 2000);
    var id = setTimeout(function function_name() {
        init_loading_bg.style.display = "none";
    }, 2500);
}


