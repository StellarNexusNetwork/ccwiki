function navigation_fold() {
    if (navigation_fold_t == true) {
        mainDiv.style.paddingLeft = "95px";
        navigationBar.style.width = "95px";
        main.style.width = "calc(100vw - 95px)";

        var id = setTimeout(function function_name() {
            for (let key in navigation_tD) {
                navigation_tD[key].style.opacity = 1;
            }
        }, 100);

        main.style.position = "fixed";
        main.style.right = 0;
        var id = setTimeout(function function_name() {
            main.style.position = "";
            main.style.right = "";
        }, 300);

        navigation_fold_t = false;
    } else {
        mainDiv.style.paddingLeft = "";
        navigationBar.style.width = "";
        main.style.width = "";

        for (let key in navigation_tD) {
            navigation_tD[key].style.opacity = "";
        }

        main.style.position = "fixed";
        main.style.right = 0;
        var id = setTimeout(function function_name() {
            main.style.position = "";
            main.style.right = "";
        }, 300);


        navigation_fold_t = true;
    }
}