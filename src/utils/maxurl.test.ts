import maxurl from '@/utils/maxurl'
import { expect, test } from 'vitest'

test.each([
  {
    // This example comes from part of a long img (.descV8-container img)
    input:
      'https://img.alicdn.com/imgextra/i2/2201408164619/O1CN01JrlLNO1jzYMhYZ6sA_!!2201408164619.jpg',
    output:
      'https://img.alicdn.com/imgextra/i2/2201408164619/O1CN01JrlLNO1jzYMhYZ6sA_!!2201408164619.jpg'
  },
  {
    // This example comes from gallery img switcher (img[class^='PicGallery--thumbnailPic--'])
    input:
      'https://gw.alicdn.com/imgextra/i2/2201408164619/O1CN01BkKEL21jzYMgtpREd_!!2201408164619.png_.webp',
    output:
      'https://gw.alicdn.com/imgextra/i2/2201408164619/O1CN01BkKEL21jzYMgtpREd_!!2201408164619.png'
  },
  {
    // This example comes from product type selector (img.skuIcon)
    input:
      'https://gw.alicdn.com/bao/uploaded/i4/2201408164619/O1CN01zQ926b1jzYMfCEY02_!!2201408164619.png_110x10000.jpg_.webp',
    output:
      'https://gw.alicdn.com/bao/uploaded/i4/2201408164619/O1CN01zQ926b1jzYMfCEY02_!!2201408164619.png'
  },
  {
    // JD's avif file
    input:
      'https://img14.360buyimg.com/n5/s114x114_jfs/t1/158229/8/39694/166392/6784863cF6a8276c5/09005f48b98e1088.jpg.avif',
    output:
      'https://img14.360buyimg.com/imgzone/jfs/t1/158229/8/39694/166392/6784863cF6a8276c5/09005f48b98e1088.jpg'
  },
  {
    // Weibo's image
    input: 'https://wx2.sinaimg.cn/large/6544f080ly8i3yrsjl2sfj20u073de81.jpg',
    output: 'https://wx2.sinaimg.cn/orignal/6544f080ly8i3yrsjl2sfj20u073de81.jpg'
  },
  {
    // Dewu mobile's main image
    input:
      'https://webimg.dewucdn.com/pro-img/cut-img/20250610/670495e901aa4db88ccd6b8a8b611631.jpg?x-oss-process=image/resize,w_144',
    output:
      'https://webimg.dewucdn.com/pro-img/cut-img/20250610/670495e901aa4db88ccd6b8a8b611631.jpg'
  },
  {
    // Dewu mobile's long image
    input:
      'https://webimg.dewucdn.com/stark/stark-web/2378155452/fdf6a4ece62e6081e71862d9bd8577d4.jpg?x-oss-process=image/crop,y_0,h_1000/resize,w_1005',
    output:
      'https://webimg.dewucdn.com/stark/stark-web/2378155452/fdf6a4ece62e6081e71862d9bd8577d4.jpg'
  },
  {
    // Dewu PC's main image
    input:
      'https://cdn.poizon.com/pro-img/cut-img/20250814/444926c5d70845e4a49b2bfc5042e5dd.jpeg?x-oss-process=image/format,webp',
    output: 'https://cdn.poizon.com/pro-img/cut-img/20250814/444926c5d70845e4a49b2bfc5042e5dd.jpeg'
  },
  {
    // Dewu PC's long image
    input: 'https://cdn.poizon.com/stark/stark-web/1916487771/b6c62754b9a83ef6d6f63d194ac5a973.jpg',
    output: 'https://cdn.poizon.com/stark/stark-web/1916487771/b6c62754b9a83ef6d6f63d194ac5a973.jpg'
  }
])(`Test maxurl() case %#`, ({ input, output }) => {
  expect(maxurl(input)).toBe(output)
})
