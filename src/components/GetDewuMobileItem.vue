<template>
  <n-flex vertical>
    <n-alert :show-icon="false" title="获取商品数据">
      使用下列功能时请务必先手动滑动至页面底部，确保描述图完全加载完毕。
    </n-alert>
    <n-form>
      <n-form-item label="页面名称">
        <n-input v-model:value="productItem.pagename" />
      </n-form-item>
      <n-form-item label="品牌">
        <n-input v-model:value="productItem.brand" />
      </n-form-item>
      <n-form-item label="其他设置">
        <n-checkbox v-model:checked="ifDownload" style="flex-grow: 1"> 下载图片 </n-checkbox>
        <n-checkbox v-model:checked="ifAutoCopy" style="flex-grow: 1"> 自动复制 </n-checkbox>
        <n-checkbox v-model:checked="ifGoToWiki" style="flex-grow: 1"> 跳转百科 </n-checkbox>
      </n-form-item>
      <n-button @click="getAliItem()" :loading="loading" type="primary" style="width: 100%">
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
import { GM_setClipboard, GM_download } from 'vite-plugin-monkey/dist/client'
import maxurl, { add_https } from '@/utils/maxurl'
import template from '@/templates/product_page.mustache?raw'
import mustache from 'mustache'
import { createFileManager } from '@/utils/file-manager'
import JSZip from 'jszip'
import dayjs from '@/utils/dayjs'

const dev = import.meta.env.DEV
let code = ref('')
let loading = ref(false)
let productItem: Ref<{
  pagename: string
  feat: string
  brand: string
}> = ref({
  pagename: '',
  feat: '',
  brand: ''
})
let ifDownload = ref(false)
let ifAutoCopy = ref(false)
let ifGoToWiki = ref(false)

function getTextFromDom(selector: string): string {
  return document.querySelector(selector)?.textContent || ''
}

async function getAliItem() {
  try {
    loading.value = true

    // pagename
    productItem.value.pagename =
      productItem.value.pagename ||
      getTextFromDom('div[class*=_container_] .dulinkflag div[class*=_title_]')

    // price
    let price = (() => {
      const priceLabel = Array.from(document.querySelectorAll('span')).find(
        (el) => el.className.includes('_itemTitle_') && el.textContent?.trim() === '发售价格'
      )
      if (!priceLabel) return undefined
      const priceValue = priceLabel.nextElementSibling?.textContent?.replace(/[^\d.]/g, '')
      return priceValue ? Number(priceValue) : undefined
    })()

    // ageGroup
    let ageGroup = (() => {
      const ageLabel = Array.from(document.querySelectorAll('span')).find(
        (el) => el.className.includes('_itemTitle_') && el.textContent?.trim() === '适用年龄'
      )
      if (!ageLabel) return undefined
      const ageValue = ageLabel.nextElementSibling?.textContent?.trim()
      return ageValue || undefined
    })()

    // link
    let link = (() => {
      const url = new URL(window.location.href)
      const spuId = url.searchParams.get('spuId')
      return spuId ? `https://www.dewu.com/product-detail.html?spuId=${spuId}` : ''
    })()

    // date
    let date = (() => {
      const dateLabel = Array.from(document.querySelectorAll('span[class*=_itemTitle_]')).find(
        (el) => el.textContent === '发售日期'
      )
      if (!dateLabel) return undefined
      const dateValue = `${dayjs(dateLabel.nextElementSibling?.textContent?.trim()).format('ll')}<ref>${link}</ref>`
      return dateValue || undefined
    })()

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
    let mainImgManager = createFileManager({ baseFilename: productItem.value.pagename })
    let imgElementList = [
      ...Array.from(document.querySelectorAll("img[class*='_carouselImg_']")),
      ...Array.from(document.querySelectorAll("img[class*='_scrollImg_']"))
    ]
    for (const ele of imgElementList) {
      let src = ele.getAttribute('src')
      if (src) await mainImgManager.addFileByUrl(maxurl(add_https(src)))
    }
    console.log(mainImgManager.listFiles())
    // wikitext for imgs
    let imgNameStr = mainImgManager
      .listFiles()
      .map((file) => file.filename)
      .join('\n')

    // desc imgs
    let descImgManager = createFileManager({ baseFilename: productItem.value.pagename + ' 描述图' })
    let descElementList = Array.from(
      document.querySelectorAll('div[class*="_modelContainer_"] img')
    )
    for (const ele of descElementList) {
      let src = ele.getAttribute('src')
      if (src) {
        let url = maxurl(add_https(src))
        await descImgManager.addFileByUrl(url)
      }
    }
    console.log(descImgManager.listFiles())
    // wikitext for desc imgs
    let descImgNameStr = descImgManager
      .listFiles()
      .map((file) => file.filename)
      .join('|')

    code.value = mustache.render(
      template,
      {
        dewuLink: link,
        price: price,
        brand: productItem.value.brand,
        date: date || '',
        mainImages: imgNameStr,
        descImages: descImgNameStr,
        feature: productItem.value.feat,
        references: true,
        ageGroup: ageGroup || ''
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
      GM_download(URL.createObjectURL(zipBlob), zipName)
    }

    // 如果启用了自动复制，就复制结果
    ifAutoCopy.value ? GM_setClipboard(code.value, 'text/plain') : null

    // 如果启用了跳转百科，就跳转百科
    ifGoToWiki.value
      ? window.open(`//xyy.huijiwiki.com/wiki/${productItem.value.pagename}?action=edit`)
      : null
  } catch (error) {
    code.value = '获取商品信息失败，请检查控制台错误信息。'
    throw error
  } finally {
    loading.value = false
  }
}
</script>
