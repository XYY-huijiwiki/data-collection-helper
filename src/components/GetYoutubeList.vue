<template>
  <div>
    <n-h2>获取视频列表数据</n-h2>
    <n-flex>
      <n-button @click="getYouTubeList(`link`)">获取链接</n-button>
      <n-button @click="getYouTubeList(`title`)">获取标题</n-button>
      <n-button @click="getYouTubeList(`wiki`)">获取wikitext链接</n-button>
      <n-button @click="resCode = ``">清空</n-button>
    </n-flex>
    <n-code :code="resCode" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

let dev = import.meta.env.DEV
let resCode = ref(``)

function getYouTubeList(type: 'link' | 'title' | 'wiki') {
  dev && console.log('正在获取优兔播放列表……')

  // get the DOM list
  let DOMList = document.querySelectorAll('a#video-title')

  // check if the page is ready
  if (!DOMList.length) {
    alert('网页未加载完成。请等待网页加载完毕后再试。')
    return
  }

  // init the result array
  let res: { link: string; title: string; wiki: string }[] = []

  DOMList.forEach((element) => {
    let href = element.getAttribute('href')
    let title = element.getAttribute('title') + ` - YouTube`
    let id = new URLSearchParams(href?.split('?')[1]).get('v')
    let link = 'https://youtu.be/' + id
    let wiki = `[${link} ${title}]`
    res.push({ link, title, wiki })
  })

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

  dev && console.log(res)
  return res
}
</script>
