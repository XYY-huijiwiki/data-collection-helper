<script setup lang="ts">
import { zhCN, dateZhCN, useOsTheme, darkTheme } from 'naive-ui'
</script>

<template>
  <n-config-provider
    :theme="useOsTheme().value === 'dark' ? darkTheme : null"
    :locale="zhCN"
    :date-locale="dateZhCN"
  >
    <n-message-provider
      container-style="z-index: 10020"
      keep-alive-on-hover
      placement="top-right"
    >
      <n-modal-provider>
        <home-view />
      </n-modal-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<style scoped></style>
