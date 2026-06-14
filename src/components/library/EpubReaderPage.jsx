import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ReactReader } from 'react-reader'
import MascotCompanion from '../mascot/MascotCompanion'
import { getBookById } from '../../data/libraryRegistry'
import { useLibraryStore } from '../../stores/useLibraryStore'

export default function EpubReaderPage() {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const book = getBookById(bookId)
  const lastLocations = useLibraryStore((s) => s.lastLocations)
  const setLastLocation = useLibraryStore((s) => s.setLastLocation)
  const [location, setLocation] = useState(lastLocations[bookId] ?? null)

  if (!book || !book.file) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background p-6 text-center text-text">
        <p className="text-4xl">📕</p>
        <p className="text-lg font-bold">Este libro no está disponible todavía.</p>
        <Link to="/biblioteca" className="text-sm text-primary hover:underline">
          ← Volver a la Biblioteca
        </Link>
      </div>
    )
  }

  const handleLocationChanged = (cfi) => {
    setLocation(cfi)
    setLastLocation(bookId, cfi)
  }

  return (
    <div className="flex h-screen flex-col bg-background text-text">
      <header className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-2.5">
        <button
          onClick={() => navigate('/biblioteca')}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text"
        >
          ← Volver a la Biblioteca
        </button>
        <p className="truncate text-sm font-semibold text-text">{book.title}</p>
        <span className="w-24" aria-hidden="true" />
      </header>

      <div className="relative flex-1">
        {book.type === 'pdf' ? (
          <iframe
            src={book.file}
            title={book.title}
            className="h-full w-full border-0 bg-white"
          />
        ) : (
          <ReactReader
            url={book.file}
            location={location}
            locationChanged={handleLocationChanged}
            getRendition={(rendition) => {
              rendition.themes.fontSize('100%')
            }}
          />
        )}
      </div>

      <MascotCompanion />
    </div>
  )
}
