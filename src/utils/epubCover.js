import ePub from 'epubjs'

// Cache en memoria por URL de archivo — epubjs solo necesita leer el
// manifest (content.opf) para resolver la portada, no el libro completo,
// así que abrir el paquete es barato incluso para epubs grandes. Se
// cachea la promesa (no solo el resultado) para que si dos <BookCover>
// del mismo libro montan casi al mismo tiempo, no se abra el paquete dos
// veces.
const cache = new Map()

export function getEpubCoverUrl(fileUrl) {
  if (!fileUrl) return Promise.resolve(null)
  if (!cache.has(fileUrl)) {
    cache.set(
      fileUrl,
      (async () => {
        try {
          const book = ePub(fileUrl)
          await book.opened
          return (await book.coverUrl()) ?? null
        } catch {
          return null
        }
      })(),
    )
  }
  return cache.get(fileUrl)
}
