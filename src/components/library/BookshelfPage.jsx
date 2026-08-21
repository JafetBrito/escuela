import { Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import { useShopStore } from '../../stores/useShopStore'
import { getAvailableBooks } from '../../data/libraryRegistry'
import Bookshelf from './Bookshelf'

// "Mi Estantería" — los libros que el alumno YA puede leer, presentados
// como una repisa de madera (estilo Moon Reader Pro) en vez de la grilla de
// tarjetas de /biblioteca. La Biblioteca sigue siendo el catálogo completo
// para comprar/desbloquear; esta página es solo lo que ya es tuyo.
export default function BookshelfPage() {
  const purchased = useShopStore((s) => s.purchased)
  const availableBooks = getAvailableBooks(purchased)

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-amber-700 to-orange-600 px-6 py-8 shadow-lg">
            <h1 className="text-3xl font-extrabold text-white drop-shadow-sm">🗄️ Mi Estantería</h1>
            <p className="mt-1 text-sm font-medium text-white/85">
              Los libros que ya tienes, listos para leer. Iremos agregando más con el tiempo.
            </p>
          </div>

          <div className="mt-6">
            <Bookshelf
              books={availableBooks}
              emptyHint="Todavía no tienes libros aquí. Ve a la Biblioteca para conseguir tu primero."
            />
          </div>

          <p className="mt-4 text-center text-xs text-text-muted">
            ¿Buscas algo nuevo? Visita la{' '}
            <Link to="/biblioteca" className="font-semibold text-primary hover:underline">Biblioteca completa</Link>.
          </p>
        </div>
      </main>

      <MascotCompanion />
    </div>
  )
}
