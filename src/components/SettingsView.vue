<template>
  <n-form style="margin-top: 1em">
    <n-form-item label="用户名">
      <n-input v-model:value="config.userName" />
    </n-form-item>
    <n-form-item label="密码">
      <n-input v-model:value="config.password" />
    </n-form-item>
  </n-form>
  <n-button type="primary" @click="saveConfig" style="float: right">保存</n-button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { GM_listValues, GM_setValue, GM_getValue } from 'vite-plugin-monkey/dist/client'
import { useMessage } from 'naive-ui'

let dev = import.meta.env.DEV
dev && console.log(GM_listValues())

let config = ref({
  userName: String(GM_getValue('userName')) || '',
  password: String(GM_getValue('password')) || ''
})

let message = useMessage()
function saveConfig() {
  GM_setValue('userName', config.value.userName)
  GM_setValue('password', config.value.password)
  message.success('保存成功')
}
</script>

<style scoped></style>
