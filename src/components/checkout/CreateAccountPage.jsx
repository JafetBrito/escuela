import { useEffect, useRef, useState, Suspense } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import Button from '../shared/Button'
import Logo from '../shared/Logo'
import MascotMesh from '../mascot/MascotMesh'
import { getMascotById } from '../../data/mascotRegistry'
import { useAuthStore } from '../../stores/useAuthStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { useGameStore, PLAYER_CLASSES, PLAYER_AVATARS } from '../../stores/useGameStore'
import { isSupabaseConfigured } from '../../services/supabase/client'
import { renderGoogleButton, isGoogleAuthConfigured } from '../../services/auth/googleAuth'

const FACEBOOK_ENABLED = import.meta.env.VITE_ENABLE_FACEBOOK_LOGIN === 'true'

// ── Replace with your YouTube embed URL, e.g. 'https://www.youtube.com/embed/YOUR_ID'
// Leave empty to show the animated placeholder instead.
const WELCOME_VIDEO_URL = ''

// Oliver (id 8) is used as the welcome mascot on the preview canvas
const OLIVER = getMascotById(8)

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

  const setPlayerAvatar    = useGameStore((s) => s.setPlayerAvatar)
  const selectPlayerClass  = useGameStore((s) => s.selectPlayerClass)
  const forceSyncToCloud   = useGameStore((s) => s.forceSyncToCloud)

  const [step, setStep]     = useState(0)
  const [status, setStatus] = useState('idle')
  const [error, setError]   = useState('')

  // Step 1 – account
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [displayName, setDisplayName] = useState('')

  // Step 2 – avatar
  const [avatarId, setAvatarId] = useState(PLAYER_AVATARS[0].id)

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

  // ── handlers ──────────────────────────────────────────────────────────────

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError(''); setStatus('processing')
    try {
      await signUpWithEmail(email, password, displayName)
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
    if (playerClassId) selectPlayerClass(playerClassId)
    try { await forceSyncToCloud() } catch { /* best effort */ }
    setStatus('idle')
    navigate('/vr')
  }

  // ── step helpers ──────────────────────────────────────────────────────────

  const selectedAvatar = PLAYER_AVATARS.find((a) => a.id === avatarId) || PLAYER_AVATARS[0]
  const selectedClass  = playerClassId ? PLAYER_CLASSES[playerClassId] : null

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-text">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(152,202,63,0.14),transparent_60%)]" />

      <header className="flex items-center justify-between px-6 py-4 md:px-10">
        <Link to="/"><Logo /></Link>
        <Link to="/login" className="text-sm text-text-muted transition-colors hover:text-text">
          ¿Ya tienes cuenta? →
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-16 pt-4">
        <div className="w-full max-w-2xl">

          {/* ── Step indicator (hidden on step 0) ── */}
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

          {/* ═══════════════════════════════════════════════════════════════
              STEP 0 — BIENVENIDA
          ═══════════════════════════════════════════════════════════════ */}
          {step === 0 && (
            <div className="flex flex-col items-center gap-8">

              {/* Hero */}
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

              {/* Video */}
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
                  // Animated placeholder — replace WELCOME_VIDEO_URL with a real URL
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
                    <p className="text-sm font-semibold text-text-muted">
                      🎬 Video de bienvenida próximamente
                    </p>
                  </div>
                )}
              </div>

              {/* Three pillars */}
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
                <Link to="/login" className="font-bold text-primary hover:underline">
                  Inicia sesión
                </Link>
              </p>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 1 — CUENTA
          ═══════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-lg md:p-8">
              <h2 className="mb-1 text-2xl font-black">Crea tu cuenta</h2>
              <p className="mb-6 text-sm text-text-muted">
                Solo necesitas nombre, correo y contraseña. Las APIs y ajustes avanzados se configuran después.
              </p>

              {supabaseReady ? (
                <>
                  <form onSubmit={handleSignUp} className="flex flex-col gap-4">
                    <label className="flex flex-col gap-1.5 text-sm font-semibold">
                      Nombre
                      <input type="text" required value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Tu nombre en el campus"
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

                    {/* API info note */}
                    <div className="rounded-xl border border-border/60 bg-background/50 px-4 py-3 text-xs text-text-muted">
                      💡 Las configuraciones de DeepSeek, Notion y otras APIs las puedes agregar después en <strong>Ajustes</strong>.
                    </div>

                    {session ? (
                      <Button type="button" onClick={() => setStep(2)}>
                        Ya tienes sesión — continuar →
                      </Button>
                    ) : (
                      <Button type="submit" disabled={status === 'processing'} className="py-3 text-base">
                        {status === 'processing' ? 'Creando cuenta…' : 'Crear mi cuenta →'}
                      </Button>
                    )}
                  </form>

                  <div className="my-5 flex items-center gap-3">
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
                <div className="flex flex-col items-center gap-4 text-center">
                  <p className="text-sm text-text-muted">
                    Las cuentas en la nube no están configuradas. Puedes registrarte con Google para el modo local.
                  </p>
                  <div ref={googleButtonRef} />
                  {!isGoogleAuthConfigured() && (
                    <p className="text-xs text-text-muted">Google Auth tampoco está configurado aún.</p>
                  )}
                  <Button onClick={() => setStep(2)} className="mt-1">
                    Continuar sin cuenta →
                  </Button>
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

          {/* ═══════════════════════════════════════════════════════════════
              STEP 2 — AVATAR
          ═══════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-lg md:p-8">
              <h2 className="mb-1 text-2xl font-black">Elige tu avatar</h2>
              <p className="mb-5 text-sm text-text-muted">
                Así te verán otros jugadores en el campus virtual 3D.
              </p>

              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                {PLAYER_AVATARS.map((av) => {
                  const active = av.id === avatarId
                  return (
                    <button key={av.id} type="button" onClick={() => setAvatarId(av.id)}
                      className="flex flex-col items-center gap-2 rounded-2xl border-2 p-3 transition-all hover:scale-105"
                      style={{
                        borderColor: active ? av.color : 'var(--color-border)',
                        background:  active ? `${av.color}20` : 'var(--color-background)',
                        boxShadow:   active ? `0 0 16px ${av.color}44` : 'none',
                      }}>
                      <div className="flex h-14 w-14 items-center justify-center rounded-full text-3xl"
                        style={{ background: `${av.color}22`, border: `2px solid ${av.color}55` }}>
                        {av.icon}
                      </div>
                      <span className="text-xs font-bold" style={{ color: active ? av.color : 'var(--color-text-muted)' }}>
                        {av.label}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Preview */}
              <div className="mt-5 flex items-center gap-4 rounded-2xl border px-5 py-3"
                style={{ borderColor: `${selectedAvatar.color}44`, background: `${selectedAvatar.color}0c` }}>
                <span className="text-4xl">{selectedAvatar.icon}</span>
                <div>
                  <p className="font-black text-text">{selectedAvatar.label}</p>
                  <p className="text-xs text-text-muted">Tu identidad en el campus virtual</p>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>← Atrás</Button>
                <Button onClick={() => setStep(3)}>Continuar →</Button>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              STEP 3 — CLASE
          ═══════════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-lg md:p-8">
              <h2 className="mb-1 text-2xl font-black">Elige tu clase</h2>
              <p className="mb-5 text-sm text-text-muted">
                Define tu estilo en el campus. Desbloquea habilidades únicas conforme subes de nivel.
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {Object.values(PLAYER_CLASSES).map((cls) => {
                  const active = playerClassId === cls.id
                  return (
                    <button key={cls.id} type="button" onClick={() => setPlayerClassId(cls.id)}
                      className="flex flex-col gap-3 rounded-2xl border-2 p-4 text-left transition-all hover:scale-[1.02]"
                      style={{
                        borderColor: active ? cls.color : 'var(--color-border)',
                        background:  active ? `${cls.color}14` : 'var(--color-background)',
                        boxShadow:   active ? `0 0 20px ${cls.color}33` : 'none',
                      }}>
                      <div className="flex items-center gap-3">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-3xl"
                          style={{ background: `${cls.color}22` }}>
                          {cls.icon}
                        </span>
                        <div className="min-w-0">
                          <p className="font-black text-text">{cls.name}</p>
                          <p className="text-xs text-text-muted">{cls.description}</p>
                        </div>
                      </div>
                      {/* Mini stat bars */}
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(cls.stats).map(([stat, val]) => (
                          <div key={stat} className="flex flex-col items-center gap-0.5">
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-1.5 w-2 rounded-sm"
                                  style={{ background: i < val ? cls.color : 'rgba(128,128,128,0.2)' }} />
                              ))}
                            </div>
                            <span className="text-[8px] uppercase text-text-muted">{stat.slice(0, 3)}</span>
                          </div>
                        ))}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Selected class note */}
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
                    : playerClassId ? '¡Ir al Campus VR! 🌍'
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
