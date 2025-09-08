let init_loading_bg = document.querySelector(".init_loading_bg");
let init_dots = document.querySelectorAll(".dot");
let init_loading_logo = document.querySelector(".init_loading_logo");
let options = document.querySelector(".options");
let loading_poweredBy = document.querySelector(".poweredBy");

window.onload = () => {
    // 加载完成，隐藏动画，显示内容
    var id = setTimeout(function function_name() {
        init_loading_logo.style.opacity = "0";
        loading_poweredBy.style.opacity = "0";
    }, 600);
    var id = setTimeout(function function_name() {
        init_dots.forEach(dot => {
            dot.style.opacity = "0";
        });
    }, 1200);
    var id = setTimeout(function function_name() {
        init_loading_bg.style.transitionDuration = "0.5s";
        init_loading_bg.style.opacity = "0";
    }, 2000);
    var id = setTimeout(function function_name() {
        init_loading_bg.style.display = "none";
    }, 2500);
}


