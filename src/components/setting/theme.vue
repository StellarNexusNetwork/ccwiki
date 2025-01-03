<template>
    <div>
        <button @click="">亮色</button>
        <button @click="">暗色</button>
        <button @click="resetTheme()">默认</button>
        <button @click="changeTheme('NewYear')">新年</button>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { i18n_theme, theme_default } from '@/main';

const root = document.documentElement;

function resetTheme() {
    i18n_theme.global.locale.value = 'theme_default'
    Object.entries(theme_default.color).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
    });
}

async function changeTheme(name) {
    let theme_current = {};
    try {
        const res = await fetch('/theme/' + name + '/package.json');
        theme_current = await res.json();
        i18n_theme.global.setLocaleMessage('theme_current', theme_current);
        i18n_theme.global.locale.value = 'theme_current';
        Object.entries(theme_current.color).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key}`, value);
        });
    } catch (error) {
        console.error("Failed to load theme:", error);
    }
}

</script>