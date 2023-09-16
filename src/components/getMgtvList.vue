<template>
  <div>
    <n-h2>获取视频列表数据</n-h2>
    <n-space>
      <n-button :loading="loading" @click="getMgtvList(`link`)">获取链接</n-button>
      <n-button :loading="loading" @click="getMgtvList(`title`)">获取标题</n-button>
      <n-button :loading="loading" @click="resCode = ``">清空</n-button>
    </n-space>
    <n-code :code="resCode" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { sleep } from "@/utils/sleep";

let res = ref([]);
let resCode = ref(``);
let loading = ref(false);

async function getMgtvList(type: "link" | "title") {
  loading.value = true;

  // 如果已经请求过一次，就把内容存在res里，不用重复请求。
  if (res.value.length == 0) {
    let id = __NUXT__["data"][0]["collection_id"];
    let page = 1;
    let isLastPage = false;
    while (!isLastPage) {
      let response = await fetch(
        `https://pcweb2.api.mgtv.com/episode/list?collection_id=${id}&page=${page}`
      );
      let responseJSON = await response.json();
      page++;
      console.log(`page=${responseJSON['data']['current_page']}`);
      res.value = res.value.concat(responseJSON['data']['list']);
      isLastPage = responseJSON['data']['total_page'] === responseJSON['data']['current_page'];
      await sleep(1000);
    }
  }

  switch (type) {
    case "link":
      resCode.value = res.value.map((item) => `https://www.mgtv.com${item["url"]}`).join("\n");
      break;
    case "title":
      resCode.value = res.value.map((item) => item["t2"]).join("\n");
      break;
    default:
      break;
  }

  loading.value = false;
}
</script>

<style scoped></style>