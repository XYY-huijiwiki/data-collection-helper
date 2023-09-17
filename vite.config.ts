import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

import vitePluginMonkey, { cdn } from 'vite-plugin-monkey'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [NaiveUiResolver()]
    }),
    vitePluginMonkey({
      entry: 'src/main.ts',
      userscript: {
        author: 'Karsten',
        updateURL:
          `https://cdn.jsdelivr.net/gh/XYY-huijiwiki/data-collection-helper@dist/index.meta.js`,
        downloadURL:
          `https://cdn.jsdelivr.net/gh/XYY-huijiwiki/data-collection-helper@dist/index.user.js`,
        match: [
          'http*://www.youtube.com/playlist*',
          'http*://item.taobao.com/item.htm*',
          'http*://detail.tmall.com/item.htm*',
          'http*://www.mgtv.com/h/*',
          'http*://product.dangdang.com/*'
        ]
      },
      build: {
        externalGlobals: {
          vue: cdn.jsdelivr('Vue', 'dist/vue.global.prod.js'),
          'jquery/dist/jquery.slim': cdn.jsdelivr('jQuery', 'dist/jquery.slim.min.js')
        },
        fileName: 'index.user.js',
        metaFileName: 'index.meta.js'
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
