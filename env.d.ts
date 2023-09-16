/// <reference types="vite/client" />

declare const __NUXT__: {
  data: [{ collection_id: number }]
}

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
