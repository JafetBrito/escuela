import { Link } from 'react-router-dom'
import { useShopStore } from '../../stores/useShopStore'
import { getAvailableBooks } from '../../data/libraryRegistry'
import { useI18n } from '../../i18n'
import Bookshelf from '../library/Bookshelf'

// Lets the user open any unlocked book in the global reader popup from
// wherever they are, without going through the Biblioteca page. Misma
// repisa que /estanteria (Bookshelf.jsx) — antes esto era una grilla de
// tarjetas distinta, ahora ambas se ven igual.
export default function BooksPanel() {
  const { t } = useI18n()
  const purchased = useShopStore((s) => s.purchased)
  const availableBooks = getAvailableBooks(purchased)

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-text-muted">
        {t('pages.mascotHome.booksIntro')}{' '}
        <Link to="/biblioteca" className="text-primary hover:underline">{t('pages.mascotHome.library')}</Link>.
      </p>

      <Bookshelf books={availableBooks} emptyHint={t('pages.mascotHome.booksEmptyHint')} />
    </div>
  )
}
