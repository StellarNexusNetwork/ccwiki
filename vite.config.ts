import {fileURLToPath, URL} from 'node:url'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig({
    //使用自定义域名请禁用此行👇
    //base: process.env.NODE_ENV === 'production' ? '/cc.wiki.project.v4.web2/' : '/',
    plugins: [
        vue(),
        vueJsx(),
        // vueDevTools(),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    build: {
        rollupOptions: {
            output: {
                entryFileNames: 'assets/js/[name]-[hash].js',
                chunkFileNames: 'assets/js/[name]-[hash].js',
                assetFileNames: 'assets/css/[name]-[hash].css',
            },
            plugins: [
                // 在这里添加 wasm 插件
                // wasm({
                //     include: /\.wasm$/i // 这里可能需要调整为你的文件路径和名称
                // })
            ]
        }
    }
    // },
    // devServer: {
    //   proxy: {
    //     '/api': {
    //       target: 'http://127.0.0.1:5000',
    //       changeOrigin: true,
    //     }
    //   }
    // }
})
