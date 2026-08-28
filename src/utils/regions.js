import { CATEGORY_META } from '../data/categoryMeta'
import { MAIN_CATEGORIES } from '../data/categoryTaxonomy'
import { localizeCategoryName } from '../data/categoryTranslations'

// "Regiones" compartidas entre el Mapa de Aventura (DashboardPage) y las
// barras de avance por área (ProgressPage): las 3 academias con página
// propia + las 6 áreas de categoryTaxonomy.js. Un solo lugar para no repetir
// este agrupamiento en cada pantalla que quiera mostrarlo.
const SPECIAL_REGIONS = [
  { key: 'academia-ia',      title: 'Academia de IA',       to: '/academia-ia',              category: 'Inteligencia Artificial' },
  { key: 'academia-idiomas', title: 'Academia de Idiomas',  to: '/academia-idiomas',         category: 'Idiomas' },
  { key: 'academia-ciber',   title: 'Ciberseguridad',       to: '/escuela/ciberseguridad',   category: 'Ciberseguridad' },
]

function buildRegion({ key, title, to, icon, gradient, accent, regionCourses, progressByCourse }) {
  const total = regionCourses.length
  const inProgress = regionCourses.filter((c) => { const p = progressByCourse(c.id); return p !== null && p > 0 && p < 100 }).length
  const completed = regionCourses.filter((c) => progressByCourse(c.id) === 100).length
  const state = inProgress > 0 ? 'current' : completed > 0 && completed === total ? 'done' : 'open'
  return { key, title, to, icon, gradient, accent, total, inProgress, completed, state }
}

export function buildRegions(courses, progressByCourse, lang = 'es') {
  const specials = SPECIAL_REGIONS.map((r) => {
    const meta = CATEGORY_META[r.category] ?? CATEGORY_META.Otros
    const regionCourses = courses.filter((c) => c.category === r.category)
    return buildRegion({ key: r.key, title: localizeCategoryName(r.title, lang), to: r.to, icon: meta.icon, gradient: meta.gradient, accent: meta.accent, regionCourses, progressByCourse })
  })
  const macro = MAIN_CATEGORIES.map((m) => {
    const cats = m.subcategories.flatMap((s) => s.schoolCategories)
    const regionCourses = courses.filter((c) => cats.includes(c.category))
    return buildRegion({ key: m.id, title: localizeCategoryName(m.title, lang), to: `/escuela-categoria/${m.id}`, icon: m.icon, gradient: m.gradient, accent: m.accent, regionCourses, progressByCourse })
  })
  return [...specials, ...macro]
}
