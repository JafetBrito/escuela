import { useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import courses from '../../data/courses.json'
import { MAIN_CATEGORIES } from '../../data/categoryTaxonomy'
import { localizeCategoryName } from '../../data/categoryTranslations'
import { useI18n } from '../../i18n'

// Subcategorías que ya tienen su propia portada arriba — el resto sale como tarjeta genérica.
const HAS_OWN_PAGE = ['Inteligencia Artificial', 'Ciberseguridad', 'Filosofía', 'Lenguas y Lingüística', 'Medicina y Ciencias de la Salud']
const SUB_ICONS = {
  'Matemáticas': '📐', 'Ciencias de la Computación': '💻', 'Lógica': '🧩',
  'Física': '⚛️', 'Química': '🧪', 'Biología': '🧬', 'Ciencias de la Tierra y el Espacio': '🪐',
  'Psicología': '🧠', 'Economía y Negocios': '📈', 'Sociología y Antropología': '👥', 'Historia y Geografía': '🗺️', 'Ciencias Políticas y Derecho': '⚖️',
  'Literatura': '📚', 'Artes Visuales': '🎨', 'Artes Escénicas y Música': '🎭',
  'Ingeniería': '⚙️', 'Educación': '🎓', 'Agricultura y Veterinaria': '🌾', 'Comunicación y Medios': '📡', 'Herramientas y hábitos': '⚡',
}

// Punto de entrada único para "escuelas" — antes Escuelas (categorías
// generales), Academia de Idiomas y Academia de Ciberseguridad vivían
// repartidas (una pestaña del Dashboard + dos links sueltos en el header).
// El alumno pidió juntarlas en una sola pestaña "Academias" y sacarlas del
// Dashboard — esta página es esa pestaña; las dos academias con lógica
// propia siguen siendo sus propias páginas (/academia-idiomas,
// /escuela/ciberseguridad), aquí solo son la puerta de entrada.
export default function AcademiasPage() {
  const { t, lang } = useI18n()
  const gridRef = useRef(null)

  // ponytail: filtra por el texto ya renderizado de cada tarjeta (sin acentos) en vez de
  // mantener una lista de datos aparte; suficiente mientras sean ~25 tarjetas.
  const norm = (x) => x.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  const handleSearch = (e) => {
    const q = norm(e.target.value.trim())
    Array.from(gridRef.current?.children ?? []).forEach((el) => { el.style.display = norm(el.textContent).includes(q) ? '' : 'none' })
  }

  const schoolCards = useMemo(() => MAIN_CATEGORIES.flatMap((m) => m.subcategories
    .filter((s) => !HAS_OWN_PAGE.includes(s.name))
    .map((s) => ({
      name: s.name,
      mainId: m.id,
      accent: m.accent,
      icon: SUB_ICONS[s.name] ?? m.icon,
      blurb: s.topics.slice(0, 3).join(', '),
      count: courses.filter((c) => s.schoolCategories.includes(c.category ?? 'Otros')).length,
    }))), [])

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 shadow-lg">
            <h1 className="text-3xl font-extrabold text-white drop-shadow-sm">{t('dashboard.academias.title')}</h1>
            <p className="mt-1 text-sm font-medium text-white/85">{t('dashboard.academias.subtitle')}</p>
          </div>

          <input
            type="search"
            onChange={handleSearch}
            placeholder="🔍 Buscar academia o escuela..."
            className="mt-6 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary"
          />

          {/* Academias con casa propia + escuelas */}
          <div ref={gridRef} className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link
              to="/academia-ia"
              className="flex items-center gap-3 rounded-2xl border border-border bg-gradient-to-br from-lime-600/20 to-emerald-500/10 p-5 transition hover:border-emerald-500/40"
            >
              <span className="text-4xl">🧠</span>
              <div>
                <p className="font-extrabold text-text">{t('nav.items.academiaIA')}</p>
                <p className="text-xs text-text-muted">{t('dashboard.academias.iaBlurb')}</p>
              </div>
            </Link>
            <Link
              to="/academia-idiomas"
              className="flex items-center gap-3 rounded-2xl border border-border bg-gradient-to-br from-sky-600/20 to-blue-500/10 p-5 transition hover:border-sky-500/40"
            >
              <span className="text-4xl">🌍</span>
              <div>
                <p className="font-extrabold text-text">{t('nav.items.academiaIdiomas')}</p>
                <p className="text-xs text-text-muted">{t('dashboard.academias.idiomasBlurb')}</p>
              </div>
            </Link>
            <Link
              to="/escuela/ciberseguridad"
              className="flex items-center gap-3 rounded-2xl border border-border bg-gradient-to-br from-slate-700/40 to-teal-600/10 p-5 transition hover:border-teal-500/40"
            >
              <span className="text-4xl">🔐</span>
              <div>
                <p className="font-extrabold text-text">{t('nav.items.academiaCiberseguridad')}</p>
                <p className="text-xs text-text-muted">{t('dashboard.academias.ciberBlurb')}</p>
              </div>
            </Link>
            <Link
              to="/academia-medicina"
              className="flex items-center gap-3 rounded-2xl border border-border bg-gradient-to-br from-emerald-700/20 to-teal-500/10 p-5 transition hover:border-emerald-500/40"
            >
              <span className="text-4xl">🩺</span>
              <div>
                <p className="font-extrabold text-text">{t('nav.items.academiaMedicina')}</p>
                <p className="text-xs text-text-muted">{t('dashboard.academias.medicinaBlurb')}</p>
              </div>
            </Link>
            <Link
              to="/academia-filosofia"
              className="flex items-center gap-3 rounded-2xl border border-border bg-gradient-to-br from-amber-600/20 to-stone-500/10 p-5 transition hover:border-amber-500/40"
            >
              <span className="text-4xl">🏛️</span>
              <div>
                <p className="font-extrabold text-text">Academia de Filosofía</p>
                <p className="text-xs text-text-muted">Lógica, ética y las grandes preguntas.</p>
              </div>
            </Link>
            <Link
              to="/academia-china"
              className="flex items-center gap-3 rounded-2xl border border-border bg-gradient-to-br from-red-600/20 to-amber-500/10 p-5 transition hover:border-red-500/40"
            >
              <span className="text-4xl">🐉</span>
              <div>
                <p className="font-extrabold text-text">{t('nav.items.academiaChina')}</p>
                <p className="text-xs text-text-muted">{t('dashboard.academias.chinaBlurb')}</p>
              </div>
            </Link>
            {schoolCards.map((c) => (
              <Link
                key={c.name}
                to={`/escuela-categoria/${c.mainId}?sub=${encodeURIComponent(c.name)}`}
                className="flex items-center gap-3 rounded-2xl border border-border p-5 transition hover:brightness-95"
                style={{ background: `linear-gradient(135deg, ${c.accent}33, ${c.accent}11)` }}
              >
                <span className="text-4xl">{c.icon}</span>
                <div>
                  <p className="font-extrabold text-text">{localizeCategoryName(c.name, lang)}</p>
                  <p className="text-xs text-text-muted">{c.blurb} · {c.count} {c.count === 1 ? t('dashboard.courseSingular') : t('dashboard.coursePlural')}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <MascotCompanion />
    </div>
  )
}
