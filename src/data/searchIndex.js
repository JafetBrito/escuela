// Buscador de texto simple para toda la app: cursos, clases, entradas del
// segundo cerebro, juegos, biblioteca, blog y misiones. Índice plano
// construido una vez al cargar (nada de esto cambia en runtime), filtrado
// por substring — sin librerías externas, no hace falta para el tamaño de
// contenido actual. Deliberadamente NO se indexan registries de mecánica de
// juego (tienda, equipo, habilidades, guías/herramientas IA con solo links
// externos) — son datos internos de otras pantallas, no "contenido del
// sitio" que alguien busque por texto.
import courses from './courses.json'
import { COURSES_DATA } from './courseRegistry'
import { GLOSSARY } from './glossaryRegistry'
import { GAMES } from './gamesRegistry'
import { LIBRARY_BOOKS } from './libraryRegistry'
import { BLOG_POSTS } from './blogRegistry'
import { GLOBAL_MISSIONS } from './globalMissionsRegistry'

// Tipos disponibles para el filtro de la página de búsqueda — mismo orden
// en el que aparecen los chips.
export const SEARCH_TYPES = ['Curso', 'Clase', 'Juego', 'Segundo Cerebro', 'Biblioteca', 'Blog', 'Misión']

function buildIndex() {
  const items = []

  courses.forEach((c) => {
    items.push({ type: 'Curso', icon: c.icon, title: c.title, subtitle: c.description, href: c.gameRoute ?? `/learn/${c.id}` })
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

  LIBRARY_BOOKS.forEach((b) => {
    items.push({ type: 'Biblioteca', icon: b.icon, title: b.title, subtitle: `${b.author} · ${b.description}`, href: `/biblioteca/${b.id}` })
  })

  BLOG_POSTS.forEach((p) => {
    items.push({ type: 'Blog', icon: p.icon, title: p.title, subtitle: p.description, href: `/blog/${p.id}` })
  })

  // Las misiones no tienen ruta propia (viven todas en el tablón /misiones),
  // así que todas apuntan ahí en vez de un enlace por ítem.
  GLOBAL_MISSIONS.forEach((m) => {
    items.push({ type: 'Misión', icon: m.icon, title: m.title, subtitle: m.description, href: '/misiones' })
  })

  return items
}

// Antes el índice se construía una sola vez al importar este módulo — con
// COURSES_DATA todavía vacío en ese instante (el fetch a Supabase recién
// arranca al montar la app), las "Clase" quedaban fuera del índice para
// siempre, en silencio. searchAll solo corre cuando el usuario efectivamente
// busca, mucho después de que el store de cursos ya haya cargado, así que
// reconstruir aquí (en vez de en un constante de módulo) es barato y
// siempre está al día.
export function searchAll(query, { limit = 30, types = null } = {}) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  let results = buildIndex().filter((it) => it.title.toLowerCase().includes(q) || it.subtitle?.toLowerCase().includes(q))
  if (types?.length) results = results.filter((it) => types.includes(it.type))
  return results.slice(0, limit)
}
