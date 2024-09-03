<template>
  <div>
    <n-space vertical>
      <n-alert :show-icon="false" title="获取商品数据">
        使用下列功能时请务必先手动滑动至页面底部，确保描述图完全加载完毕。
      </n-alert>
      <n-form>
        <n-form-item label="页面名称">
          <n-input v-model:value="productItem.pagename" />
        </n-form-item>
        <n-form-item label="原价价格" required>
          <n-input-number
            v-model:value="productItem.price"
            :show-button="false"
            style="flex-grow: 1"
          />
        </n-form-item>
        <n-form-item label="发售日期" required>
          <n-date-picker
            v-model:formatted-value="productItem.date"
            value-format="yyyy-MM-dd"
            type="date"
            clearable
            style="flex-grow: 1"
          />
        </n-form-item>
        <n-form-item label="其他设置">
          <n-checkbox v-model:checked="ifDownload" style="flex-grow: 1"> 下载图片 </n-checkbox>
          <n-checkbox v-model:checked="ifAutoCopy" style="flex-grow: 1"> 自动复制 </n-checkbox>
          <n-checkbox v-model:checked="ifGoToWiki" style="flex-grow: 1"> 跳转百科 </n-checkbox>
        </n-form-item>
        <n-button @click="getTaobaoItem()" :loading="loading" type="primary" style="width: 100%">
          获取信息
        </n-button>
      </n-form>
      <n-code :code="code" word-wrap style="user-select: all" />
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Ref } from 'vue'
import json from '@/json/index.json'
import { GM_download, GM_setClipboard } from 'vite-plugin-monkey/dist/client'
import getAliImgOrgUrl from '@/utils/getAliImgOrgUrl'

const dev = import.meta.env.DEV
let code = ref('')
let loading = ref(false)
let productItem: Ref<{
  pagename: string
  price: number | undefined
  date: string | null
  feat: string
}> = ref({
  pagename: '',
  price: undefined,
  date: null,
  feat: ''
})
let ifDownload = ref(false)
let ifAutoCopy = ref(false)
let ifGoToWiki = ref(false)

function getTextFromDom(selector: string): string {
  return document.querySelector(selector)?.textContent || ''
}

async function getTaobaoItem() {
  // pagename
  productItem.value.pagename = productItem.value.pagename || document.title.replace('-淘宝网', '')

  // price
  productItem.value.price =
    productItem.value.price || Number(getTextFromDom('span[class^="priceText--"]'))

  // link
  let link = `https://item.taobao.com/item.htm?id=${new URLSearchParams(location.search).get('id')}`

  // brand
  let shopName = getTextFromDom("span[class^='shopName--']")
  let brand =
    shopName in json.Taobao2Brand
      ? json.Taobao2Brand[shopName as keyof typeof json.Taobao2Brand]
      : shopName

  // feat
  let series = json['series']
  let defaultFeat = ''
  series.forEach((element) => {
    if (getTextFromDom("h1[class^='mainTitle--']").includes(element)) {
      defaultFeat = element
    }
  })
  productItem.value.feat = productItem.value.feat || defaultFeat

  // imgs
  let imgElementList = document.querySelectorAll(
    "img[class^='thumbnailPic--'], img[class^='valueItemImg--']"
  )
  let imgsURL: string[] = []
  imgElementList.forEach((ele) => {
    let src = ele.getAttribute('src')
    if (src) imgsURL.push(getAliImgOrgUrl(src))
  })
  // remove duplicate urls
  imgsURL = Array.from(new Set(imgsURL))
  dev && console.log('imgs', imgsURL)
  // order and download imgs
  let imgNameList: string[] = [] //图片的文件名列表
  imgsURL.forEach((ele, index) => {
    if (ifDownload.value) {
      GM_download('https:' + ele, productItem.value.pagename + (index + 1) + ele.slice(-4))
    }
    imgNameList = imgNameList.concat(productItem.value.pagename + (index + 1) + ele.slice(-4))
  })
  // wikitext for imgs
  let imgNameStr = imgNameList.join('\n')

  // desc
  let descElementList = document.querySelectorAll('#content img')
  let descImgURL: string[] = []
  descElementList.forEach((ele) => {
    let src = ele.getAttribute('src')
    if (src) descImgURL.push(getAliImgOrgUrl(src))
  })
  // remove duplicate urls
  descImgURL = Array.from(new Set(descImgURL))
  dev && console.log('descImg', descImgURL)
  // order and download desc imgs
  let descImgNameList: string[] = [] //图片的文件名列表
  descImgURL.forEach((ele, index) => {
    if (ifDownload.value) {
      GM_download(
        'https:' + ele,
        productItem.value.pagename + ' 描述图' + (index + 1) + ele.slice(-4)
      )
    }
    descImgNameList = descImgNameList.concat(
      productItem.value.pagename + ' 描述图' + (index + 1) + ele.slice(-4)
    )
  })
  // wikitext for desc imgs
  let descImgNameStr = descImgNameList.join('|')

  //等待长图加载完毕后输出结果
  code.value = `{{周边信息\n|版权=\n|尺寸=\n|定价=${
    productItem.value.price
  }\n|货号=\n|链接（京东）=\n|链接（乐乎市集）=\n|链接（奇货）=\n|链接（淘宝）=${link}\n|链接（天猫）=\n|链接（玩具反斗城）=\n|品牌=${brand}\n|日期=${
    productItem.value.date || ''
  }\n|适龄=\n|条码=\n|主题=${
    productItem.value.feat
  }\n}}\n\n<gallery>\n${imgNameStr}\n</gallery>\n\n{{长图|${descImgNameStr}}}\n`

  // 如果启用了自动复制，就复制结果
  ifAutoCopy.value ? GM_setClipboard(code.value, 'text/plain') : null

  // 如果启用了跳转百科，就跳转百科
  ifGoToWiki.value
    ? window.open(`//xyy.huijiwiki.com/wiki/${productItem.value.pagename}?action=edit`)
    : null
}
</script>
