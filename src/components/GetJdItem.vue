<template>
  <n-flex vertical>
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
      <n-button @click="getJDItem()" :loading="loading" type="primary" style="width: 100%">
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
import { GM_download, GM_setClipboard } from 'vite-plugin-monkey/dist/client'
import maxurl, { add_https } from '@/utils/maxurl'
import template from '@/templates/product_page.mustache?raw'
import mustache from 'mustache'

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

async function getJDItem() {
  // pagename
  productItem.value.pagename =
    productItem.value.pagename || document.title.replace('【图片 价格 品牌 报价】-京东', '')

  // price
  productItem.value.price = productItem.value.price || Number(getTextFromDom('.p-price .price'))

  // link
  let link = new URL(location.href)
  link.hash = ''
  link.search = ''
  // brand
  let shopName = getTextFromDom('.top-name')
  let brand = (data.Jd2Brand as Record<string, string>)?.[shopName] || shopName

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
  let imgElementList = document.querySelectorAll('#spec-list img, #choose-attrs img')
  let imgsURL: string[] = []
  imgElementList.forEach((ele) => {
    let src = ele.getAttribute('src')
    if (src) imgsURL.push(maxurl(add_https(src)))
  })
  // remove duplicate urls
  imgsURL = Array.from(new Set(imgsURL))
  dev && console.log('imgs', imgsURL)
  // order and download imgs
  let imgNameList: string[] = [] //图片的文件名列表
  imgsURL.forEach((ele, index) => {
    if (ifDownload.value) {
      GM_download(ele, productItem.value.pagename + (index + 1) + ele.slice(-4))
    }
    imgNameList = imgNameList.concat(productItem.value.pagename + (index + 1) + ele.slice(-4))
  })
  // wikitext for imgs
  let imgNameStr = imgNameList.join('\n')

  // desc imgs
  let descElementList = document.querySelectorAll('.ssd-module')
  let descImgURL: string[] = []
  descElementList.forEach((ele) => {
    let src = window
      .getComputedStyle(ele)
      .getPropertyValue('background-image')
      .replace(/^url\(["']?/, '')
      .replace(/["']?\)$/, '')
    if (src) descImgURL.push(maxurl(add_https(src)))
  })
  // remove duplicate urls
  descImgURL = Array.from(new Set(descImgURL))
  // remove known non-desc imgs
  let descImgBlackList = [
    'https://img30.360buyimg.com/sku/jfs/t1/281576/6/14880/55331/67efa61eF975f3a83/85612570306a1f9c.jpg.avif',
    'https://img30.360buyimg.com/sku/jfs/t1/284997/18/14510/30069/67efa61eF9546b437/39ee61abf5636a32.jpg.avif'
  ]
  descImgBlackList.forEach((ele) => {
    descImgURL = descImgURL.filter((url) => url !== maxurl(add_https(ele)))
  })
  dev && console.log('descImg', descImgURL)
  // order and download desc imgs
  let descImgNameList: string[] = [] //图片的文件名列表
  descImgURL.forEach((ele, index) => {
    if (ifDownload.value) {
      GM_download(ele, productItem.value.pagename + ' 描述图' + (index + 1) + ele.slice(-4))
    }
    descImgNameList = descImgNameList.concat(
      productItem.value.pagename + ' 描述图' + (index + 1) + ele.slice(-4)
    )
  })
  // wikitext for desc imgs
  let descImgNameStr = descImgNameList.join('|')

  //等待长图加载完毕后输出结果
  code.value = mustache.render(
    template,
    {
      jdLink: link.toString(),
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

  // 如果启用了自动复制，就复制结果
  ifAutoCopy.value ? GM_setClipboard(code.value, 'text/plain') : null

  // 如果启用了跳转百科，就跳转百科
  ifGoToWiki.value
    ? window.open(`//xyy.huijiwiki.com/wiki/${productItem.value.pagename}?action=edit`)
    : null
}
</script>
