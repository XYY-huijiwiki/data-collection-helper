async function dl(blob: Blob, filename?: string): Promise<void> {
  let objectUrl = URL.createObjectURL(blob)
  let a = document.createElement('a')
  a.href = objectUrl
  a.download = filename || objectUrl.split('/').pop() || 'download'
  a.click()
  a.remove()
  URL.revokeObjectURL(objectUrl)
}

export { dl }
