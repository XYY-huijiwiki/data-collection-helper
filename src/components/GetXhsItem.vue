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
      <n-button @click="getXhsItem()" :loading="loading" type="primary" style="width: 100%">
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
import ky from 'ky'

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

async function getXhsItem() {
  try {
    loading.value = true

    const itemId = location.pathname.match(/\/goods-detail\/(\w+)/)?.[1]
    if (!itemId) {
      throw new Error('无法获取小红书商品ID')
    }
    const itemData = await ky
      .get<any>(
        `https://mall.xiaohongshu.com/api/store/jpd/edith/detail/h5/toc?version=0.0.5&item_id=${itemId}`,
        {}
      )
      .json()

    // pagename
    productItem.value.pagename =
      productItem.value.pagename || itemData.data.template_data[0].descriptionH5.name

    // price
    productItem.value.price = itemData.data.template_data[0].bottomBarMainH5.price / 100

    // link
    let link = `https://www.xiaohongshu.com/goods-detail/${itemId}`

    // brand
    let shopName = itemData.data.template_data[0].sellerH5.name
    let brand = (data.Xhs2Brand as Record<string, string>)?.[shopName] ?? shopName

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
    let imgElementList = itemData.data.template_data[0].carouselH5.images
    for (const ele of imgElementList) {
      let url = new URL(add_https(ele.url))
      // remove all query parameters
      url.search = ''
      console.log(url)
      await mainImgManager.addFileByUrl(url.href)
    }
    console.log(mainImgManager.listFiles())
    // wikitext for imgs
    let imgNameStr = mainImgManager
      .listFiles()
      .map((file) => file.filename)
      .join('\n')

    // // desc imgs
    let descImgManager = createFileManager({ baseFilename: productItem.value.pagename + ' 描述图' })
    let descElementList = itemData.data.template_data[0].graphicDetailsV4.images
    for (const ele of descElementList) {
      let url = new URL(add_https(ele.url))
      // remove all query parameters
      url.search = ''
      console.log(url)
      await descImgManager.addFileByUrl(url.href)
    }
    // wikitext for desc imgs
    let descImgNameStr = descImgManager
      .listFiles()
      .map((file) => file.filename)
      .join('|')

    code.value = mustache.render(
      template,
      {
        xhsLink: link,
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
  } catch (error) {
    code.value = '获取商品信息失败，请检查控制台错误信息。'
    throw error
  } finally {
    loading.value = false
  }
}
</script>
