async function dl(url: string, name?: string) {
  let blob = await (await fetch(url)).blob()
  let objectUrl = URL.createObjectURL(blob)
  let filename = name || url.split('/').pop() || 'download'
  let a = document.createElement('a')
  a.href = objectUrl
  a.download = filename
  a.click()
  a.remove()
  URL.revokeObjectURL(objectUrl)
}

export { dl }
