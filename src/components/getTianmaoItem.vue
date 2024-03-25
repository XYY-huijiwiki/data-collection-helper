<template>
  <div>
    <n-space vertical>
      <n-alert :show-icon="false" title="获取商品数据">
        使用下列功能时请务必先手动滑动至页面底部，确保描述图完全加载完毕。
      </n-alert>
      <n-input-group>
        <n-input v-model:value="productItem.pagename" placeholder="page title/product name" />
        <n-date-picker
          v-model:formatted-value="productItem.date"
          value-format="yyyy-MM-dd"
          type="date"
          clearable
        />
        <n-button @click="getTianmaoItem()" :loading="loading"> 获取信息 </n-button>
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
import { ref } from 'vue'
import json from '@/json/index.json'
import { GM_download, GM_setClipboard } from 'vite-plugin-monkey/dist/client'
import $ from 'jquery/dist/jquery.slim'

let dev = import.meta.env.DEV
let code = ref('')
let loading = ref(false)
let productItem = ref({
  pagename: '',
  price: '',
  date: null,
  feat: ''
})
let ifDownload = ref(false)
let ifAutoCopy = ref(false)
let ifGoToWiki = ref(false)

async function getTianmaoItem() {
  // 开启加载动画
  loading.value = true

  productItem.value.pagename = productItem.value.pagename || '页面名称'
  productItem.value.price =
    productItem.value.price ||
    $('[class^=Price--originPrice] [class^=Price--priceText--2nLbVda]').text()

  //加载主题信息
  let series = json['series']
  let defaultFeat = ''
  series.forEach((element) => {
    if ($('[class^=ItemHeader--mainTitle]').text().includes(element)) {
      defaultFeat = element
    }
  })
  productItem.value.feat = productItem.value.feat || defaultFeat

  //加载品牌信息
  let shopName = $('[class^=ShopHeader--title]').text()
  let brand =
    shopName in json.Tianmao2Brand
      ? json.Tianmao2Brand[shopName as keyof typeof json.Tianmao2Brand]
      : shopName

  //加载链接信息
  let link = 'https://detail.tmall.com/item.htm?id=' + $('#aliww-click-trigger').attr('data-item')

  //加载描述图
  let longImgList: string[] = []
  $(`[class^='descV8'] img`).each((index, ele) => {
    let a = $(ele).attr('src')
    // 判断src是否为空，并去除两张无用的图片
    if (
      a !== undefined &&
      a !== '//gw.alicdn.com/tfs/TB1d0h2qVYqK1RjSZLeXXbXppXa-1125-960.png?getAvatar=avatar' &&
      a !== 'https://assets.alicdn.com/kissy/1.0.0/build/imglazyload/spaceball.gif'
    ) {
      longImgList = longImgList.concat(a)
    }
  })
  dev && console.log('longImgList', longImgList)
  //生成文件名
  let longImgNameList: string[] = []
  longImgList.forEach((element, index) => {
    longImgNameList[index] =
      productItem.value.pagename + ' 描述图' + (index + 1) + element.slice(-4)
    if (ifDownload.value) {
      GM_download(element, longImgNameList[index])
    }
  })
  let longImgNameStr = longImgNameList.join('|')

  async function getBase64Image(src: string) {
    let response = await fetch(src)
    let blob = await response.blob()
    return new Promise((resolve) => {
      let reader = new FileReader()
      reader.onloadend = function () {
        resolve(reader.result)
      }
      reader.readAsDataURL(blob)
    })
  }

  async function removeDuplicateImages(imgList: string[]) {
    let base64List = await Promise.all(imgList.map(getBase64Image))
    let uniqueBase64List = [...new Set(base64List)]
    let uniqueImgList = []
    for (let i = 0; i < uniqueBase64List.length; i++) {
      uniqueImgList[i] = imgList[base64List.indexOf(uniqueBase64List[i])]
    }
    return uniqueImgList
  }

  // Load main image
  let imgList = $('[class^=PicGallery--thumbnailPic], .skuIcon')
    .map((index, ele) => $(ele).attr('src'))
    .get()
  // Add https prefix and remove image compression suffix
  imgList = imgList.map((element) => 'https:' + element.replace(/\.(jpg|png).*?_\.webp$/, '.$1'))
  // Remove duplicate images
  imgList = await removeDuplicateImages(imgList)
  // Generate filenames
  let imgNameList = imgList.map(
    (element, index) => productItem.value.pagename + (index + 1) + element.slice(-4)
  )
  if (ifDownload.value) {
    imgNameList.forEach((name, index) => GM_download(imgList[index], name))
  }
  let imgNameStr = imgNameList.join('\n')

  //等待长图加载完毕后输出结果
  code.value = `{{周边信息\n|版权=\n|尺寸=\n|定价=${
    productItem.value.price
  }\n|货号=\n|链接（京东）=\n|链接（乐乎市集）=\n|链接（奇货）=\n|链接（淘宝）=\n|链接（天猫）=${link}\n|链接（玩具反斗城）=\n|品牌=${brand}\n|日期=${
    productItem.value.date || ''
  }\n|适龄=\n|条码=\n|主题=${
    productItem.value.feat
  }\n}}\n\n<gallery>\n${imgNameStr}\n</gallery>\n\n{{长图|${longImgNameStr}}}\n`

  // 如果启用了自动复制，就复制结果
  ifAutoCopy.value ? GM_setClipboard(code.value, 'text/plain') : null

  // 如果启用了跳转百科，就跳转百科
  ifGoToWiki.value
    ? window.open(`//xyy.huijiwiki.com/wiki/${productItem.value.pagename}?action=edit`)
    : null

  // 关闭加载动画
  loading.value = false
}
</script>
