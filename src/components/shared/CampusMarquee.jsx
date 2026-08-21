import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAnnouncementsStore } from '../../stores/useAnnouncementsStore'

// Franja de anuncios bajo el header — reusa los mismos datos de /anuncios
// (school_announcements + el build actual, ver useAnnouncementsStore.js) en
// vez de inventar contenido nuevo. Solo los primeros 6 para no alargar el
// loop de scroll con anuncios viejos.
export default function CampusMarquee() {
  const announcements = useAnnouncementsStore((s) => s.announcements)
  const fetchAnnouncements = useAnnouncementsStore((s) => s.fetch)

  useEffect(() => { fetchAnnouncements() }, [fetchAnnouncements])

  const items = announcements.slice(0, 6)
  if (items.length === 0) return null

  // El track se duplica una vez (misma cadena dos veces seguidas, cada una
  // con el separador final incluido) para que la animación translateX(-50%)
  // haga un loop continuo sin salto ni hueco visible — el ancho de las dos
  // copias debe ser idéntico y sin gap extra entre ellas para que el corte
  // caiga exactamente a la mitad del track.
  const separator = '     •     '
  const line = items.map((a) => `${a.icon ?? '📌'} ${a.title}`).join(separator) + separator

  return (
    <Link
      to="/anuncios"
      aria-label="Ver todos los anuncios del campus"
      className="block overflow-hidden border-b border-border bg-surface-hover/60 py-1.5 hover:bg-surface-hover"
    >
      <div className="flex w-max whitespace-nowrap">
        <span className="marquee-track flex shrink-0 text-xs font-medium text-text-muted">
          <span>{line}</span>
          <span aria-hidden="true">{line}</span>
        </span>
      </div>
    </Link>
  )
}
