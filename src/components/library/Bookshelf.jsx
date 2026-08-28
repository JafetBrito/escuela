import { useEffect, useState } from 'react'
import { useLibraryStore } from '../../stores/useLibraryStore'
import { getEpubCoverUrl } from '../../utils/epubCover'
import { useI18n } from '../../i18n'

// Hash determinista del id — libros con distinto ancho para que la repisa
// no se vea uniforme, como una de verdad, sin que cambie de un render a
// otro (nada de Math.random aquí).
function hashStr(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

const COVER_MAX_HEIGHT = 156 // 104 (ancho máx.) * 1.5, proporción de portada real
const PLANK_THICKNESS = 16

const SHELF_BACKGROUND = {
  backgroundImage: `repeating-linear-gradient(
      to bottom,
      transparent 0px, transparent ${COVER_MAX_HEIGHT}px,
      #8a5a2e ${COVER_MAX_HEIGHT}px, #8a5a2e ${COVER_MAX_HEIGHT + 8}px,
      rgba(0,0,0,0.28) ${COVER_MAX_HEIGHT + 8}px, rgba(0,0,0,0.28) ${COVER_MAX_HEIGHT + PLANK_THICKNESS}px
    ),
    linear-gradient(180deg, #e3b17c, #c9955d)`,
}

// Portada de un libro parada en la repisa. Si el epub trae portada real
// (extraída con epubjs, ver utils/epubCover.js) se muestra esa imagen; si
// no (todavía cargando, sin portada, o es un pdf/html) cae al lomo de
// color + ícono de siempre.
function BookCover({ book }) {
  const { t } = useI18n()
  const openBook = useLibraryStore((s) => s.openBook)
  const hash = hashStr(book.id)
  const width = 82 + (hash % 23) // 82–104
  const height = Math.round(width * 1.5)

  const [coverUrl, setCoverUrl] = useState(null)

  useEffect(() => {
    let cancelled = false
    if (book.type === 'epub' && book.file) {
      getEpubCoverUrl(book.file).then((url) => {
        if (!cancelled) setCoverUrl(url)
      })
    }
    return () => { cancelled = true }
  }, [book.type, book.file])

  return (
    <button
      type="button"
      onClick={() => openBook(book.id)}
      title={book.title}
      className="group relative shrink-0 overflow-hidden rounded-[3px] text-left shadow-[2px_3px_6px_rgba(0,0,0,0.35)] transition-transform hover:-translate-y-2 hover:shadow-[3px_5px_10px_rgba(0,0,0,0.45)]"
      style={{ height, width, background: coverUrl ? '#00000022' : `linear-gradient(135deg, ${book.color}, ${book.color}cc)` }}
    >
      {coverUrl ? (
        <img src={coverUrl} alt="" className="h-full w-full object-cover" draggable={false} />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-1.5 p-2 text-center">
          <span className="text-2xl drop-shadow-sm">{book.icon}</span>
          <span className="line-clamp-4 text-[9px] font-bold leading-tight text-white/95">{book.title}</span>
        </div>
      )}

      {/* Filo derecho, como el canto de las páginas */}
      <span className="absolute inset-y-0 right-0 w-[3px] bg-black/25" aria-hidden="true" />
      {/* Franja de luz a la izquierda, como el lomo curvo de un libro real */}
      <span className="absolute inset-y-0 left-0 w-1 bg-white/25" aria-hidden="true" />

      {/* Tooltip al pasar el mouse — mismo criterio que las tarjetas de la Biblioteca */}
      <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-44 -translate-x-1/2 rounded-lg border border-border bg-surface p-2.5 text-left opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
        <p className="text-xs font-bold text-text">{book.title}</p>
        <p className="text-[10px] text-text-muted">{book.author}</p>
        <p className="mt-1 text-[10px] leading-snug text-text-muted">{book.description}</p>
        <p className="mt-1 text-[10px] font-semibold text-primary">{t('pages.bookshelf.read')}</p>
      </div>
    </button>
  )
}

// Repisa completa — recibe la lista de libros ya filtrada (disponibles para
// leer: sin "próximamente" y, si tienen precio, ya comprados). Usada tanto
// en /estanteria (BookshelfPage) como en el panel de Libros de la mascota
// (BooksPanel), para que ambos se vean igual.
export default function Bookshelf({ books, emptyHint }) {
  const { t } = useI18n()
  if (books.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center">
        <p className="text-3xl mb-2">📚</p>
        <p className="text-sm text-text-muted">{emptyHint ?? t('pages.bookshelf.emptyDefault')}</p>
      </div>
    )
  }

  return (
    <div
      className="overflow-hidden rounded-2xl border border-black/10 shadow-inner"
      style={{ ...SHELF_BACKGROUND, minHeight: COVER_MAX_HEIGHT + PLANK_THICKNESS }}
    >
      <div className="flex flex-wrap items-end gap-3 p-4 pb-0">
        {books.map((book) => <BookCover key={book.id} book={book} />)}
      </div>
    </div>
  )
}
