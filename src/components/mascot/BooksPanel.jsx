import { Link } from 'react-router-dom'
import { useShopStore } from '../../stores/useShopStore'
import { getAvailableBooks } from '../../data/libraryRegistry'
import Bookshelf from '../library/Bookshelf'

// Lets the user open any unlocked book in the global reader popup from
// wherever they are, without going through the Biblioteca page. Misma
// repisa que /estanteria (Bookshelf.jsx) — antes esto era una grilla de
// tarjetas distinta, ahora ambas se ven igual.
export default function BooksPanel() {
  const purchased = useShopStore((s) => s.purchased)
  const availableBooks = getAvailableBooks(purchased)

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-text-muted">
        Tus libros, listos para abrir aquí mismo. Los que aún no has comprado aparecen en la{' '}
        <Link to="/biblioteca" className="text-primary hover:underline">Biblioteca</Link>.
      </p>

      <Bookshelf books={availableBooks} emptyHint="Todavía no tienes libros disponibles. Visita la Biblioteca para conseguir algunos." />
    </div>
  )
}
