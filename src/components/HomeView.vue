<template>
  <n-drawer
    v-model:show="showDrawer"
    :default-width="480"
    resizable
    placement="right"
    :z-index="10020"
    :auto-focus="false"
    display-directive="show"
  >
    <n-drawer-content title="羊羊百科小助手" closable :native-scrollbar="false">
      <get-youtube-list v-if="currentSite === `优兔`" />
      <get-mgtv-list v-if="currentSite === `芒果TV`" />
      <get-ali-item v-if="currentSite === `淘宝` || currentSite === `天猫`" />
      <get-dangdang-item v-if="currentSite === `当当网`" />
      <get-jd-item v-if="currentSite === `京东`" />
      <get-weibo-item v-if="currentSite === `微博`" />

      <template #footer>
        <n-flex>
          <n-button
            tag="a"
            href="https://github.com/XYY-huijiwiki/data-collection-helper"
            target="_blank"
          >
            Github
          </n-button>
          <n-button disabled>设置</n-button>
        </n-flex>
      </template>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup lang="ts">
import { GM_registerMenuCommand } from 'vite-plugin-monkey/dist/client'
import { ref } from 'vue'

let dev = import.meta.env.DEV
let showDrawer = ref(false)

let currentSite = ''
if (location.href.match(/www.youtube.com\/playlist*/)) {
  currentSite = '优兔'
}
if (location.href.match(/item.taobao.com\/item.htm*/)) {
  currentSite = '淘宝'
}
if (location.href.match(/detail.tmall.com\/item.htm*/)) {
  currentSite = '天猫'
}
if (location.href.match(/www.mgtv.com\/h\/*/)) {
  currentSite = '芒果TV'
}
if (location.host === 'product.dangdang.com') {
  currentSite = '当当网'
}
if (location.href.match(/item.jd.com\/*/)) {
  currentSite = '京东'
}
if (location.href.match(/shop.e.weibo.com\/*/)) {
  currentSite = '微博'
}

GM_registerMenuCommand('打开羊羊百科小助手', () => {
  showDrawer.value = true
})

document.addEventListener('keydown', function (event) {
  if (event.key === 'Tab') {
    event.preventDefault()
    showDrawer.value = !showDrawer.value
  }
})

dev && console.log(currentSite)
</script>

<style scoped></style>
