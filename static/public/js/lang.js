import { json2 } from 'static/public/js/init.js';
const { createApp } = Vue

createApp({
    setup() {
        json = get_langJson()
        return {
            unfold: json.navigationBar.unfold
        }
    }
}).mount("#_navigation_fold_tD")