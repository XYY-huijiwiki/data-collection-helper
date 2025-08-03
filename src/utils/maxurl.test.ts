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
  }
])(`Test maxurl() case %#`, ({ input, output }) => {
  expect(maxurl(input)).toBe(output)
})
