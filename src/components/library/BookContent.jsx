import { lazy, Suspense, useState } from 'react'
import { ReactReader } from 'react-reader'
import { useLibraryStore } from '../../stores/useLibraryStore'

// Lazy: pulls in pdfjs-dist (~470 kB), only worth loading for books that
// actually use the 3D flip viewer — not every epub/pdf/html book.
const Flipbook3D = lazy(() => import('../flipbook/Flipbook3D'))

// Renders the actual reading surface for a book, shared between the
// full-page reader (EpubReaderPage) and the global popup (BookReaderModal).
// Supports four "file" types:
//   - 'pdf'      -> embedded in an <iframe>
//   - 'flipbook' -> same PDF file, but as a 3D page-turn viewer
//   - 'epub'     -> react-reader
//   - 'html'     -> inline sections (title/text), for built-in guides that
//                   don't need a separate .epub/.pdf file
export default function BookContent({ book, className = '' }) {
  const lastLocations = useLibraryStore((s) => s.lastLocations)
  const setLastLocation = useLibraryStore((s) => s.setLastLocation)
  const [location, setLocation] = useState(lastLocations[book.id] ?? null)

  const handleLocationChanged = (cfi) => {
    setLocation(cfi)
    setLastLocation(book.id, cfi)
  }

  if (book.type === 'html') {
    return (
      <div className={`overflow-y-auto bg-background p-6 ${className}`}>
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {(book.content ?? []).map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-bold uppercase tracking-wide text-primary">
                {section.title}
              </h3>
              <p className="mt-1 text-sm text-text-muted">{section.text}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (book.type === 'pdf') {
    return (
      <iframe src={book.file} title={book.title} className={`border-0 bg-white ${className}`} />
    )
  }

  if (book.type === 'flipbook') {
    return (
      <Suspense fallback={<div className={`flex items-center justify-center text-sm text-text-muted ${className}`}>Cargando visor 3D…</div>}>
        <Flipbook3D src={book.file} className={`overflow-y-auto ${className}`} />
      </Suspense>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <ReactReader
        url={book.file}
        location={location}
        locationChanged={handleLocationChanged}
        getRendition={(rendition) => {
          rendition.themes.fontSize('100%')
        }}
      />
    </div>
  )
}
