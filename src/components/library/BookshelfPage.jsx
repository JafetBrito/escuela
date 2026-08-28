import { Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import { useShopStore } from '../../stores/useShopStore'
import { getAvailableBooks } from '../../data/libraryRegistry'
import { useI18n } from '../../i18n'
import Bookshelf from './Bookshelf'

// "Mi Estantería" — los libros que el alumno YA puede leer, presentados
// como una repisa de madera (estilo Moon Reader Pro) en vez de la grilla de
// tarjetas de /biblioteca. La Biblioteca sigue siendo el catálogo completo
// para comprar/desbloquear; esta página es solo lo que ya es tuyo.
export default function BookshelfPage() {
  const { t } = useI18n()
  const purchased = useShopStore((s) => s.purchased)
  const availableBooks = getAvailableBooks(purchased)

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-amber-700 to-orange-600 px-6 py-8 shadow-lg">
            <h1 className="text-3xl font-extrabold text-white drop-shadow-sm">{t('pages.bookshelf.title')}</h1>
            <p className="mt-1 text-sm font-medium text-white/85">
              {t('pages.bookshelf.subtitle')}
            </p>
          </div>

          <div className="mt-6">
            <Bookshelf
              books={availableBooks}
              emptyHint={t('pages.bookshelf.emptyHint')}
            />
          </div>

          <p className="mt-4 text-center text-xs text-text-muted">
            {t('pages.bookshelf.lookingForMore')}{' '}
            <Link to="/biblioteca" className="font-semibold text-primary hover:underline">{t('pages.bookshelf.fullLibrary')}</Link>.
          </p>
        </div>
      </main>

      <MascotCompanion />
    </div>
  )
}
