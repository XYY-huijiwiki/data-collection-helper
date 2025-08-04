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
import { GM_setClipboard } from 'vite-plugin-monkey/dist/client'
import maxurl, { add_http } from '@/utils/maxurl'
import template from '@/templates/product_page.mustache?raw'
import mustache from 'mustache'
import { createFileManager } from '@/utils/file-manager'
import { dl } from '@/utils/dl'

const dev = import.meta.env.DEV
let site: 'Taobao' | 'Tmall' = location.hostname.includes('taobao') ? 'Taobao' : 'Tmall'
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

async function getAliItem() {
  try {
    loading.value = true

    // pagename
    productItem.value.pagename =
      productItem.value.pagename ||
      document.title.replace('-淘宝网', '').replace('-tmall.com天猫', '')

    // price
    productItem.value.price =
      productItem.value.price ||
      Number(getTextFromDom('div[class*="subPrice--"] span:nth-child(3)'))

    // link
    let link =
      site === 'Taobao'
        ? new URL('https://item.taobao.com/item.htm')
        : new URL('https://detail.tmall.com/item.htm')
    link.searchParams.set('id', new URLSearchParams(location.search).get('id') || '')

    // brand
    let shopName = getTextFromDom("span[class*='shopName--']")
    let brand =
      (site === 'Taobao'
        ? (data.Taobao2Brand as Record<string, string>)?.[shopName]
        : (data.Tmall2Brand as Record<string, string>)?.[shopName]) ?? shopName

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
    let imgElementList = Array.from(
      document.querySelectorAll("img[class*='thumbnailPic--'], img[class*='valueItemImg--']")
    )
    for (const ele of imgElementList) {
      let src = ele.getAttribute('src')
      if (src) await mainImgManager.addFileByUrl(maxurl(add_http(src)))
    }
    console.log(mainImgManager.listFiles())
    // download imgs
    if (ifDownload.value) {
      await mainImgManager.asyncForEach(dl)
    }
    // wikitext for imgs
    let imgNameStr = mainImgManager
      .listFiles()
      .map((file) => file.filename)
      .join('\n')

    // desc imgs
    let descImgManager = createFileManager({ baseFilename: productItem.value.pagename + ' 描述图' })
    let descElementList = Array.from(document.querySelectorAll('#content img'))
    let descImgBlackList = [
      'http://img.alicdn.com/imgextra/i3/O1CN01XU1Y2d1Sk7fIMOkeU_!!6000000002284-2-tps-1125-1446.png',
      'http://g.alicdn.com/s.gif'
    ] // known non-desc imgs
    for (const ele of descElementList) {
      let src = ele.getAttribute('src')
      if (src) {
        let url = maxurl(add_http(src))
        if (!descImgBlackList.includes(url)) await descImgManager.addFileByUrl(url)
      }
    }
    console.log(descImgManager.listFiles())
    // download desc imgs
    if (ifDownload.value) {
      await descImgManager.asyncForEach(dl)
    }
    // wikitext for desc imgs
    let descImgNameStr = descImgManager
      .listFiles()
      .map((file) => file.filename)
      .join('|')

    code.value = mustache.render(
      template,
      {
        taobaoLink: site === 'Taobao' ? link.toString() : '',
        tmallLink: site === 'Tmall' ? link.toString() : '',
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
  } catch (error) {
    console.error('获取商品信息失败:', error)
    code.value = '获取商品信息失败，请检查控制台错误信息。'
  } finally {
    loading.value = false
  }
}
</script>
