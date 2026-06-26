import { useEffect, useRef, useState, Suspense } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import Button from '../shared/Button'
import Logo from '../shared/Logo'
import MascotMesh from '../mascot/MascotMesh'
import { getMascotById } from '../../data/mascotRegistry'
import { useAuthStore } from '../../stores/useAuthStore'
import { useGameStore, PLAYER_CLASSES, PLAYER_AVATARS } from '../../stores/useGameStore'
import { isSupabaseConfigured } from '../../services/supabase/client'
import { renderGoogleButton, isGoogleAuthConfigured } from '../../services/auth/googleAuth'

const FACEBOOK_ENABLED = import.meta.env.VITE_ENABLE_FACEBOOK_LOGIN === 'true'

// Welcome video embed URL — leave empty for the Oliver 3D placeholder
const WELCOME_VIDEO_URL = ''

const OLIVER = getMascotById(8)

// Rich class detail shown during registration — presentation only, not in the store
const CLASS_DETAIL = {
  programmer: {
    lore: 'Maestro del código y la lógica computacional. Velocidad de pensamiento superior y precisión milimétrica en cada solución. Cuando el tiempo apremia, el Programador ejecuta mientras otros aún leen el enunciado.',
    specialty: 'Velocidad y precisión',
    topStats: ['speed', 'intellect'],
  },
  cyber_strategist: {
    lore: 'Táctico nato de las redes digitales. Analiza amenazas, construye defensas y maneja el flujo de información con maestría. Donde otros ven caos, el Ciber-Estratega ve patrones y oportunidades.',
    specialty: 'Control táctico',
    topStats: ['intellect', 'creativity'],
  },
  ai_engineer: {
    lore: 'Arquitecto de sistemas que aprenden solos. Convierte datos en predicciones, automatiza lo imposible y anticipa resultados con modelos de alta precisión. El futuro del aprendizaje está en sus manos.',
    specialty: 'Predicción y automatización',
    topStats: ['intellect', 'wisdom'],
  },
  designer: {
    lore: 'Creador de experiencias que trascienden lo visual. Fusiona arte con funcionalidad para generar soluciones que las personas entienden antes de leerlas. La creatividad no es adorno — es su arma principal.',
    specialty: 'Arte y funcionalidad',
    topStats: ['creativity', 'intellect'],
  },
  philosopher: {
    lore: 'Pensador crítico que cuestiona todo. La sabiduría y la ética son sus herramientas para desmontar argumentos falsos y construir verdades sólidas. En un mundo de ruido, el Filósofo encuentra la señal.',
    specialty: 'Sabiduría y ética',
    topStats: ['wisdom', 'intellect'],
  },
}

const STAT_LABEL = { power: 'Poder', speed: 'Velocidad', intellect: 'Intelecto', creativity: 'Creatividad', wisdom: 'Sabiduría' }

const STEPS = [
  { label: 'Bienvenida', icon: '🌟' },
  { label: 'Cuenta',     icon: '👤' },
  { label: 'Avatar',     icon: '🎭' },
  { label: 'Clase',      icon: '⚔️' },
]

