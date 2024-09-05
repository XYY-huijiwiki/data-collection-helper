<script setup lang="ts">
import { zhCN, dateZhCN, useOsTheme, darkTheme } from 'naive-ui'
</script>

<template>
  <n-config-provider
    :theme="useOsTheme().value === 'dark' ? darkTheme : null"
    :locale="zhCN"
    :date-locale="dateZhCN"
  >
    <home-view />
  </n-config-provider>
</template>

<style scoped></style>
