import {fileURLToPath, URL} from 'node:url'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig({
    // base: process.env.NODE_ENV === 'production' ? '/cc.wiki.project.v4.web2/' : '/',
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
            }
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
