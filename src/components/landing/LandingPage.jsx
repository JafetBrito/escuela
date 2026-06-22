import { useMemo, Suspense } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import Button from '../shared/Button'
import Logo from '../shared/Logo'
import MascotMesh from '../mascot/MascotMesh'
import WelcomeVideoModal from './WelcomeVideoModal'
import courses from '../../data/courses.json'
import { useAuthStore } from '../../stores/useAuthStore'
import { getMascotById } from '../../data/mascotRegistry'
import { CATEGORY_META, getCategoryMeta } from '../../data/categoryMeta'
import { isSupabaseConfigured } from '../../services/supabase/client'

const ORANGE_CAT = getMascotById(8)

const STEPS = [
  {
    icon: '🔑',
    title: '1. Consigue tu llave',
    text: 'Regístrate gratis con Google para probar el curso demo, o compra una llave de un curso o la llave maestra para todos.',
  },
  {
    icon: '🤖',
    title: '2. Conoce a tu mascota',
    text: 'Elige una mascota IA en 3D que te acompaña en cada clase, responde tus dudas y celebra tu progreso.',
  },
  {
    icon: '🚀',
    title: '3. Aprende y gana',
    text: 'Avanza por misiones, gana monedas y experiencia, y personaliza tu mascota en la tienda con objetos y skins.',
  },
]

