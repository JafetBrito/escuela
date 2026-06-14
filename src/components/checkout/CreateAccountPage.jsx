import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import Button from '../shared/Button'
import Card from '../shared/Card'
import Logo from '../shared/Logo'
import MascotMesh from '../mascot/MascotMesh'
import { MASCOTS, getMascotById } from '../../data/mascotRegistry'
import { useAuthStore } from '../../stores/useAuthStore'
import { useMascotStore } from '../../stores/useMascotStore'
import { useSettingsStore, CHAT_MODELS } from '../../stores/useSettingsStore'
import { isSupabaseConfigured } from '../../services/supabase/client'
import { renderGoogleButton, isGoogleAuthConfigured } from '../../services/auth/googleAuth'

const FACEBOOK_ENABLED = import.meta.env.VITE_ENABLE_FACEBOOK_LOGIN === 'true'

// Solo se muestran las mascotas con un modelo 3D real (.glb) — las geometrías
// primitivas (cubo, esfera, etc.) eran placeholders y ya no se usan.
const SELECTABLE_MASCOTS = MASCOTS.filter((m) => m.modelPath)

const STEPS = ['Tu cuenta', 'Tu mascota', 'Configuración', 'Listo']

export default function CreateAccountPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const presetCourseId = params.get('course')

  const signUpWithEmail = useAuthStore((s) => s.signUpWithEmail)
  const signInWithOAuth = useAuthStore((s) => s.signInWithOAuth)
  const registerWithGoogle = useAuthStore((s) => s.registerWithGoogle)
  const session = useAuthStore((s) => s.session)
  const selectMascot = useMascotStore((s) => s.selectMascot)
  const setMascotName = useSettingsStore((s) => s.setMascotName)
  const setMinimaxApiKey = useSettingsStore((s) => s.setMinimaxApiKey)
  const setChatModel = useSettingsStore((s) => s.setChatModel)

  const [step, setStep] = useState(0)
  const [mascotId, setMascotId] = useState(SELECTABLE_MASCOTS[0]?.id ?? 8)
  const [petName, setPetName] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [chatModel, setChatModelLocal] = useState(CHAT_MODELS[0].id)
  const [status, setStatus] = useState('idle') // idle | processing | done
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const googleButtonRef = useRef(null)

  const mascot = getMascotById(mascotId)
  const supabaseReady = isSupabaseConfigured()

  // Local-mode fallback: lets people sign up with Google without Supabase.
  useEffect(() => {
    if (supabaseReady || !googleButtonRef.current) return
    renderGoogleButton(
      googleButtonRef.current,
      (googleUser) => {
        registerWithGoogle(googleUser)
        setStep(1)
      },
      (err) => setError(err.message),
    )
  }, [supabaseReady, registerWithGoogle])

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')
    setStatus('processing')
    try {
      await signUpWithEmail(email, password, displayName)
      setStep(1)
    } catch (err) {
      setError(err.message)
    } finally {
      setStatus('idle')
    }
  }

  const handleOAuth = async (provider) => {
    setError('')
    try {
      await signInWithOAuth(provider)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleFinish = (e) => {
    e.preventDefault()
    setStatus('processing')

    setTimeout(() => {
      selectMascot(mascotId)
      setMascotName(petName || mascot.name)
      if (apiKey) setMinimaxApiKey(apiKey)
      setChatModel(chatModel)

      setStatus('done')
      setStep(3)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(152,202,63,0.18),transparent_60%)]" />

      <header className="flex items-center justify-between px-6 py-5 md:px-12">
        <Link to="/">
          <Logo />
        </Link>
        <Link to="/login" className="text-sm text-text-muted hover:text-text">
          ¿Ya tienes cuenta? Inicia sesión →
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-8">
        <div className="w-full max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold md:text-4xl">
              Crea tu cuenta <span className="text-primary">épica</span>
            </h1>
            <p className="mt-2 text-text-muted">
              Regístrate gratis, elige tu mascota IA y tu configuración. Entra a todos los
              cursos y, sin llave, prueba las primeras 2 clases de cada uno.
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
                <h2 className="text-xl font-bold">1. Crea tu cuenta</h2>

                {supabaseReady ? (
                  <>
                    <form onSubmit={handleSignUp} className="flex flex-col gap-3">
                      <label className="flex flex-col gap-1 text-sm">
                        Nombre
                        <input
                          type="text"
                          required
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="rounded-lg border border-border bg-background px-4 py-2.5 text-text outline-none focus:border-primary"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm">
                        Correo
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="rounded-lg border border-border bg-background px-4 py-2.5 text-text outline-none focus:border-primary"
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm">
                        Contraseña
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="rounded-lg border border-border bg-background px-4 py-2.5 text-text outline-none focus:border-primary"
                        />
                      </label>
                      {session ? (
                        <Button type="button" onClick={() => setStep(1)} className="mt-1">
                          Ya tienes sesión, continuar →
                        </Button>
                      ) : (
                        <Button type="submit" disabled={status === 'processing'} className="mt-1">
                          {status === 'processing' ? 'Creando…' : 'Crear mi cuenta'}
                        </Button>
                      )}
                    </form>

                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-xs uppercase tracking-wide text-text-muted">o regístrate con</span>
                      <div className="h-px flex-1 bg-border" />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button variant="secondary" onClick={() => handleOAuth('google')}>
                        🟢 Continuar con Google
                      </Button>
                      {FACEBOOK_ENABLED && (
                        <Button variant="secondary" onClick={() => handleOAuth('facebook')}>
                          🔵 Continuar con Facebook
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <p className="text-sm text-text-muted">
                      Las cuentas en la nube aún no están configuradas en este sitio.
                      Regístrate con Google para usar el modo local.
                    </p>
                    <div ref={googleButtonRef} />
                    {!isGoogleAuthConfigured() && (
                      <p className="text-xs text-text-muted">
                        El registro con Google tampoco está configurado todavía.
                      </p>
                    )}
                    <Button onClick={() => setStep(1)} className="mt-2">
                      Continuar sin cuenta →
                    </Button>
                  </div>
                )}

                {error && (
                  <div className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
                    {error}
                  </div>
                )}
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
                  {SELECTABLE_MASCOTS.map((m) => (
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
              <form onSubmit={handleFinish} className="flex flex-col gap-5">
                <h2 className="text-xl font-bold">3. Configuración de tu mascota</h2>

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
                  <p className="font-semibold text-text">Resumen</p>
                  <ul className="mt-2 space-y-1 text-text-muted">
                    <li>
                      Mascota: <span className="text-text">{petName || mascot.name}</span>
                    </li>
                    <li>
                      Acceso: <span className="text-text">todos los cursos · primeras 2 clases gratis</span>
                    </li>
                  </ul>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                    ← Atrás
                  </Button>
                  <Button type="submit" disabled={status === 'processing'}>
                    {status === 'processing' ? 'Guardando…' : 'Crear mi cuenta'}
                  </Button>
                </div>
              </form>
            )}

            {step === 3 && (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <span className="text-6xl">🎉</span>
                <h2 className="text-2xl font-bold">¡Tu cuenta está lista!</h2>
                <p className="max-w-md text-text-muted">
                  {petName || mascot.name} ya te está esperando. Puedes entrar a cualquier
                  curso y probar las primeras 2 clases gratis.
                  {presetCourseId && ' '}
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button onClick={() => navigate('/dashboard')} className="mt-2">
                    Entrar al Dashboard →
                  </Button>
                  <Button variant="secondary" onClick={() => navigate('/unlock')} className="mt-2">
                    🔑 Tengo una llave
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}
