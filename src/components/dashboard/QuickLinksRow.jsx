import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n'

// Fila compacta de accesos — la traducción de la barra lateral de la
// referencia (Biblioteca, Misiones, Tienda, Foro...) a una fila dentro del
// contenido, sin agregar una sidebar real (decisión explícita del usuario:
// no tocar la navegación de la app).
const LINKS = [
  { to: '/biblioteca', icon: '📚', key: 'biblioteca' },
  { to: '/misiones', icon: '📜', key: 'misiones' },
  { to: '/tienda', icon: '🛒', key: 'tienda' },
  { to: '/foro', icon: '💬', key: 'foro' },
  { to: '/mascota', icon: '🐾', key: 'mascota' },
]

export default function QuickLinksRow() {
  const { t } = useI18n()
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {LINKS.map((l) => (
        <Link
          key={l.to}
          to={l.to}
          className="flex shrink-0 flex-col items-center gap-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-center transition-colors hover:border-primary/40 hover:bg-surface-hover"
        >
          <span className="text-xl">{l.icon}</span>
          <span className="text-[11px] font-semibold text-text-muted">{t(`dashboard.summary.quickLinks.${l.key}`)}</span>
        </Link>
      ))}
    </div>
  )
}
