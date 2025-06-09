import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  },
  server: {
    proxy: {
      '^/\\d+/.*': {
        target: 'https://kojinvest.ru',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
   /*   '^/calc.json.*': {
        target: 'https://kojinvest.ru',
        changeOrigin: true,
        secure: false,
        ws: true,
      },*/
      '^/get_by_article.php.*': {
        target: 'https://kojinvest.ru',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      '/assets/': {
        target: 'https://kojinvest.ru',
        changeOrigin: true,
        secure: false,
        ws: true,
      },


    }
  }
})
