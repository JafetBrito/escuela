import { useState } from 'react'
import { ReactReader } from 'react-reader'
import { useLibraryStore } from '../../stores/useLibraryStore'

// Renders the actual reading surface for a book, shared between the
// full-page reader (EpubReaderPage) and the global popup (BookReaderModal).
// Supports three "file" types:
//   - 'pdf'  -> embedded in an <iframe>
//   - 'epub' -> react-reader
//   - 'html' -> inline sections (title/text), for built-in guides that don't
//               need a separate .epub/.pdf file
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
