// Cross-browser progress persistence via download/upload of progress.json
// (paired with the Portal Dropzone).

export function downloadProgress(progress, filename = 'progress.json') {
  const blob = new Blob([JSON.stringify(progress, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export async function readProgressFile(file) {
  const text = await file.text()
  return JSON.parse(text)
}
