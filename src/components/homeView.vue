<template>
  <n-drawer
    v-model:show="showDrawer"
    :default-width="480"
    resizable
    placement="right"
    z-index="10002"
    :auto-focus="false"
    display-directive="show"
  >
    <n-drawer-content
      title="羊羊百科小助手"
      closable
      :native-scrollbar="false"
      :scrollbar-props="{ 'x-scrollable': true }"
    >
      <getYouTubeList v-if="currentSite === `优兔`" />
      <getMgtvList v-if="currentSite === `芒果TV`" />
      <getTaobaoItem v-if="currentSite === `淘宝`" />
      <getTianmaoItem v-if="currentSite === `天猫`" />
      <getDangdangItem v-if="currentSite === `当当网`" />

      <template #footer>
        <n-space>
          <n-button
            tag="a"
            href="https://github.com/XYY-huijiwiki/XYY-huijiwiki-helper"
            target="_blank"
            >Github</n-button
          >
          <n-button
            tag="a"
            href="https://club.huijiwiki.com/wiki/特殊:驾驶室#/user/47472"
            target="_blank"
            >羊羊百科</n-button
          >
          <n-button @click="openSettingsModal">设置</n-button>
        </n-space>
      </template>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup lang="ts">
import { useModal } from 'naive-ui'
import { GM_registerMenuCommand } from 'vite-plugin-monkey/dist/client'
import { ref, h } from 'vue'
import hotkeys from 'hotkeys-js'
import settingsView from '@/components/settingsView.vue'

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

GM_registerMenuCommand('打开羊羊百科小助手', () => {
  showDrawer.value = true
})

hotkeys('tab', function (event) {
  event.preventDefault()
  showDrawer.value = true
})

dev && console.log(currentSite)

// settings view
let modal = useModal()
let openSettingsModal = () => {
  modal.create({
    title: '设置',
    preset: 'dialog',
    showIcon: false,
    autoFocus: false,
    zIndex: 10002,
    content: () => h(settingsView)
  })
}
</script>

<style scoped></style>
