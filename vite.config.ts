import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

import vitePluginMonkey from 'vite-plugin-monkey'

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
        name: {
          de: 'Daten-Sammlungs-Helfer',
          en: 'Data Collection Helper',
          zh: '数据采集助手'
        },
        description: {
          de: 'Ein Userscript, das dir hilft, Daten von Webseiten für das XYY Huijiwiki zu sammeln.',
          en: 'A userscript that helps you collect data from web pages for the XYY Huijiwiki.',
          zh: '一个帮助你从网页上采集数据给羊羊百科用的用户脚本。'
        },
        author: 'Karsten',
        source: 'https://github.com/XYY-huijiwiki/data-collection-helper',
        updateURL: `https://xyy-huijiwiki.github.io/data-collection-helper/index.meta.js`,
        downloadURL: `https://xyy-huijiwiki.github.io/data-collection-helper/index.user.js`,
        match: [
          'http*://www.youtube.com/playlist*',
          'http*://item.taobao.com/item.htm*',
          'http*://detail.tmall.com/item.htm*',
          'http*://www.mgtv.com/h/*',
          'http*://product.dangdang.com/*',
          'http*://item.jd.com/*'
        ]
      },
      build: {
        fileName: 'index.user.js',
        metaFileName: 'index.meta.js'
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    minify: true
  }
})
