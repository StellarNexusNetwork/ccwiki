let init_loading_bg = document.querySelector(".init_loading_bg");
let init_loadingImg = document.querySelector(".init_loadingImg");
let init_loading_logo = document.querySelector(".init_loading_logo");
let options = document.querySelector(".options");




let navigationBar = document.querySelector(".navigationBar");


var navigation_svg_ids = ["_navigation_fold_svg", "_navigation_home_svg", "_navigation_lassification_svg", "_navigation_components_svg", "_navigation_Co-createdWikiCopilotAI_svg", "_navigation_others_svg", "_navigation_account_svg", "_navigation_settings_svg", "_navigation_account_svg", "_navigation_settings_svg"];
var navigation_svg = navigation_svg_ids.map(function (navigation_svg_ids) {
    return document.getElementById(navigation_svg_ids);
});

var navigation_b_ids = ["_navigation_fold_b", "_navigation_home_b", "_navigation_lassification_b", "_navigation_components_b", "_navigation_Co-createdWikiCopilotAI_b", "_navigation_others_b", "_navigation_account_b", "_navigation_settings_b"];
var navigation_b = navigation_b_ids.map(function (navigation_b_ids) {
    return document.getElementById(navigation_b_ids);
});

var navigation_tD_ids = ["_navigation_fold_tD", "_navigation_home_tD", "_navigation_lassification_tD", "_navigation_components_tD", "_navigation_Co-createdWikiCopilotAI_tD", "_navigation_others_tD", "_navigation_account_tD", "_navigation_settings_tD"];
var navigation_tD = navigation_tD_ids.map(function (navigation_tD_ids) {
    return document.getElementById(navigation_tD_ids);
});


let mainDiv = document.querySelector(".mainDiv");
let main = document.querySelector(".main");



navigation_fold_t = true;



window.onload = function () {
    // 加载完成，隐藏动画，显示内容
    var id = setTimeout(function function_name() {
        init_loading_logo.style.opacity = "0";
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


