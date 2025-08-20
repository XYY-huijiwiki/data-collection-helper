<template>
  <n-flex vertical>
    <n-form>
      <n-form-item label="页面名称">
        <n-input v-model:value="productItem.pagename" />
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
      <n-button @click="getWeiboItem()" :loading="loading" type="primary" style="width: 100%">
        获取信息
      </n-button>
    </n-form>
    <code-block :code="code" v-show="code" />
  </n-flex>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Ref } from 'vue'
import { data } from '@/json/index'
import { GM_setClipboard } from 'vite-plugin-monkey/dist/client'
import maxurl, { add_https } from '@/utils/maxurl'
import template from '@/templates/product_page.mustache?raw'
import mustache from 'mustache'
import { createFileManager } from '@/utils/file-manager'
import { dl } from '@/utils/dl'
import JSZip from 'jszip'

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

async function getWeiboItem() {
  const mainImgManager = createFileManager()
  const descImgManager = createFileManager()

  // pagename
  productItem.value.pagename = productItem.value.pagename || getTextFromDom('span[class*=_title_]')

  // price
  productItem.value.price =
    productItem.value.price || Number(getTextFromDom('div[class*=_price_] span[class*=_num_]'))

  // link
  let link = new URL(location.href)
  // remove all querys expect `ids`
  let allSearchParamKeys = Array.from(link.searchParams.keys())
  for (let index = 0; index < allSearchParamKeys.length; index++) {
    const element = allSearchParamKeys[index]
    if (element !== 'ids') {
      link.searchParams.delete(element)
    }
  }

  // brand
  let shopName = getTextFromDom('div[class*=_shopSection_] div[class*=_title_]')
  let brand = (data.WB2Brand as Record<string, string>)?.[shopName] || shopName

  // feat
  let series = data['series']
  let defaultFeat = ''
  series.forEach((element) => {
    if (productItem.value.pagename.includes(element)) {
      defaultFeat = element
    }
  })
  productItem.value.feat = productItem.value.feat || defaultFeat

  // main imgs
  let imgElementList = Array.from(
    document.querySelectorAll('div[class*=_swiper_] img[class*=_img_]')
  ).concat(
    Array.from(
      document.querySelectorAll('div[class*=_skuCardWrapper_] div[class*=_colorSpec_] img')
    )
  )
  console.log(imgElementList)
  let imgsURL: string[] = []
  imgElementList.forEach((ele) => {
    let src = ele.getAttribute('src')
    if (src) imgsURL.push(maxurl(add_https(src)))
  })
  // remove duplicate urls
  imgsURL = Array.from(new Set(imgsURL))
  dev && console.log('imgs', imgsURL)
  // store imgs
  for (let index = 0; index < imgsURL.length; index++) {
    const element = imgsURL[index]
    await mainImgManager.addFileByUrl(element, productItem.value.pagename + ' ' + (index + 1))
  }
  // wikitext for imgs
  let imgNameStr = mainImgManager
    .listFiles()
    .map((file) => file.filename)
    .join('\n')

  // desc imgs
  let descElementList = document
    .querySelector('.wrapper')!
    .previousElementSibling!.previousElementSibling!.firstElementChild!.querySelectorAll('img')
  let descImgURL: string[] = []
  descElementList.forEach((ele) => {
    let src = ele.src
    if (src) descImgURL.push(maxurl(add_https(src)))
  })
  // remove duplicate urls
  descImgURL = Array.from(new Set(descImgURL))
  dev && console.log('descImg', descImgURL)
  // store desc imgs
  for (let index = 0; index < descImgURL.length; index++) {
    const element = descImgURL[index]
    await descImgManager.addFileByUrl(
      element,
      productItem.value.pagename + ' 描述图 ' + (index + 1)
    )
  }
  // wikitext for desc imgs
  let descImgNameStr = descImgManager
    .listFiles()
    .map((file) => file.filename)
    .join('|')

  //等待长图加载完毕后输出结果
  code.value = mustache.render(
    template,
    {
      weiboLink: link.toString(),
      price: productItem.value.price,
      brand: brand,
      date: productItem.value.date || '',
      mainImages: imgNameStr,
      descImages: descImgNameStr,
      feature: productItem.value.feat
    },
    {},
    ['<<', '>>']
  )

  // 如果启用了下载图片
  if (ifDownload.value) {
    let zip = JSZip()
    await mainImgManager.asyncForEach(async (file) => {
      await zip.file(file.filename, file.blob)
    })
    await descImgManager.asyncForEach(async (file) => {
      await zip.file(file.filename, file.blob)
    })
    let zipBlob = await zip.generateAsync({ type: 'blob' })
    let zipName = `${productItem.value.pagename}.zip`
    dl(zipBlob, zipName)
  }

  // 如果启用了自动复制，就复制结果
  ifAutoCopy.value ? GM_setClipboard(code.value, 'text/plain') : null

  // 如果启用了跳转百科，就跳转百科
  ifGoToWiki.value
    ? window.open(`//xyy.huijiwiki.com/wiki/${productItem.value.pagename}?action=edit`)
    : null
}
</script>
