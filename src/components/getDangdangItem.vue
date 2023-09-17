<template>
  <div>
    <n-space vertical>
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
      <n-space justify="space-between">
        <n-checkbox v-model:checked="ifDownload">下载图片</n-checkbox>
        <n-checkbox v-model:checked="ifAutoCopy">自动复制</n-checkbox>
        <n-checkbox v-model:checked="ifGoToWiki">跳转百科</n-checkbox>
      </n-space>
      <n-code :code="code" word-wrap style="user-select: all" />
    </n-space>
  </div>
</template>

<script setup lang="ts">
import $ from 'jquery/dist/jquery.slim'
import { GM_download, GM_setClipboard } from 'vite-plugin-monkey/dist/client'
import mustache from 'mustache'
import { ref } from 'vue'
import { useMessage } from 'naive-ui'

let message = useMessage()
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
    fullname: prodSpuInfo.productName
  }

  // deal with package, isbn, size, paper
  // get additional info of isSet and setName
  let detail_describe_arr: [string, string][] = []
  $('#detail_describe ul.key.clearfix li').each((i, e) => {
    let string = $(e).text().trim()
    let arr = string.split('：')
    detail_describe_arr.push([arr[0], arr[1]])
  })
  let detail_describe = Object.fromEntries(detail_describe_arr)
  if (detail_describe?.['是否套装'] === '是') {
    message.error('Please do not use this script on set items.')
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
  bookInfo.author = $(`a[dd_name="作者"]`).text().trim()
  bookInfo.publisher = $(`a[dd_name="出版社"]`).text().trim()
  bookInfo.price = $('#original-price').text().trim()
  bookInfo.description = $('#content .descrip').text().trim()
  bookInfo.contents = $('#catalog .descrip').text().trim().replace(/\n/g, '\n* ')

  // deal with samples
  let samples: string[] = []
  $('#attachImage-show-all img').each((i, e) => {
    let link = $(e).attr('src')
    if (!link) {
      message.error(`image not found (${e})`)
      return
    }
    let name = bookInfo.fullname + ' 试读' + (i + 1).toString() + link.slice(link.lastIndexOf('.'))
    samples.push(name)
    ifDownload.value ? GM_download(link, name) : null
  })
  bookInfo.sample = samples.join('\n')

  // deal with images
  // regex comes from https://github.com/qsniyg/maxurl
  let imgURLs: string[] = []
  $(`#main-img-slider img`).each((i, e) => {
    let link = $(e).attr('src')
    if (!link) {
      message.error(`image not found (${e})`)
      return
    }
    let newLink = `http:${link}`
      .replace(
        /(\/[0-9]{2}\/+[0-9]{2}\/+[0-9]+-[0-9]+)_[a-z]_([0-9]+\.[^/.]+)(?:[?#].*)?$/,
        '$1_o_$2'
      )
      .replace(/(:\/\/[^/]+\/+[0-9]+)_[a-z](\.[^/.]+)(?:[?#].*)?$/, '$1$2')
    imgURLs.push(newLink)
  })
  imgURLs = [...new Set(imgURLs)] // remove duplicates imgURL
  imgURLs.forEach((e, i) => {
    let name = bookInfo.fullname + i + e.slice(e.lastIndexOf('.'))
    ifDownload.value ? GM_download(e, name) : null
    if (i === 0) {
      // fist image is mainImage
      bookInfo.mainImage = bookInfo.fullname + e.slice(e.lastIndexOf('.'))
    } else {
      // other images are in images
      bookInfo.images ? bookInfo.images.push(name) : (bookInfo.images = [name])
    }
  })

  // deal with date
  let dateStr = $(`div.messbox_info>span.t1:not([dd_name])`)
    .text()
    .replace(/出版时间:/, '')
    .trim()
  let year = Number(dateStr.match(/([0-9]{4})年/)?.[1]) ?? 1970
  let month = Number(dateStr.match(/([0-9]{1,2})月/)?.[1]) ?? 1
  let day = 1
  bookInfo.date = new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10)

  // end of data getting
  console.log(bookInfo)

  // start of template
  let template = `{{=<% %>=}}
{{出版物信息
<%={{ }}=%>
|图片={{mainImage}}
|书名={{name}}
|全名={{fullname}}
|作者={{author}}
|译者={{translator}}
|编者={{editor}}
|出版={{publisher}}
|定价={{price}}
|日期={{date}}
|开本={{size}}
|尺寸={{dimension}}
|页码={{pages}}
|字数={{words}}
|纸张={{paper}}
|包装={{package}}
|书号={{isbn}}
}}

'''{{fullname}}'''是一本羊羊图书。

{{#description}}
=== 简介 ===
{{description}}{{{ref}}}

{{/description}}
{{#contents}}
=== 目录 ===
* {{contents}}

{{/contents}}
{{#sample}}
=== 试读 ===
<gallery>
{{sample}}
</gallery>

{{/sample}}
{{#gallery}}
=== 图册 ===
<gallery>
{{#images}}
{{.}}
{{/images}}
</gallery>

{{/gallery}}`

  // determine if images exist
  let gallery = bookInfo.images ? true : false
  // render template
  let result = mustache.render(template, { ...bookInfo, gallery })
  // copy to clipboard
  ifAutoCopy.value ? GM_setClipboard(result, 'text/plain') : null
  // go to wiki page
  ifGoToWiki.value ? window.open(`//xyy.huijiwiki.com/wiki/${bookInfo.fullname}`) : null
  // end of template
  code.value = result
}
</script>
