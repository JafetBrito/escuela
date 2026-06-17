import { useEffect, useRef, useState, Suspense } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import Button from '../shared/Button'
import Card from '../shared/Card'
import Logo from '../shared/Logo'
import MascotMesh from '../mascot/MascotMesh'
import { MASCOTS, getMascotById } from '../../data/mascotRegistry'
import { useAuthStore } from '../../stores/useAuthStore'
import { useMascotStore } from '../../stores/useMascotStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { useGameStore, PLAYER_CLASSES, OLIVER_CLASSES, PLAYER_AVATARS } from '../../stores/useGameStore'
import { isSupabaseConfigured } from '../../services/supabase/client'
import { renderGoogleButton, isGoogleAuthConfigured } from '../../services/auth/googleAuth'

const FACEBOOK_ENABLED = import.meta.env.VITE_ENABLE_FACEBOOK_LOGIN === 'true'

const SELECTABLE_MASCOTS = MASCOTS.filter((m) => m.modelPath)

const STEPS = [
  { label: 'Cuenta',   icon: '👤' },
  { label: 'Avatar',   icon: '🎭' },
  { label: 'Clase',    icon: '⚔️' },
  { label: 'Mascota',  icon: '🐱' },
  { label: 'Compañero',icon: '✨' },
  { label: '¡Listo!',  icon: '🚀' },
]

