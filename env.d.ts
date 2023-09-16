/// <reference types="vite/client" />

interface Window {
  __NUXT__: {
    data: [{ collection_id: number }]
  }
  g_config: {
    shopName: string
    itemId: string
    idata: {
      item: {
        auctionImages: string[],
        title: string,
      }
    }
  }
}
