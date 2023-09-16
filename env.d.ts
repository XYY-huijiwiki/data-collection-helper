/// <reference types="vite/client" />

// mgtv
declare const __NUXT__: {
  data: [{ collection_id: number }]
}

// taobao
declare const g_config: {
  shopName: string
  itemId: string
  idata: {
    item: {
      auctionImages: string[]
      title: string
    }
  }
}

// dangdang
declare const prodSpuInfo: {
  productId: string
  productName: string
  isCatalog: string
  mainProductId: string
  shopId: string
  productType: string
  describeMap: string
  categoryPath: string
}

// BookInfo
type BookInfo = {
  image?: string
  name?: string
  fullname?: string
  author?: string
  translator?: string
  editor?: string
  publisher?: string
  price?: string
  date?: string
  size?: string
  dimension?: string
  pages?: string
  words?: string
  paper?: string
  package?: string
  isbn?: string
  description?: string
  sample?: string // 试读
  contents?: string // 目录
  ref: string // 参考资料
}
