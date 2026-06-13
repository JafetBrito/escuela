import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import Button from '../shared/Button'
import Card from '../shared/Card'
import Logo from '../shared/Logo'
import MascotMesh from '../mascot/MascotMesh'
import { MASCOTS, getMascotById } from '../../data/mascotRegistry'
import { COURSES_DATA, hasCourseData } from '../../data/courseRegistry'
import courses from '../../data/courses.json'
import { generateMockLicense } from '../../services/crypto/keyCrypto'
import { useAuthStore } from '../../stores/useAuthStore'
import { useMascotStore } from '../../stores/useMascotStore'
import { useSettingsStore, CHAT_MODELS } from '../../stores/useSettingsStore'

const PURCHASABLE_COURSES = courses.filter((c) => hasCourseData(c.id))

const STEPS = ['Tu llave', 'Tu mascota', 'Configuración', 'Listo']

export default function CreateAccountPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const presetCourseId = params.get('course')
  const presetCourse = PURCHASABLE_COURSES.find((c) => c.id === presetCourseId)

  const unlock = useAuthStore((s) => s.unlock)
  const selectMascot = useMascotStore((s) => s.selectMascot)
  const setMascotName = useSettingsStore((s) => s.setMascotName)
  const setMinimaxApiKey = useSettingsStore((s) => s.setMinimaxApiKey)
  const setChatModel = useSettingsStore((s) => s.setChatModel)

  const [step, setStep] = useState(0)
  const [keyType, setKeyType] = useState(presetCourse ? 'single' : 'full')
  const [courseId, setCourseId] = useState(presetCourse?.id ?? PURCHASABLE_COURSES[0]?.id)
  const [mascotId, setMascotId] = useState(8)
  const [petName, setPetName] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [chatModel, setChatModelLocal] = useState(CHAT_MODELS[0].id)
  const [status, setStatus] = useState('idle') // idle | processing | done

  const mascot = getMascotById(mascotId)
  const price = keyType === 'full' ? 99 : 49

  const handleCreate = (e) => {
    e.preventDefault()
    setStatus('processing')

    // MOCK: replace with Stripe Checkout redirect / payment intent flow.
    setTimeout(() => {
      const license = generateMockLicense({
        courseId: keyType === 'full' ? 'course-001' : courseId,
        type: keyType,
      })

      unlock(license)
      selectMascot(mascotId)
      setMascotName(petName || mascot.name)
      if (apiKey) setMinimaxApiKey(apiKey)
      setChatModel(chatModel)

      setStatus('done')
      setStep(3)
    }, 900)
  }

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(152,202,63,0.18),transparent_60%)]" />

      <header className="flex items-center justify-between px-6 py-5 md:px-12">
        <Link to="/">
          <Logo />
        </Link>
        <Link to="/unlock" className="text-sm text-text-muted hover:text-text">
          Ya tengo mi llave →
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-8">
        <div className="w-full max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold md:text-4xl">
              Crea tu cuenta <span className="text-primary">épica</span>
            </h1>
            <p className="mt-2 text-text-muted">
              Elige tu llave, tu mascota IA y tu configuración. Todo queda guardado en una sola
              cuenta.
            </p>
          </div>

          {/* Step indicator */}
          <div className="mb-6 flex items-center justify-center gap-2">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
                    i <= step
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-text-muted'
                  }`}
                >
                  {i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 w-6 md:w-12 ${i < step ? 'bg-primary' : 'bg-border'}`} />
                )}
              </div>
            ))}
          </div>

          <Card className="overflow-hidden border-2">
            {step === 0 && (
              <div className="flex flex-col gap-5">
                <h2 className="text-xl font-bold">1. Elige tu llave</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <button
                    onClick={() => setKeyType('full')}
                    className={`flex flex-col gap-2 rounded-2xl border-2 p-5 text-left transition-colors ${
                      keyType === 'full'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <span className="text-3xl">🔑</span>
                    <p className="text-lg font-bold">Llave maestra</p>
                    <p className="text-sm text-text-muted">
                      Acceso a todos los cursos disponibles, ahora y a futuro.
                    </p>
                    <p className="mt-2 text-2xl font-extrabold text-primary">$99 USD</p>
                  </button>

                  <button
                    onClick={() => setKeyType('single')}
                    className={`flex flex-col gap-2 rounded-2xl border-2 p-5 text-left transition-colors ${
                      keyType === 'single'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <span className="text-3xl">🗝️</span>
                    <p className="text-lg font-bold">Llave de un curso</p>
                    <p className="text-sm text-text-muted">
                      Acceso a un solo curso a tu elección.
                    </p>
                    <p className="mt-2 text-2xl font-extrabold text-primary">$49 USD</p>
                  </button>
                </div>

                {keyType === 'single' && (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold text-text-muted">Elige tu curso</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {PURCHASABLE_COURSES.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setCourseId(c.id)}
                          className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                            courseId === c.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/40'
                          }`}
                        >
                          <span
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl"
                            style={{ backgroundColor: `${c.color}22`, border: `1px solid ${c.color}` }}
                          >
                            {c.icon}
                          </span>
                          <span>
                            <span className="block text-sm font-semibold text-text">{c.title}</span>
                            <span className="block text-xs text-text-muted">{c.category}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <Button onClick={() => setStep(1)} className="mt-2 self-end">
                  Continuar →
                </Button>
              </div>
            )}

            {step === 1 && (
              <div className="flex flex-col gap-5">
                <h2 className="text-xl font-bold">2. Elige y nombra tu mascota</h2>

                <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-surface to-background">
                  <div className="h-56 w-full">
                    <Canvas camera={{ position: [0, 0, 3.5], fov: 45 }}>
                      <ambientLight intensity={0.6} />
                      <directionalLight position={[3, 3, 3]} intensity={1.2} />
                      <Suspense fallback={null}>
                        <MascotMesh mascot={mascot} />
                      </Suspense>
                    </Canvas>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                  {MASCOTS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMascotId(m.id)}
                      title={m.name}
                      className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 text-xs font-semibold transition-colors ${
                        mascotId === m.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-text-muted hover:border-primary/40'
                      }`}
                    >
                      <span
                        className="block h-5 w-5 rounded-full"
                        style={{ backgroundColor: m.color }}
                      />
                    </button>
                  ))}
                </div>

                <label className="flex flex-col gap-1 text-sm">
                  Nombre de tu mascota
                  <input
                    type="text"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder={mascot.name}
                    className="rounded-lg border border-border bg-background px-4 py-3 text-text outline-none focus:border-primary"
                  />
                </label>

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(0)}>
                    ← Atrás
                  </Button>
                  <Button onClick={() => setStep(2)}>Continuar →</Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={handleCreate} className="flex flex-col gap-5">
                <h2 className="text-xl font-bold">3. Configuración y pago</h2>

                <label className="flex flex-col gap-1 text-sm">
                  Tu Minimax API key (opcional, puedes agregarla después)
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="mx-..."
                    className="rounded-lg border border-border bg-background px-4 py-3 font-mono text-text outline-none focus:border-primary"
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm">
                  Modelo de chat para tu mascota
                  <select
                    value={chatModel}
                    onChange={(e) => setChatModelLocal(e.target.value)}
                    className="rounded-lg border border-border bg-background px-4 py-3 text-text outline-none focus:border-primary"
                  >
                    {CHAT_MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="rounded-xl border border-border bg-background p-4 text-sm">
                  <p className="font-semibold text-text">Resumen de tu pedido</p>
                  <ul className="mt-2 space-y-1 text-text-muted">
                    <li>
                      Llave:{' '}
                      <span className="text-text">
                        {keyType === 'full'
                          ? 'Maestra (todos los cursos)'
                          : `Un curso · ${COURSES_DATA[courseId]?.title ?? courseId}`}
                      </span>
                    </li>
                    <li>
                      Mascota: <span className="text-text">{petName || mascot.name}</span>
                    </li>
                  </ul>
                  <p className="mt-3 flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-primary">${price}</span>
                    <span className="text-xs text-text-muted">USD · pago único (mock)</span>
                  </p>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                    ← Atrás
                  </Button>
                  <Button type="submit" disabled={status === 'processing'}>
                    {status === 'processing' ? 'Procesando pago…' : 'Pagar y crear mi cuenta'}
                  </Button>
                </div>
              </form>
            )}

            {step === 3 && (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <span className="text-6xl">🎉</span>
                <h2 className="text-2xl font-bold">¡Tu cuenta está lista!</h2>
                <p className="max-w-md text-text-muted">
                  {petName || mascot.name} ya te está esperando. Tu llave y tu configuración se
                  guardaron en tu cuenta.
                </p>
                <Button onClick={() => navigate('/dashboard')} className="mt-2">
                  Entrar al Dashboard →
                </Button>
              </div>
            )}
          </Card>

          <p className="mt-4 text-center text-xs text-text-muted">
            Pasarela de pago simulada — se integrará con Stripe Checkout.
          </p>
        </div>
      </main>
    </div>
  )
}
