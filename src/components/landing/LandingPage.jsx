import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Button from '../shared/Button'
import Logo from '../shared/Logo'
import courses from '../../data/courses.json'
import { useAuthStore } from '../../stores/useAuthStore'

const CATEGORY_ICONS = {
  'Inteligencia Artificial': '🧠',
  Productividad: '⏳',
  Diseño: '🎨',
  Idiomas: '🗣️',
  Programación: '🐉',
  Pruebas: '🧪',
  Otros: '📚',
}

export default function LandingPage() {
  const isUnlocked = useAuthStore((s) => s.isUnlocked)

  const categories = useMemo(() => {
    const groups = new Map()
    for (const course of courses) {
      const key = course.category ?? 'Otros'
      if (!groups.has(key)) groups.set(key, { total: 0, available: 0 })
      const entry = groups.get(key)
      entry.total += 1
      if (!course.locked) entry.available += 1
    }
    return Array.from(groups.entries()).map(([category, stats]) => ({
      category,
      ...stats,
      icon: CATEGORY_ICONS[category] ?? '📚',
    }))
  }, [])

  return (
    <div className="min-h-screen bg-background text-text">
      <header className="flex items-center justify-between px-6 py-5 md:px-12">
        <Logo />
        <Link to="/unlock">
          <Button variant="ghost">Ya tengo mi llave</Button>
        </Link>
      </header>

      <main className="px-6 md:px-12">
        <section className="mx-auto flex max-w-4xl flex-col items-center gap-6 py-16 text-center">
          <span className="rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
            Somos una escuela · Muchos cursos · Una sola llave
          </span>
          <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
            Aprende a tu ritmo con <span className="text-primary">oliver.escuela</span>
          </h1>
          <p className="max-w-2xl text-lg text-text-muted">
            Cada curso tiene su propia mascota IA que te acompaña clase por clase. Consigue tu
            llave maestra para todos los cursos, o una llave para el curso que más te interese.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link to={isUnlocked ? '/dashboard' : '/unlock'}>
              <Button className="px-8 py-4 text-lg">
                {isUnlocked ? 'Ir a mi Dashboard' : 'Registrarme gratis'}
              </Button>
            </Link>
            <Link to="/crear-cuenta">
              <Button variant="secondary" className="px-8 py-4 text-lg">
                Comprar mi llave
              </Button>
            </Link>
          </div>
          {!isUnlocked && (
            <p className="text-sm text-text-muted">
              Regístrate con Google y prueba gratis el curso demo de la plataforma.
            </p>
          )}
        </section>

        <section className="mx-auto max-w-5xl pb-16">
          <h2 className="mb-4 text-center text-2xl font-bold">Categorías de cursos</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <div
                key={cat.category}
                className={`flex flex-col gap-2 rounded-2xl border p-5 ${
                  cat.available > 0
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border bg-surface opacity-70'
                }`}
              >
                <span className="text-3xl">{cat.icon}</span>
                <h3 className="text-lg font-bold">{cat.category}</h3>
                <p className="text-sm text-text-muted">
                  {cat.available > 0
                    ? `${cat.available} curso${cat.available > 1 ? 's' : ''} disponible${cat.available > 1 ? 's' : ''}`
                    : `${cat.total} próximamente`}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-6 pb-24 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-6 text-left">
            <div className="mb-3 text-3xl">🔑</div>
            <h2 className="mb-2 text-lg font-bold">Dos tipos de llave</h2>
            <p className="text-sm text-text-muted">
              Una llave de un solo curso te da acceso a ese curso. Una llave maestra te abre todos
              los cursos, ahora y a futuro.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-6 text-left">
            <div className="mb-3 text-3xl">🪙</div>
            <h2 className="mb-2 text-lg font-bold">Gana monedas</h2>
            <p className="text-sm text-text-muted">
              Cada misión que completas dentro de un curso te da monedas para gastar en la tienda
              de objetos cosméticos para tu mascota.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-6 text-left">
            <div className="mb-3 text-3xl">🤖</div>
            <h2 className="mb-2 text-lg font-bold">Tu mascota IA</h2>
            <p className="text-sm text-text-muted">
              En cada curso te acompaña una mascota 3D que responde tus dudas y te guía clase por
              clase.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-8 text-center text-sm text-text-muted md:px-12">
        © {new Date().getFullYear()} oliver.escuela — Una escuela, muchos cursos por explorar.
      </footer>
    </div>
  )
}
