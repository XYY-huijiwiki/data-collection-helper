import { fileTypeFromBuffer } from 'file-type'

type FileEntry = {
  id: string
  blob: Blob
  filename: string
  filetype: string
  filesize: number
  sha256: string
}

export function createFileManager(config?: { baseFilename?: string }) {
  const files: Record<string, FileEntry> = {}
  const hashMap: Record<string, boolean> = {}
  let incrementalIndex = 1

  return {
    async addFileByUrl(url: string, filename?: string): Promise<FileEntry | null> {
      // Extract filename from URL if not provided
      let finalFilename = ''
      if (config?.baseFilename) {
        finalFilename = `${config.baseFilename} ${incrementalIndex}`
      } else {
        finalFilename = filename || new URL(url).pathname.split('/').pop() || 'file'
      }

      try {
        // Fetch file
        const response = await fetch(url)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        // Get ArrayBuffer
        const arrayBuffer = await response.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)

        // Calculate SHA-256 hash
        const hashBuffer = await crypto.subtle.digest('SHA-256', uint8Array)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

        console.log(hashMap)
        console.table({
          url,
          finalFilename,
          hashHex,
          isDuplicated: hashMap[hashHex] ? false : true
        })

        // Check for duplicate
        if (hashMap[hashHex]) return null

        // Detect file type
        const typeResult = await fileTypeFromBuffer(uint8Array)
        const detectedType = typeResult?.mime || 'application/octet-stream'
        const detectedExt = typeResult?.ext || ''

        // Update filename with correct extension
        const extensionIndex = finalFilename.lastIndexOf('.')
        const needsExtension = extensionIndex === -1
        const hasWrongExtension =
          extensionIndex !== -1 &&
          !finalFilename
            .slice(extensionIndex + 1)
            .toLowerCase()
            .includes(detectedExt)

        if (needsExtension || hasWrongExtension) {
          finalFilename = needsExtension
            ? `${finalFilename}.${detectedExt}`
            : `${finalFilename.slice(0, extensionIndex)}.${detectedExt}`
        }

        // Create blob with proper MIME type
        const blob = new Blob([uint8Array], { type: detectedType })

        // Create file entry
        const fileEntry: FileEntry = {
          id: crypto.randomUUID(),
          blob,
          filename: finalFilename,
          filetype: detectedType,
          filesize: arrayBuffer.byteLength,
          sha256: hashHex
        }

        // Store file
        files[fileEntry.id] = fileEntry
        hashMap[hashHex] = true
        incrementalIndex++

        return fileEntry
      } catch (error) {
        console.error(`Failed to add file: ${error}`)
        return null
      }
    },

    getFile(id: string): FileEntry | null {
      return files[id] || null
    },

    listFiles(): FileEntry[] {
      return Object.values(files)
    },

    removeFile(id: string): boolean {
      if (!files[id]) return false
      delete hashMap[files[id].sha256]
      delete files[id]
      return true
    },

    forEach(callback: (file: FileEntry) => unknown): void {
      Object.values(files).forEach(callback)
    },

    async asyncForEach(callback: (file: FileEntry) => Promise<unknown>): Promise<void> {
      for (const file of Object.values(files)) {
        await callback(file)
      }
    },

    dispose(): void {
      Object.keys(files).forEach((id) => {
        delete files[id]
      })
      Object.keys(hashMap).forEach((hash) => {
        delete hashMap[hash]
      })
    }
  }
}

// Type exports
export type FileManager = ReturnType<typeof createFileManager>
export type { FileEntry }
