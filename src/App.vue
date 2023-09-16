<script setup lang="ts">
import { zhCN, dateZhCN, useOsTheme, darkTheme } from 'naive-ui'
import { ref } from 'vue'

let showDrawer = ref(false)

let currentSite = "";
if (location.href.match(/www.youtube.com\/playlist*/)) {
  currentSite = "优兔";
}
if (location.href.match(/item.taobao.com\/item.htm*/)) {
  currentSite = "淘宝";
}
if (location.href.match(/detail.tmall.com\/item.htm*/)) {
  currentSite = "天猫";
}
if (location.href.match(/www.mgtv.com\/h\/*/)) {
  currentSite = "芒果TV";
}

console.log(currentSite);

</script>

<template>
  <n-config-provider :theme="useOsTheme().value === 'dark' ? darkTheme : null" :locale="zhCN" :date-locale="dateZhCN">
    <n-button type="primary" circle size="large" class="float-button" @click="showDrawer = true">按钮</n-button>
    <n-drawer v-model:show="showDrawer" :default-width="480" resizable placement="right" :z-index="100000021"
      :auto-focus="false">
      <n-drawer-content title="羊羊百科小助手" closable :native-scrollbar="false" :scrollbar-props="{ 'x-scrollable': 'true' }">

        <getYouTubeList v-if="currentSite === `优兔`" />
        <getMgtvList v-if="currentSite === `芒果TV`" />
        <getTaobaoItem v-if="currentSite === `淘宝`" />
        <getTianmaoItem v-if="currentSite === `天猫`" />

        <template #footer>
          <n-space>
            <n-button tag="a" href="https://github.com/XYY-huijiwiki/XYY-huijiwiki-helper"
              target="_blank">Github</n-button>
            <n-button tag="a" href="https://club.huijiwiki.com/wiki/特殊:驾驶室#/user/47472" target="_blank">羊羊百科</n-button>
            <n-button disabled>设置</n-button>
          </n-space>
        </template>
      </n-drawer-content>
    </n-drawer>
  </n-config-provider>
</template>