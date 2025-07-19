import {fileURLToPath, URL} from 'node:url';

import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import Components from 'unplugin-vue-components/vite';
import {PrimeVueResolver} from '@primevue/auto-import-resolver';

// https://vitejs.dev/config/
export default defineConfig({
  //使用自定义域名请禁用此行👇
  //base: process.env.NODE_ENV === 'production' ? '/cc.wiki.project.v4.web2/' : '/',
  plugins: [
    vue(),
    vueJsx(),
    // vueDevTools(),
    Components({
      resolvers: [
        PrimeVueResolver()
      ]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    minify: 'terser',// 使用 Terser 进行 JS 压缩
    terserOptions: {
      compress: {
        drop_console: true, // 移除所有 console.*
        drop_debugger: true, // 移除所有 debugger
        pure_funcs: ['console.log'], // 移除 console.log（被认为是纯函数）
        passes: 2, // 执行两轮压缩优化
      },
      mangle: {
        toplevel: true, // 混淆顶级作用域变量
      },
      format: {
        comments: false, // 移除所有注释
      },
    },
    chunkSizeWarningLimit: 2800, // 设置 chunk 文件大小警告的限制（单位 KB）
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