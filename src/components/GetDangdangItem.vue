<template>
    <n-flex vertical>
      <n-alert :show-icon="false">
        使用前请先将页面滑动到底部，等待页面彻底加载完毕。如果有试读部分，还需要先点击“显示全部信息”。
      </n-alert>
      <n-input-group>
        <n-input
          v-model:value="fullname"
          placeholder="Input book's title if the original one isn't suitable."
        />
        <n-button @click="getDangdangItem()">获取信息</n-button>
      </n-input-group>
      <n-flex justify="space-between">
        <n-checkbox v-model:checked="ifDownload">下载图片</n-checkbox>
        <n-checkbox v-model:checked="ifAutoCopy">自动复制</n-checkbox>
        <n-checkbox v-model:checked="ifGoToWiki">跳转百科</n-checkbox>
      </n-flex>
      <code-block :code="code"/>
    </n-flex>
</template>

<script setup lang="ts">
import { GM_download, GM_setClipboard } from 'vite-plugin-monkey/dist/client'
import mustache from 'mustache'
import { ref } from 'vue'
import template from '@/templates/getDangdangItem.mustache?raw'
let dev = import.meta.env.DEV
dev && console.log(template)

let code = ref('') // code to be shown
let ifDownload = ref(false) // if download needed images
let ifAutoCopy = ref(false) // if auto copy code after getting
let ifGoToWiki = ref(false) // if go to wiki page after getting code and copy (if auto copy)
let fullname = ref('') // fullname of book

async function getDangdangItem() {
  // start of data getting

  // init bookInfo
  let bookInfo: BookInfo = {
    ref: `<ref>[${location.href} ${document.title}]</ref>`,
    fullname: fullname.value || prodSpuInfo.productName
  }

  // deal with package, isbn, size, paper
  // get additional info of isSet and setName
  let detail_describe_arr: [string, string][] = []
  document.querySelectorAll('#detail_describe ul.key.clearfix li').forEach((e) => {
    let string = e.textContent?.trim()
    if (!string?.match(/：/)) {
      console.warn(`no colon matched`)
    } else {
      let [key, value] = string.split('：')
      detail_describe_arr.push([key, value])
    }
  })
  let detail_describe = Object.fromEntries(detail_describe_arr)
  if (detail_describe?.['是否套装'] === '是') {
    alert('Please do not use this script on set items.')
    return
  }
  bookInfo.size = detail_describe?.['开 本']
  bookInfo.paper = detail_describe?.['纸 张']
  bookInfo.package = detail_describe?.['包 装']
  bookInfo.isbn = detail_describe?.['国际标准书号ISBN']

  // deal with, name, author, publisher, price, description, contents
  bookInfo.name = bookInfo.fullname
    .replace(detail_describe?.[`丛书名`], '')
    .replace(/：| |:|·/, '')
    .trim()
  bookInfo.author = document.querySelector('span[dd_name="作者"]')?.textContent?.trim().slice(3) // string for the author starts with `作者：` which has 3 characters to be removed
  bookInfo.publisher = document.querySelector('a[dd_name="出版社"]')?.textContent?.trim()
  bookInfo.price = document.querySelector('#original-price')?.textContent?.trim()
  bookInfo.description = document.querySelector('#content .descrip')?.textContent?.trim()
  bookInfo.contents = document
    .querySelector('#catalog .descrip')
    ?.textContent?.trim()
    .replace(/\n/g, '\n* ')

  // deal with samples
  let samples: string[] = []
  document.querySelectorAll('#attachImage-show-all img').forEach((e, i) => {
    let link = e.getAttribute('src')
    if (!link) {
      console.error(`image not found (${e})`)
      return
    }
    let name = bookInfo.fullname + ' 试读' + (i + 1).toString() + link.slice(link.lastIndexOf('.'))
    samples.push(name)
    ifDownload.value ? GM_download(link, name) : null
  })
  bookInfo.sample = samples.join('\n')

  // deal with images
  let imgURLs: string[] = []
  document.querySelectorAll('#main-img-slider img').forEach((e) => {
    let link = e.getAttribute('src')
    if (!link) {
      console.warn(`image not found (${e})`)
    } else {
      let newLink = `https:${link}`.replace('_x_', '_u_')
      imgURLs.push(newLink)
    }
  })
  imgURLs = [...new Set(imgURLs)] // remove duplicates imgURL
  let imgNames: string[] = []
  imgURLs.forEach((e, i) => {
    if (i === 0) {
      // fist image is mainImage
      bookInfo.mainImage = bookInfo.fullname + e.slice(e.lastIndexOf('.'))
      ifDownload.value ? GM_download(e, bookInfo.mainImage) : null
    } else {
      // other images are in images
      let name = bookInfo.fullname + i + e.slice(e.lastIndexOf('.'))
      imgNames.push(name)
      ifDownload.value ? GM_download(e, name) : null
    }
  })
  bookInfo.gallery = imgNames.join('\n')

  // deal with date
  let dateStr = document
    .querySelector('div.messbox_info > span.t1:not([dd_name])')
    ?.textContent?.replace(/出版时间:/, '')
    .trim()
  if (!dateStr) {
    console.warn(`date not found`)
  } else {
    let year = Number(dateStr.match(/([0-9]{4})年/)?.[1]) || 1970
    let month = Number(dateStr.match(/([0-9]{1,2})月/)?.[1]) || 1
    let day = 1
    bookInfo.date = new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10)
  }

  // end of data getting
  dev && console.log(bookInfo)

  // start of template
  // render template
  let result = mustache.render(template, bookInfo).trim()
  // copy to clipboard
  ifAutoCopy.value ? GM_setClipboard(result, 'text/plain') : null
  // go to wiki page
  ifGoToWiki.value ? window.open(`//xyy.huijiwiki.com/wiki/${bookInfo.fullname}?action=edit`) : null
  // end of template
  code.value = result
}
</script>
