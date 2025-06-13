import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
// import json from "@eslint/json";
import {defineConfig} from "eslint/config";

export default defineConfig([
  tseslint.configs.recommended,
  {files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"], plugins: {js}, extends: ["js/recommended"]},
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"], languageOptions: {globals: {...globals.browser, ...globals.node}},
    ignores: [
      'dist/',
      'src-tauri/',
      'node_modules/',
      'src/main.ts',
    ],
    rules: {
      // 💫 你设定的风格
      // 把禁止使用 any 改成警告
      '@typescript-eslint/no-explicit-any': 'warn',
      'indent': ['error', 2],
      'quotes': ['warn', 'single'], // 单引号
      'no-var': 'error', // 禁用 var
      'semi': ['error', 'always'], // 必须加分号
      'camelcase': ['error', {properties: 'always'}], // 驼峰命名

      // 💚 Vue 风格
      ...pluginVue.configs['vue3-recommended'],
      'vue/html-indent': ['error', 2],
      "vue/script-indent": "off",
      'vue/component-definition-name-casing': ['error', 'PascalCase'], // 组件定义名 PascalCase
      'vue/match-component-file-name': ['error', {
        extensions: ['.vue'],
        shouldMatchCase: true,
      }],
      'vue/component-name-in-template-casing': ['error', 'PascalCase', {
        registeredComponentsOnly: true,
        ignores: [],
      }],
    },
  },
  pluginVue.configs["flat/essential"],
  {files: ["**/*.vue"], languageOptions: {parserOptions: {parser: tseslint.parser}}},
  // {files: ["**/*.json"], plugins: {json}, language: "json/json", extends: ["json/recommended"]},
]);
