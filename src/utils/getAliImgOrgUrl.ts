function getAliImgOrgUrl(url: string): string {
  const matchRes = url.match(/\/\/(?:gw|img).alicdn.com(?:.*)\/(.*?).(png|jpg|jpeg|gif)/)
  if (matchRes) {
    return `//img.alicdn.com/${matchRes[1]}.${matchRes[2]}`
  } else {
    console.error(`getAliImgOrgUrl: invalid url (${url})`)
    return url
  }
}

export default getAliImgOrgUrl
