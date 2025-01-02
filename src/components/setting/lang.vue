<template>
    <div>
        <button @click="setLocale('zh_cn')">中文</button>
        <button @click="setLocale('en_us')">English</button>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();
// 切换语言的函数
const setLocale = (lang) => {
    locale.value = lang;
};


</script>