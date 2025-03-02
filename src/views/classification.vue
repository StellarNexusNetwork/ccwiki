<template>
    <button @click="hello('https://api.github.com/repos/StellarNexusNetwork/cc.wiki.project.v4.data/contents/d0')">hello</button>
    <button @click="hello('https://data.ccwiki.snnetwork.us.kg/d0/1.json')">hello2</button>
</template>
<script setup lang="ts">
import axios from 'axios'
function hello(url: string) {
    axios.get(url)
        .then(function (response) {
            // 处理成功情况
            console.log(response);
            console.log(typeof response);
        })
        .catch(function (error) {
            // 处理错误情况
            console.log(error);
        })
}
</script>
<style scoped></style>