export default function CreateAccountPage() {
  const navigate = useNavigate()

  const signUpWithEmail    = useAuthStore((s) => s.signUpWithEmail)
  const signInWithOAuth    = useAuthStore((s) => s.signInWithOAuth)
  const registerWithGoogle = useAuthStore((s) => s.registerWithGoogle)
  const session            = useAuthStore((s) => s.session)

  const setPlayerAvatar     = useGameStore((s) => s.setPlayerAvatar)
  const setPlayerNickname   = useGameStore((s) => s.setPlayerNickname)
  const selectPlayerClass   = useGameStore((s) => s.selectPlayerClass)
  const forceSyncToCloud    = useGameStore((s) => s.forceSyncToCloud)

  const [step, setStep]     = useState(0)
  const [status, setStatus] = useState('idle')
  const [error, setError]   = useState('')

  // Step 1 – account
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')

  // Step 2 – avatar (hombre/mujer, see PLAYER_AVATARS)
  const [avatarId, setAvatarId] = useState(PLAYER_AVATARS[0]?.id ?? 'hombre')

  // Step 3 – player class
  const [playerClassId, setPlayerClassId] = useState(null)

  const supabaseReady   = isSupabaseConfigured()
  const googleButtonRef = useRef(null)

  useEffect(() => {
    if (supabaseReady || !googleButtonRef.current) return
    renderGoogleButton(
      googleButtonRef.current,
      (googleUser) => { registerWithGoogle(googleUser); setStep(2) },
      (err) => setError(err.message),
    )
  }, [supabaseReady, registerWithGoogle])

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError(''); setStatus('processing')
    try {
      const data = await signUpWithEmail(email, password, nickname || email.split('@')[0])
      // ponytail: Supabase's default "Confirm email" setting returns no
      // session until the link is clicked — without this check the wizard
      // silently continues with user=null and nothing ever reaches the
      // cloud (forceSyncToCloud no-ops). Disable "Confirm email" in the
      // Supabase dashboard (Authentication > Providers > Email) to skip
      // this step entirely.
      if (!data.session) {
        setError('Te enviamos un correo de confirmación. Ábrelo y confirma tu cuenta, luego inicia sesión para continuar — si no confirmas, tu progreso no se guardará en la nube.')
        return
      }
      setStep(2)
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
    setPlayerAvatar(avatarId)
    setPlayerNickname(nickname.trim() || email.split('@')[0])
    if (playerClassId) selectPlayerClass(playerClassId)
    try { await forceSyncToCloud() } catch { /* best effort */ }
    setStatus('idle')
    navigate('/vr-templo')   // ← goes to tutorial world, NOT campus
  }

  const selectedAvatar = PLAYER_AVATARS.find((a) => a.id === avatarId) ?? PLAYER_AVATARS[0]
  const selectedClass  = playerClassId ? PLAYER_CLASSES[playerClassId] : null

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-text">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(152,202,63,0.14),transparent_60%)]" />

      <header className="flex items-center justify-between px-6 py-4 md:px-10">
        <Link to="/"><Logo /></Link>
        <Link to="/login" className="text-sm text-text-muted transition-colors hover:text-text">
          ¿Ya tienes cuenta? →
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-16 pt-4">
        <div className="w-full max-w-2xl">

          {/* ── Step indicator ── */}
          {step > 0 && (
            <div className="mb-6 flex items-center justify-center gap-1 overflow-x-auto pb-1">
              {STEPS.map((s, i) => (
                <div key={s.label} className="flex items-center gap-1">
                  <div className="flex flex-col items-center gap-0.5">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${
                      i < step  ? 'border-primary bg-primary text-background'
                      : i === step ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-text-muted'
                    }`}>
                      {i < step ? '✓' : s.icon}
                    </div>
                    <span className={`hidden text-[9px] font-semibold sm:block ${i === step ? 'text-primary' : 'text-text-muted'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`mb-3 h-0.5 w-6 md:w-10 ${i < step ? 'bg-primary' : 'bg-border'}`} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ═══════ STEP 0 — BIENVENIDA ═══════ */}
          {step === 0 && (
            <div className="flex flex-col items-center gap-8">
              <div className="text-center">
                <div className="mb-3 text-7xl">🌍</div>
                <h1 className="text-4xl font-black leading-tight md:text-5xl">
                  Bienvenido a{' '}
                  <span className="text-primary">Oliver School</span>
                </h1>
                <p className="mt-3 max-w-md text-base text-text-muted">
                  El campus virtual donde aprendes, exploras y creces junto a tu compañero mágico.
                </p>
              </div>

              <div className="w-full overflow-hidden rounded-3xl border border-border bg-surface shadow-lg">
                {WELCOME_VIDEO_URL ? (
                  <iframe
                    src={WELCOME_VIDEO_URL}
                    className="aspect-video w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Bienvenida a Oliver School"
                  />
                ) : (
                  <div className="relative flex aspect-video w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-surface to-background">
                    <div className="absolute inset-0 opacity-5"
                      style={{ backgroundImage: 'radial-gradient(circle, #98ca3f 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                    <div className="relative h-32 w-32">
                      <Canvas camera={{ position: [0, 0, 3.5], fov: 45 }}>
                        <ambientLight intensity={0.7} />
                        <directionalLight position={[3, 4, 3]} intensity={1.3} />
                        <Suspense fallback={null}>
                          <MascotMesh mascot={OLIVER} />
                        </Suspense>
                      </Canvas>
                    </div>
                    <p className="text-sm font-semibold text-text-muted">🎬 Video de bienvenida próximamente</p>
                  </div>
                )}
              </div>

              <div className="grid w-full grid-cols-3 gap-3">
                {[
                  { icon: '🎓', title: 'Aprende', desc: 'Clases interactivas con tu propio ritmo' },
                  { icon: '⚔️', title: 'Combate', desc: 'Sistema RPG con habilidades y clases' },
                  { icon: '🌍', title: 'Explora', desc: 'Campus virtual 3D con otros jugadores' },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface/60 p-4 text-center">
                    <span className="text-3xl">{icon}</span>
                    <p className="text-sm font-black text-text">{title}</p>
                    <p className="text-[11px] text-text-muted">{desc}</p>
                  </div>
                ))}
              </div>

              <Button className="w-full max-w-xs py-4 text-base" onClick={() => setStep(1)}>
                ¡Crear mi cuenta! 🚀
              </Button>

              <p className="text-xs text-text-muted">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/login" className="font-bold text-primary hover:underline">Inicia sesión</Link>
              </p>
            </div>
          )}

          {/* ═══════ STEP 1 — CUENTA ═══════ */}
          {step === 1 && (
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-lg md:p-8">
              <h2 className="mb-1 text-2xl font-black">Crea tu cuenta</h2>
              <p className="mb-6 text-sm text-text-muted">
                Elige un nickname único y crea tu acceso. Las APIs se configuran después.
              </p>

              {supabaseReady ? (
                <>
                  <form onSubmit={handleSignUp} className="flex flex-col gap-4">
                    <label className="flex flex-col gap-1.5 text-sm font-semibold">
                      Nickname
                      <input type="text" required value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="¿Cómo te llamarán en el campus?"
                        maxLength={24}
                        className="rounded-xl border border-border bg-background px-4 py-3 text-text outline-none transition focus:border-primary" />
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm font-semibold">
                      Correo electrónico
                      <input type="email" required value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@correo.com"
                        className="rounded-xl border border-border bg-background px-4 py-3 text-text outline-none transition focus:border-primary" />
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm font-semibold">
                      Contraseña
                      <input type="password" required minLength={6} value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="rounded-xl border border-border bg-background px-4 py-3 text-text outline-none transition focus:border-primary" />
                    </label>

                    <div className="rounded-xl border border-border/60 bg-background/50 px-4 py-3 text-xs text-text-muted">
                      💡 Las APIs (DeepSeek, Notion, etc.) se configuran después en <strong>Ajustes</strong>.
                    </div>

                    {session ? (
                      <Button type="button" onClick={() => setStep(2)}>
                        Ya tienes sesión — continuar →
                      </Button>
                    ) : (
                      <Button type="submit" disabled={status === 'processing'} className="py-3 text-base">
                        {status === 'processing' ? 'Creando cuenta…' : 'Continuar →'}
                      </Button>
                    )}
                  </form>

                  <div className="my-5 flex items-center gap-3">
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
                <div className="flex flex-col items-center gap-4 text-center">
                  <p className="text-sm text-text-muted">
                    Las cuentas en la nube no están configuradas. Puedes continuar con Google para el modo local.
                  </p>
                  <div ref={googleButtonRef} />
                  {!isGoogleAuthConfigured() && (
                    <p className="text-xs text-text-muted">Google Auth tampoco está configurado aún.</p>
                  )}
                  <Button onClick={() => setStep(2)} className="mt-1">Continuar sin cuenta →</Button>
                </div>
              )}

              {error && (
                <div className="mt-4 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
                  {error}
                </div>
              )}

              <div className="mt-4 flex justify-start">
                <Button variant="ghost" onClick={() => setStep(0)}>← Atrás</Button>
              </div>
            </div>
          )}

          {/* ═══════ STEP 2 — AVATAR 3D ═══════ */}
          {step === 2 && (
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-lg md:p-8">
              <h2 className="mb-1 text-2xl font-black">Elige tu avatar</h2>
              <p className="mb-5 text-sm text-text-muted">
                ¿Hombre o mujer? Este modelo 3D te representará en el campus virtual. Puedes cambiarlo después en Apariencia. Pronto agregaremos más opciones.
              </p>

              {/* 3D preview */}
              <div className="mb-5 overflow-hidden rounded-2xl border"
                style={{ borderColor: `${selectedAvatar.color}44`, background: `${selectedAvatar.color}0a` }}>
                <div className="h-44 w-full">
                  <Canvas camera={{ position: [0, 0, 3.5], fov: 45 }}>
                    <ambientLight intensity={0.7} />
                    <directionalLight position={[3, 4, 3]} intensity={1.3} />
                    <Suspense fallback={null}>
                      <MascotMesh mascot={selectedAvatar} />
                    </Suspense>
                  </Canvas>
                </div>
                <div className="flex items-center gap-3 border-t border-border px-4 py-2.5">
                  <span className="text-2xl">{selectedAvatar.icon || '✨'}</span>
                  <p className="font-black text-text">{selectedAvatar.label}</p>
                </div>
              </div>

              {/* Model grid */}
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                {PLAYER_AVATARS.map((m) => {
                  const active = m.id === avatarId
                  return (
                    <button key={m.id} type="button" onClick={() => setAvatarId(m.id)}
                      className="flex flex-col items-center gap-2 rounded-2xl border-2 p-3 transition-all hover:scale-105"
                      style={{
                        borderColor: active ? m.color : 'var(--color-border)',
                        background:  active ? `${m.color}20` : 'var(--color-background)',
                        boxShadow:   active ? `0 0 16px ${m.color}44` : 'none',
                      }}>
                      <div className="flex h-14 w-14 items-center justify-center rounded-full text-3xl"
                        style={{ background: `${m.color}22`, border: `2px solid ${m.color}55` }}>
                        {m.icon || '✨'}
                      </div>
                      <span className="text-xs font-bold leading-tight text-center"
                        style={{ color: active ? m.color : 'var(--color-text-muted)' }}>
                        {m.label}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="mt-6 flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>← Atrás</Button>
                <Button onClick={() => setStep(3)}>Continuar →</Button>
              </div>
            </div>
          )}

          {/* ═══════ STEP 3 — CLASE ═══════ */}
          {step === 3 && (
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-lg md:p-8">
              <h2 className="mb-1 text-2xl font-black">Elige tu clase</h2>
              <p className="mb-5 text-sm text-text-muted">
                Tu clase define tu camino en Oliver School. Cada una tiene habilidades únicas,
                stats propios y un compañero mágico especializado.
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Object.values(PLAYER_CLASSES).map((cls) => {
                  const active  = playerClassId === cls.id
                  const detail  = CLASS_DETAIL[cls.id]
                  const topS    = detail?.topStats ?? []
                  return (
                    <button key={cls.id} type="button" onClick={() => setPlayerClassId(cls.id)}
                      className="flex flex-col gap-3 rounded-2xl border-2 p-4 text-left transition-all hover:scale-[1.01]"
                      style={{
                        borderColor: active ? cls.color : 'var(--color-border)',
                        background:  active ? `${cls.color}12` : 'var(--color-background)',
                        boxShadow:   active ? `0 0 24px ${cls.color}33` : 'none',
                      }}>

                      {/* Header row */}
                      <div className="flex items-center gap-3">
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl"
                          style={{ background: `${cls.color}22`, border: `2px solid ${cls.color}44` }}>
                          {cls.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-black text-text text-base">{cls.name}</p>
                            {detail && (
                              <span className="rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wide"
                                style={{ background: `${cls.color}22`, color: cls.color }}>
                                {detail.specialty}
                              </span>
                            )}
                            {active && (
                              <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-green-400">
                                ✓ Seleccionada
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-text-muted mt-0.5 line-clamp-2">
                            {detail?.lore ?? cls.description}
                          </p>
                        </div>
                      </div>

                      {/* Stat bars */}
                      <div className="grid grid-cols-5 gap-1.5">
                        {Object.entries(cls.stats).map(([stat, val]) => {
                          const isTop = topS.includes(stat)
                          return (
                            <div key={stat} className="flex flex-col items-center gap-1">
                              <div className="flex flex-col gap-0.5 w-full">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <div key={i} className="h-1.5 w-full rounded-sm transition-all"
                                    style={{
                                      background: i < val
                                        ? (isTop ? cls.color : `${cls.color}88`)
                                        : 'rgba(128,128,128,0.18)',
                                      boxShadow:  i < val && isTop ? `0 0 4px ${cls.color}88` : 'none',
                                    }} />
                                ))}
                              </div>
                              <span className="text-[8px] font-bold uppercase tracking-wide"
                                style={{ color: isTop ? cls.color : 'var(--color-text-muted)' }}>
                                {(STAT_LABEL[stat] ?? stat).slice(0, 3)}
                              </span>
                            </div>
                          )
                        })}
                      </div>

                      {/* Starting skills + passive */}
                      <div className="flex flex-wrap items-center gap-1.5 border-t border-border/50 pt-2.5">
                        <span className="text-[9px] uppercase tracking-wide text-text-muted">Inicio:</span>
                        {cls.startSkills?.map((sk) => (
                          <span key={sk} className="rounded-lg border px-1.5 py-0.5 text-[10px] font-bold"
                            style={{ borderColor: `${cls.color}44`, color: cls.color }}>
                            {sk.replace(/_/g, ' ')}
                          </span>
                        ))}
                        {cls.passiveAura && (
                          <span className="ml-auto rounded-lg bg-white/5 px-1.5 py-0.5 text-[9px] text-text-muted">
                            ✦ {cls.passiveAura.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              {selectedClass && (
                <div className="mt-4 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm"
                  style={{ borderColor: `${selectedClass.color}44`, background: `${selectedClass.color}0c` }}>
                  <span className="text-2xl">{selectedClass.icon}</span>
                  <div>
                    <p className="font-bold text-text">{selectedClass.name} seleccionada</p>
                    <p className="text-xs text-text-muted">
                      Habilidades iniciales: {selectedClass.startSkills?.join(', ')}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <Button variant="ghost" onClick={() => setStep(2)}>← Atrás</Button>
                <Button
                  onClick={handleFinish}
                  disabled={!playerClassId || status === 'processing'}
                  className="py-3 text-base"
                  style={selectedClass ? {
                    background: `linear-gradient(135deg, ${selectedClass.color}, ${selectedClass.color}cc)`,
                  } : {}}>
                  {status === 'processing' ? 'Guardando…'
                    : playerClassId ? '¡Ir al Árbol VR! 🌳'
                    : 'Elige una clase primero'}
                </Button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
