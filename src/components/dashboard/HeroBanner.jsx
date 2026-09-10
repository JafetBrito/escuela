import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n'

// Banner de bienvenida calcado de la referencia (ilustración + saludo a la
// izquierda, tarjeta de CTA aparte a la derecha) — sin librería de
// ilustraciones, la "ilustración" es la mascota en grande sobre formas
// decorativas con CSS. El CTA es real: manda al curso en progreso, o a
// Academias si no hay ninguno (nunca "Create New Course" inventado — este es
// un dashboard de alumno, no de instructor).
export default function HeroBanner({ displayName, mascotEmoji, isAdmin, ctaCourseId }) {
  const { t } = useI18n()
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
      <div className="relative flex items-center gap-5 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-16 bottom-0 h-24 w-24 rounded-full bg-amber-400/10 blur-xl"
        />
        <span className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-primary/40 bg-surface text-4xl shadow-lg sm:h-24 sm:w-24 sm:text-5xl">
          {mascotEmoji}
        </span>
        <div className="relative min-w-0">
          <h1 className="text-xl font-black text-text sm:text-2xl">
            {t('dashboard.greeting', { name: displayName })}{isAdmin ? ' 🛡️' : ' 👋'}
          </h1>
          <p className="mt-1 text-sm text-text-muted">{t('dashboard.greetingSub')}</p>
        </div>
      </div>

      <div className="flex flex-col justify-center gap-3 rounded-2xl border border-border bg-surface p-5 text-center">
        <p className="text-sm font-bold text-text">{t('dashboard.hero.ctaTitle')}</p>
        <Link
          to={ctaCourseId ? `/learn/${ctaCourseId}` : '/academias'}
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-background transition hover:opacity-90"
        >
          {ctaCourseId ? t('dashboard.continuar') : t('dashboard.hero.ctaExplore')}
        </Link>
      </div>
    </div>
  )
}