const FEATURES = [
  {
    icon: '🔑',
    title: 'Dos tipos de llave',
    text: 'Una llave de un solo curso te da acceso a ese curso. Una llave maestra te abre todos los cursos, ahora y a futuro.',
  },
  {
    icon: '🪙',
    title: 'Gana monedas',
    text: 'Cada misión que completas dentro de un curso te da monedas para gastar en la tienda de objetos, libros y personalidades de IA.',
  },
  {
    icon: '🤖',
    title: 'Tu mascota IA',
    text: 'En cada curso te acompaña una mascota 3D que responde tus dudas y te guía clase por clase.',
  },
  {
    icon: '📚',
    title: 'Biblioteca incluida',
    text: 'Explora una biblioteca por categorías con libros gratuitos y de pago para reforzar lo que aprendes.',
  },
  {
    icon: '🏆',
    title: 'Logros y niveles',
    text: 'Sube de nivel, desbloquea logros y presume tus medallas por cada curso completado.',
  },
  {
    icon: '🎨',
    title: 'Personalización total',
    text: 'Cambia el skin, los accesorios y los objetos de tu mascota para hacerla única.',
  },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const isUnlocked = useAuthStore((s) => s.isUnlocked)
  const session = useAuthStore((s) => s.session)
  const signOut = useAuthStore((s) => s.signOut)
  const loggedIn = isSupabaseConfigured() ? Boolean(session) : isUnlocked

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

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
      ...getCategoryMeta(category),
    }))
  }, [])

  const totalCourses = courses.length
  const availableCourses = courses.filter((c) => !c.locked).length

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-text">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-12">
          <Link to="/" className="flex items-center gap-1.5">
            <Logo />
            <span aria-hidden="true">🐱</span>
          </Link>
          <div className="flex items-center gap-3">
            {loggedIn ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost">Mi Dashboard</Button>
                </Link>
                <Button onClick={handleSignOut}>Cerrar sesión</Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Iniciar sesión</Button>
                </Link>
                <Link to="/crear-cuenta" className="hidden sm:block">
                  <Button>Crear cuenta</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative isolate overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-32 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#34d399]/15 blur-3xl" />
            <div className="absolute -left-20 top-1/3 h-64 w-64 rounded-full bg-[#38bdf8]/10 blur-3xl" />
          </div>

          <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-20 text-center md:px-12 md:py-28">
            <span className="rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
              ✨ Somos una escuela · Muchos cursos · Una sola llave
            </span>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
              Aprende a tu ritmo con{' '}
              <span className="bg-gradient-to-r from-primary to-[#34d399] bg-clip-text text-transparent">
                Oliver Academy
              </span>
            </h1>
            <p className="max-w-2xl text-lg text-text-muted">
              Cada curso tiene su propia mascota IA en 3D que te acompaña clase por clase, responde
              tus dudas y te ayuda a no perder el ritmo. Consigue tu llave maestra para todos los
              cursos, o una llave para el curso que más te interese.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link to={loggedIn ? '/dashboard' : '/crear-cuenta'}>
                <Button className="px-8 py-4 text-lg shadow-lg shadow-primary/20">
                  {loggedIn ? 'Ir a mi Dashboard' : 'Registrarme gratis'}
                </Button>
              </Link>
              <Link to="/unlock">
                <Button variant="secondary" className="px-8 py-4 text-lg">
                  Ya tengo mi llave
                </Button>
              </Link>
            </div>
            {!loggedIn && (
              <p className="text-sm text-text-muted">
                Crea tu cuenta gratis y entra a todos los cursos — prueba las primeras 2 clases
                de cada uno sin tarjeta.
              </p>
            )}

            {/* Stat strip */}
            <div className="mt-8 grid w-full max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Cursos', value: `${totalCourses}+` },
                { label: 'Disponibles ahora', value: availableCourses },
                { label: 'Mascotas IA', value: '13' },
                { label: 'Categorías', value: Object.keys(CATEGORY_META).length - 1 },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border bg-surface/60 p-4 backdrop-blur-sm"
                >
                  <p className="text-2xl font-extrabold text-primary">{stat.value}</p>
                  <p className="text-xs text-text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-6xl px-6 pb-20 md:px-12">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold md:text-3xl">¿Cómo funciona?</h2>
            <p className="mt-2 text-text-muted">Tres pasos para empezar a aprender hoy mismo.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((step) => (
              <div
                key={step.title}
                className="relative flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6 transition-transform hover:-translate-y-1 hover:border-primary/40"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                  {step.icon}
                </span>
                <h3 className="text-lg font-bold">{step.title}</h3>
                <p className="text-sm text-text-muted">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="mx-auto max-w-6xl px-6 pb-20 md:px-12">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold md:text-3xl">Categorías de cursos</h2>
            <p className="mt-2 text-text-muted">
              Explora lo que ya está disponible y lo que viene próximamente.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <div
                key={cat.category}
                className={`group relative overflow-hidden rounded-2xl border p-5 transition-transform hover:-translate-y-1 ${
                  cat.available > 0
                    ? 'border-primary/30 bg-surface'
                    : 'border-border bg-surface opacity-70'
                }`}
              >
                <div
                  className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${cat.gradient} opacity-20 blur-xl transition-opacity group-hover:opacity-40`}
                />
                <span className="text-3xl">{cat.icon}</span>
                <h3 className="mt-2 text-lg font-bold">{cat.category}</h3>
                <p className="text-sm text-text-muted">
                  {cat.available > 0
                    ? `${cat.available} curso${cat.available > 1 ? 's' : ''} disponible${cat.available > 1 ? 's' : ''}`
                    : `${cat.total} próximamente`}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-6 pb-20 md:px-12">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold md:text-3xl">Todo lo que incluye tu cuenta</h2>
            <p className="mt-2 text-text-muted">
              Una sola cuenta guarda tu progreso, tu mascota y todo lo que vayas desbloqueando.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6 text-left transition-colors hover:border-primary/40"
              >
                <div className="text-3xl">{feature.icon}</div>
                <h3 className="text-lg font-bold">{feature.title}</h3>
                <p className="text-sm text-text-muted">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-5xl px-6 pb-24 md:px-12">
          <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-surface to-[#34d399]/10 p-10 text-center">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
            <h2 className="text-2xl font-extrabold md:text-3xl">
              Tu mascota IA ya te está esperando 🐾
            </h2>
            <div className="mx-auto mt-4 h-48 w-48 overflow-hidden rounded-2xl border border-border bg-background/40">
              <Canvas camera={{ position: [0, 0, 3.5], fov: 45 }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[3, 3, 3]} intensity={1.2} />
                <Suspense fallback={null}>
                  <MascotMesh mascot={ORANGE_CAT} />
                </Suspense>
              </Canvas>
            </div>
            <p className="mx-auto mt-3 max-w-xl text-text-muted">
              Crea tu cuenta gratis y entra a todos los cursos — las primeras 2 clases de cada
              uno son gratis. Consigue tu llave cuando quieras desbloquear el resto.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to={loggedIn ? '/dashboard' : '/crear-cuenta'}>
                <Button className="px-8 py-4 text-lg shadow-lg shadow-primary/20">
                  {loggedIn ? 'Ir a mi Dashboard' : 'Crear mi cuenta'}
                </Button>
              </Link>
              <Link to="/unlock">
                <Button variant="secondary" className="px-8 py-4 text-lg">
                  Ya tengo mi llave
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-8 text-center text-sm text-text-muted md:px-12">
        © {new Date().getFullYear()} Oliver Academy — Una escuela, muchos cursos por explorar.
      </footer>

      <WelcomeVideoModal />
    </div>
  )
}
