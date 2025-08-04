import type { FileEntry } from '@/utils/file-manager'

async function dl(fileEntry: FileEntry) {
  let blob = fileEntry.blob
  let objectUrl = URL.createObjectURL(blob)
  let a = document.createElement('a')
  a.href = objectUrl
  a.download = fileEntry.filename
  a.click()
  a.remove()
  URL.revokeObjectURL(objectUrl)
}

export { dl }
