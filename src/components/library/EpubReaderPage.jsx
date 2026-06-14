import { useParams, useNavigate, Link } from 'react-router-dom'
import MascotCompanion from '../mascot/MascotCompanion'
import { getBookById } from '../../data/libraryRegistry'
import BookContent from './BookContent'

export default function EpubReaderPage() {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const book = getBookById(bookId)

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

      <BookContent book={book} className="flex-1" />

      <MascotCompanion />
    </div>
  )
}
