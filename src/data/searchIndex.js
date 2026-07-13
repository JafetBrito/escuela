// Buscador de texto simple para toda la app: cursos, clases, entradas del
// segundo cerebro y juegos. Índice plano construido una vez al cargar
// (nada de esto cambia en runtime), filtrado por substring — sin librerías
// externas, no hace falta para el tamaño de contenido actual.
import courses from './courses.json'
import { COURSES_DATA } from './courseRegistry'
import { GLOSSARY } from './glossaryRegistry'
import { GAMES } from './gamesRegistry'

function buildIndex() {
  const items = []

  courses.forEach((c) => {
    items.push({ type: 'Curso', icon: c.icon, title: c.title, subtitle: c.description, href: `/learn/${c.id}` })
    const data = COURSES_DATA[c.id]
    data?.modules?.forEach((m) => {
      items.push({ type: 'Clase', icon: '📄', title: m.title, subtitle: `${c.icon} ${c.title}`, href: `/learn/${c.id}` })
    })
  })

  GLOSSARY.forEach((g) => {
    items.push({ type: 'Segundo Cerebro', icon: g.icon, title: g.term, subtitle: g.summary, href: `/cerebro/${g.slug}` })
  })

  GAMES.forEach((g) => {
    items.push({ type: 'Juego', icon: g.icon, title: g.title, subtitle: g.description, href: `/games/${g.id}` })
  })

  return items
}

const INDEX = buildIndex()

export function searchAll(query, limit = 30) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return INDEX
    .filter((it) => it.title.toLowerCase().includes(q) || it.subtitle?.toLowerCase().includes(q))
    .slice(0, limit)
}
