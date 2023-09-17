<template>
  <div>
    <n-h2>获取视频列表数据</n-h2>
    <n-space>
      <n-button @click="getYouTubeList(`link`)">获取链接</n-button>
      <n-button @click="getYouTubeList(`title`)">获取标题</n-button>
      <n-button @click="getYouTubeList(`wiki`)">获取wikitext链接</n-button>
      <n-button @click="resCode = ``">清空</n-button>
    </n-space>
    <n-code :code="resCode" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import $ from 'jquery/dist/jquery.slim'

let resCode = ref(``)

function getYouTubeList(type: 'link' | 'title' | 'wiki') {
  console.log('正在获取优兔播放列表……')

  // get the DOM list
  let DOMList = $('a#video-title')

  // check if the page is ready
  if (!DOMList.length) {
    alert('网页未加载完成。请等待网页加载完毕后再试。')
    return
  }

  // init the result array
  let res = []

  for (let index = 0; index < DOMList.length; index++) {
    const element = DOMList[index]
    let id = ($(element).attr('href') as string).match(/v=(.*?)&/)![1]
    let link = 'https://youtu.be/' + id
    let title = $(element).attr('title') + ` - YouTube`
    let wiki = `[${link} ${title}]`
    res.push({ link, title, wiki })
  }

  switch (type) {
    case 'link':
      resCode.value = res.map((i) => i.link).join('\n')
      break
    case 'title':
      resCode.value = res.map((i) => i.title).join('\n')
      break
    case 'wiki':
      resCode.value = res.map((i) => i.wiki).join('\n')
      break
  }

  console.log(res)
  return res
}
</script>
