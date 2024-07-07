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
import $ from 'jquery/dist/jquery.slim'
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
  productItem.value.pagename =
    productItem.value.pagename || getTextFromDom("h1[class^='ItemTitle--mainTitle--']")

  // price
  productItem.value.price =
    productItem.value.price || Number(getTextFromDom('span[class^="Price--priceText--"]'))

  // link
  let link = `https://item.taobao.com/item.htm?id=${new URLSearchParams(location.search).get('id')}`

  // imgs (not long img)
  let imgElementList = $("img[class^='PicGallery--thumbnailPic--']")
  let imgs: string[] = []
  imgElementList.each((index, ele) => {
    let src = $(ele).attr('src')
    if (src) imgs.push(src)
  })

  //收集颜色分类的图片
  $(`img.skuIcon`).each((index, ele) => {
    let src = $(ele).attr('src')
    if (src) imgs.push(src)
  })
  //去除重复图片
  imgs = imgs.map((ele) => getAliImgOrgUrl(ele))
  imgs = Array.from(new Set(imgs))
  dev && console.log('imgs', imgs)
  //排序和下载图片
  let imgNameList: string[] = [] //图片的文件名列表
  imgs.forEach((ele, index) => {
    if (ifDownload.value) {
      GM_download('https:' + ele, productItem.value.pagename + (index + 1) + ele.slice(-4))
    }
    imgNameList = imgNameList.concat(productItem.value.pagename + (index + 1) + ele.slice(-4))
  })
  let imgNameStr = imgNameList.join('\n')

  // brand
  let shopName = $("span[class^='ShopHeader--shopName--']").text()
  let brand =
    shopName in json.Taobao2Brand
      ? json.Taobao2Brand[shopName as keyof typeof json.Taobao2Brand]
      : shopName

  // feat
  let series = json['series']
  let defaultFeat = ''
  series.forEach((element) => {
    if ($("h1[class^='ItemTitle--mainTitle--']").text().includes(element)) {
      defaultFeat = element
    }
  })
  productItem.value.feat = productItem.value.feat || defaultFeat

  // long img
  let longImg: string[] = [] //长图的链接列表
  let longImgList: string[] = [] //长图的文件名列表
  let longImgStr = '' //长图的文件名字符串

  $('.descV8-container img').each((index, ele) => {
    let src = $(ele).attr('src')
    if (src && !src.endsWith('?getAvatar=avatar')) {
      longImg.push(getAliImgOrgUrl(src))
    }
  })
  dev && console.log('longImg', longImg)

  //排序和下载长图
  longImg.forEach((ele, index) => {
    if (ifDownload.value) {
      GM_download(
        'https:' + ele,
        productItem.value.pagename + ' 描述图' + (index + 1) + ele.slice(-4)
      )
    }
    longImgList = longImgList.concat(
      productItem.value.pagename + ' 描述图' + (index + 1) + ele.slice(-4)
    )
  })
  longImgStr = longImgList.join('|')

  //等待长图加载完毕后输出结果
  code.value = `{{周边信息\n|版权=\n|尺寸=\n|定价=${
    productItem.value.price
  }\n|货号=\n|链接（京东）=\n|链接（乐乎市集）=\n|链接（奇货）=\n|链接（淘宝）=${link}\n|链接（天猫）=\n|链接（玩具反斗城）=\n|品牌=${brand}\n|日期=${
    productItem.value.date || ''
  }\n|适龄=\n|条码=\n|主题=${
    productItem.value.feat
  }\n}}\n\n<gallery>\n${imgNameStr}\n</gallery>\n\n{{长图|${longImgStr}}}\n`

  // 如果启用了自动复制，就复制结果
  ifAutoCopy.value ? GM_setClipboard(code.value, 'text/plain') : null

  // 如果启用了跳转百科，就跳转百科
  ifGoToWiki.value
    ? window.open(`//xyy.huijiwiki.com/wiki/${productItem.value.pagename}?action=edit`)
    : null
}
</script>
