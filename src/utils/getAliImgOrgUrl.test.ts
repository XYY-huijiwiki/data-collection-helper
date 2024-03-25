import getAliImgOrgUrl from './getAliImgOrgUrl'
import { expect, test } from 'vitest'

test.each([
  {
    // This example comes from part of a long img (.descV8-container img)
    input: '//img.alicdn.com/imgextra/i2/2201408164619/O1CN01JrlLNO1jzYMhYZ6sA_!!2201408164619.jpg',
    output: '//img.alicdn.com/O1CN01JrlLNO1jzYMhYZ6sA_!!2201408164619.jpg'
  },
  {
    // This example comes from gallery img switcher (img[class^='PicGallery--thumbnailPic--'])
    input:
      '//gw.alicdn.com/imgextra/i2/2201408164619/O1CN01BkKEL21jzYMgtpREd_!!2201408164619.png_.webp',
    output: '//img.alicdn.com/O1CN01BkKEL21jzYMgtpREd_!!2201408164619.png1'
  },
  {
    // This example comes from product type selector (img.skuIcon)
    input:
      '//gw.alicdn.com/bao/uploaded/i4/2201408164619/O1CN01zQ926b1jzYMfCEY02_!!2201408164619.png_110x10000.jpg_.webp',
    output: '//img.alicdn.com/O1CN01zQ926b1jzYMfCEY02_!!2201408164619.png'
  }
])(`Test getAliImgOrgUrl() case %#`, ({ input, output }) => {
  expect(getAliImgOrgUrl(input)).toBe(output)
})