export default function CreateAccountPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const presetCourseId = params.get('course')

  const signUpWithEmail   = useAuthStore((s) => s.signUpWithEmail)
  const signInWithOAuth   = useAuthStore((s) => s.signInWithOAuth)
  const registerWithGoogle = useAuthStore((s) => s.registerWithGoogle)
  const session            = useAuthStore((s) => s.session)

  const selectMascot      = useMascotStore((s) => s.selectMascot)
  const setMascotName     = useSettingsStore((s) => s.setMascotName)

  const setPlayerAvatar   = useGameStore((s) => s.setPlayerAvatar)
  const selectPlayerClass = useGameStore((s) => s.selectPlayerClass)
  const selectOliverClass = useGameStore((s) => s.selectOliverClass)
  const setWorldTreeCompleted = useGameStore((s) => s.setWorldTreeCompleted)
  const forceSyncToCloud  = useGameStore((s) => s.forceSyncToCloud)

  const [step, setStep]   = useState(0)
  const [status, setStatus] = useState('idle')
  const [error, setError]   = useState('')

  // Step 0 – account
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [displayName, setDisplayName] = useState('')

  // Step 1 – avatar
  const [avatarId, setAvatarId]     = useState(PLAYER_AVATARS[0].id)

  // Step 2 – player class
  const [playerClassId, setPlayerClassId] = useState(null)

  // Step 3 – mascot
  const [mascotId, setMascotId]     = useState(SELECTABLE_MASCOTS[0]?.id ?? 8)
  const [petName, setPetName]       = useState('')

  // Step 4 – oliver class
  const [oliverClassId, setOliverClassId] = useState(null)

  const mascot        = getMascotById(mascotId)
  const supabaseReady = isSupabaseConfigured()
  const googleButtonRef = useRef(null)

  useEffect(() => {
    if (supabaseReady || !googleButtonRef.current) return
    renderGoogleButton(
      googleButtonRef.current,
      (googleUser) => { registerWithGoogle(googleUser); setStep(1) },
      (err) => setError(err.message),
    )
  }, [supabaseReady, registerWithGoogle])

  // ── handlers ──────────────────────────────────────────────────────────────

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError(''); setStatus('processing')
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
    try { await signInWithOAuth(provider) }
    catch (err) { setError(err.message) }
  }

  const handleFinish = async () => {
    setStatus('processing')
    // Apply all selections to stores
    setPlayerAvatar(avatarId)
    if (playerClassId) selectPlayerClass(playerClassId)
    selectMascot(mascotId)
    setMascotName(petName || mascot.name)
    if (oliverClassId) selectOliverClass(oliverClassId)
    setWorldTreeCompleted(true)
    // Force-save so it persists immediately
    try { await forceSyncToCloud() } catch { /* best effort */ }
    setStatus('idle')
    setStep(5)
  }

  // ── step renders ──────────────────────────────────────────────────────────

  const pClass = playerClassId ? PLAYER_CLASSES[playerClassId] : null

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(152,202,63,0.18),transparent_60%)]" />

      <header className="flex items-center justify-between px-6 py-5 md:px-12">
        <Link to="/"><Logo /></Link>
        <Link to="/login" className="text-sm text-text-muted hover:text-text">
          ¿Ya tienes cuenta? →
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-8">
        <div className="w-full max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold md:text-4xl">
              Crea tu cuenta <span className="text-primary">épica</span>
            </h1>
            <p className="mt-2 text-text-muted">Elige tu identidad y entra al campus virtual.</p>
          </div>

          {/* Step indicator */}
          <div className="mb-6 flex items-center justify-center gap-1 overflow-x-auto pb-1">
            {STEPS.map((s, i) => (
              <div key={s.label} className="flex items-center gap-1">
                <div className="flex flex-col items-center gap-0.5">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
                    i < step  ? 'border-primary bg-primary text-background'
                    : i === step ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-text-muted'
                  }`}>
                    {i < step ? '✓' : s.icon}
                  </div>
                  <span className={`hidden text-[9px] font-semibold sm:block ${i === step ? 'text-primary' : 'text-text-muted'}`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`mb-3 h-0.5 w-4 md:w-8 ${i < step ? 'bg-primary' : 'bg-border'}`} />
                )}
              </div>
            ))}
          </div>

          <Card className="overflow-hidden border-2">

            {/* ── Step 0: Cuenta ── */}
            {step === 0 && (
              <div className="flex flex-col gap-5">
                <h2 className="text-xl font-bold">1. Crea tu cuenta</h2>

                {supabaseReady ? (
                  <>
                    <form onSubmit={handleSignUp} className="flex flex-col gap-3">
                      <label className="flex flex-col gap-1 text-sm">
                        Nombre
                        <input type="text" required value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                          className="rounded-lg border border-border bg-background px-4 py-2.5 text-text outline-none focus:border-primary" />
                      </label>
                      <label className="flex flex-col gap-1 text-sm">
                        Correo
                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                          className="rounded-lg border border-border bg-background px-4 py-2.5 text-text outline-none focus:border-primary" />
                      </label>
                      <label className="flex flex-col gap-1 text-sm">
                        Contraseña
                        <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                          className="rounded-lg border border-border bg-background px-4 py-2.5 text-text outline-none focus:border-primary" />
                      </label>
                      {session ? (
                        <Button type="button" onClick={() => setStep(1)}>Ya tienes sesión — continuar →</Button>
                      ) : (
                        <Button type="submit" disabled={status === 'processing'}>
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
                      <Button variant="secondary" onClick={() => handleOAuth('google')}>🟢 Continuar con Google</Button>
                      {FACEBOOK_ENABLED && (
                        <Button variant="secondary" onClick={() => handleOAuth('facebook')}>🔵 Continuar con Facebook</Button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <p className="text-sm text-text-muted">Las cuentas en la nube no están configuradas. Regístrate con Google para el modo local.</p>
                    <div ref={googleButtonRef} />
                    {!isGoogleAuthConfigured() && (
                      <p className="text-xs text-text-muted">El registro con Google tampoco está configurado todavía.</p>
                    )}
                    <Button onClick={() => setStep(1)} className="mt-2">Continuar sin cuenta →</Button>
                  </div>
                )}

                {error && (
                  <div className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</div>
                )}
              </div>
            )}

            {/* ── Step 1: Avatar ── */}
            {step === 1 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="text-xl font-bold">2. Elige tu avatar</h2>
                  <p className="mt-1 text-sm text-text-muted">Así te verán otros jugadores en el campus virtual.</p>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                  {PLAYER_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setAvatarId(av.id)}
                      className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-3 transition-all ${
                        avatarId === av.id
                          ? 'border-transparent ring-2 ring-offset-2 ring-offset-background'
                          : 'border-border bg-background hover:border-border/60'
                      }`}
                      style={avatarId === av.id ? { borderColor: av.color, background: `${av.color}18`, boxShadow: `0 0 16px ${av.color}44`, '--tw-ring-color': av.color } : {}}
                    >
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-full text-3xl"
                        style={{ background: `${av.color}22`, border: `2px solid ${av.color}66` }}
                      >
                        {av.icon}
                      </div>
                      <span className="text-xs font-semibold text-text">{av.label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(0)}>← Atrás</Button>
                  <Button onClick={() => setStep(2)}>Continuar →</Button>
                </div>
              </div>
            )}

            {/* ── Step 2: Clase del jugador ── */}
            {step === 2 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="text-xl font-bold">3. Elige tu clase</h2>
                  <p className="mt-1 text-sm text-text-muted">
                    Define tu estilo de aprendizaje en el campus. Las subclases se desbloquean más adelante.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.values(PLAYER_CLASSES).map((cls) => (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => setPlayerClassId(cls.id)}
                      className={`flex flex-col gap-2 rounded-2xl border-2 p-4 text-left transition-all ${
                        playerClassId === cls.id
                          ? 'ring-2 ring-offset-2 ring-offset-background'
                          : 'border-border bg-background hover:border-border/60'
                      }`}
                      style={playerClassId === cls.id
                        ? { borderColor: cls.color, background: `${cls.color}12`, '--tw-ring-color': cls.color }
                        : {}}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{cls.icon}</span>
                        <div>
                          <p className="font-black text-text">{cls.name}</p>
                          <p className="text-xs text-text-muted">{cls.description}</p>
                        </div>
                      </div>
                      {/* Mini stat bars */}
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(cls.stats).map(([stat, val]) => (
                          <div key={stat} className="flex flex-col items-center gap-0.5">
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-1.5 w-1.5 rounded-full"
                                  style={{ background: i < val ? cls.color : 'rgba(128,128,128,0.2)' }} />
                              ))}
                            </div>
                            <span className="text-[8px] uppercase text-text-muted">{stat.slice(0, 3)}</span>
                          </div>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(1)}>← Atrás</Button>
                  <Button onClick={() => setStep(3)} disabled={!playerClassId}>
                    {playerClassId ? 'Continuar →' : 'Elige una clase'}
                  </Button>
                </div>
              </div>
            )}

            {/* ── Step 3: Mascota ── */}
            {step === 3 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="text-xl font-bold">4. Elige tu mascota</h2>
                  <p className="mt-1 text-sm text-text-muted">Tu compañero fiel durante todo el campus.</p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-surface to-background">
                  <div className="h-52 w-full">
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
                      <span className="block h-5 w-5 rounded-full" style={{ backgroundColor: m.color }} />
                    </button>
                  ))}
                </div>

                <label className="flex flex-col gap-1 text-sm">
                  Nombre de tu mascota
                  <input type="text" value={petName} onChange={(e) => setPetName(e.target.value)}
                    placeholder={mascot.name}
                    className="rounded-lg border border-border bg-background px-4 py-3 text-text outline-none focus:border-primary" />
                </label>

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(2)}>← Atrás</Button>
                  <Button onClick={() => setStep(4)}>Continuar →</Button>
                </div>
              </div>
            )}

            {/* ── Step 4: Clase de la mascota (Oliver) ── */}
            {step === 4 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="text-xl font-bold">5. Clase de {petName || mascot.name}</h2>
                  <p className="mt-1 text-sm text-text-muted">
                    Cada clase de compañero potencia una faceta distinta.
                    {pClass && (
                      <span className="ml-1 font-semibold" style={{ color: pClass.color }}>
                        La clase recomendada para {pClass.name} está resaltada.
                      </span>
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.values(OLIVER_CLASSES).map((ocls) => {
                    const isPaired = pClass && ocls.pairedWith === playerClassId
                    return (
                      <button
                        key={ocls.id}
                        type="button"
                        onClick={() => setOliverClassId(ocls.id)}
                        className={`relative flex flex-col gap-2 rounded-2xl border-2 p-4 text-left transition-all ${
                          oliverClassId === ocls.id
                            ? 'ring-2 ring-offset-2 ring-offset-background'
                            : 'border-border bg-background hover:border-border/60'
                        }`}
                        style={oliverClassId === ocls.id
                          ? { borderColor: ocls.color, background: `${ocls.color}12`, '--tw-ring-color': ocls.color }
                          : isPaired ? { borderColor: `${ocls.color}66`, background: `${ocls.color}06` }
                          : {}}
                      >
                        {isPaired && (
                          <span className="absolute right-2 top-2 rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                            style={{ background: `${ocls.color}33`, color: ocls.color }}>
                            ★ Recomendada
                          </span>
                        )}
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{ocls.icon}</span>
                          <div>
                            <p className="font-black text-text">{ocls.name}</p>
                            <p className="text-xs text-text-muted">{ocls.description}</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(3)}>← Atrás</Button>
                  <Button onClick={handleFinish} disabled={!oliverClassId || status === 'processing'}>
                    {status === 'processing' ? 'Guardando…' : oliverClassId ? '¡Comenzar! →' : 'Elige una clase'}
                  </Button>
                </div>
              </div>
            )}

            {/* ── Step 5: Listo ── */}
            {step === 5 && (
              <div className="flex flex-col items-center gap-5 py-6 text-center">
                <span className="text-7xl">🎉</span>
                <div>
                  <h2 className="text-2xl font-bold">¡Tu cuenta está lista!</h2>
                  <p className="mt-2 max-w-md text-text-muted">
                    {petName || mascot.name} ya te está esperando en el campus.
                    Tu clase y compañero han sido guardados.
                  </p>
                </div>
                {pClass && (
                  <div className="flex items-center gap-3 rounded-2xl border px-6 py-3"
                    style={{ borderColor: `${pClass.color}44`, background: `${pClass.color}10` }}>
                    <span className="text-4xl">{pClass.icon}</span>
                    <div className="text-left">
                      <p className="font-black text-text">{pClass.name}</p>
                      <p className="text-xs text-text-muted">{pClass.description}</p>
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button onClick={() => navigate('/vr')} className="mt-2">
                    🌍 Entrar al Campus VR →
                  </Button>
                  <Button variant="secondary" onClick={() => navigate('/dashboard')} className="mt-2">
                    🏠 Ir al Dashboard
                  </Button>
                </div>
                {presetCourseId && (
                  <Button variant="ghost" onClick={() => navigate(`/learn/${presetCourseId}`)}>
                    📚 Ir al curso seleccionado
                  </Button>
                )}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}
