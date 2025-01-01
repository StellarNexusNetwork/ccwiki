<template>
    <div>
        <button @click="switchLanguage('zh')">中文</button>
        <button @click="switchLanguage('en')">English</button>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { setLocale } from '../../i18n'; // 引入切换语言的函数

// 切换语言的方法
const switchLanguage = async (lang) => {
    await setLocale(lang); // 切换语言
};


</script>