import { useEffect, useRef, useState, Suspense } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import Button from '../shared/Button'
import Logo from '../shared/Logo'
import MascotMesh from '../mascot/MascotMesh'
import { getMascotById } from '../../data/mascotRegistry'
import { useAuthStore } from '../../stores/useAuthStore'
import { useGameStore } from '../../stores/useGameStore'
import { isSupabaseConfigured } from '../../services/supabase/client'
import { renderGoogleButton, isGoogleAuthConfigured } from '../../services/auth/googleAuth'

const FACEBOOK_ENABLED = import.meta.env.VITE_ENABLE_FACEBOOK_LOGIN === 'true'

// Welcome video embed URL — leave empty for the Oliver 3D placeholder
const WELCOME_VIDEO_URL = ''

const OLIVER = getMascotById(8)

// Esta página solo crea la CUENTA (nombre + correo + contraseña) y te manda
// directo al dashboard — puedes ver y tomar cursos así, sin más pasos. La
// mascota + clase de Oliver (mundo VR) son un paso aparte y opcional que se
// hace después, desde /vr-templo, para quien sí quiera esa parte.
export default function CreateAccountPage() {
  const navigate = useNavigate()

  const signUpWithEmail    = useAuthStore((s) => s.signUpWithEmail)
  const signInWithOAuth    = useAuthStore((s) => s.signInWithOAuth)
  const registerWithGoogle = useAuthStore((s) => s.registerWithGoogle)
  const session            = useAuthStore((s) => s.session)

  const setPlayerNickname  = useGameStore((s) => s.setPlayerNickname)

  const [step, setStep]     = useState(0) // 0 = bienvenida, 1 = cuenta
  const [status, setStatus] = useState('idle')
  const [error, setError]   = useState('')

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [isChildSignup, setIsChildSignup] = useState(false)

  const supabaseReady   = isSupabaseConfigured()
  const googleButtonRef = useRef(null)

  // Cuenta creada → directo a la plataforma. Crear mascota/clase de Oliver
  // (mundo VR) queda como paso opcional, disponible después desde el dashboard.
  const finishSignup = (name) => {
    setPlayerNickname((name || '').trim() || email.split('@')[0] || 'Aventurero')
    navigate('/dashboard')
  }

  useEffect(() => {
    if (supabaseReady || !googleButtonRef.current) return
    renderGoogleButton(
      googleButtonRef.current,
      (googleUser) => { registerWithGoogle(googleUser); finishSignup(googleUser?.name) },
      (err) => setError(err.message),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabaseReady, registerWithGoogle])

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError(''); setStatus('processing')
    try {
      const data = await signUpWithEmail(email, password, nickname || email.split('@')[0], { isChildSignup })
      // Supabase's default "Confirm email" returns no session until the link
      // is clicked. Without a session nothing can reach the cloud, so we stop
      // here and tell the user. Disable "Confirm email" in the Supabase
      // dashboard (Authentication > Providers > Email) to skip this.
      if (!data.session) {
        setError('Te enviamos un correo de confirmación. Ábrelo, confirma tu cuenta e inicia sesión para crear tu personaje — si no confirmas, tu progreso no se guardará en la nube.')
        return
      }
      finishSignup(nickname)
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

          {/* ═══════ STEP 0 — BIENVENIDA ═══════ */}
          {step === 0 && (
            <div className="flex flex-col items-center gap-8">
              <div className="text-center">
                <div className="mb-3 text-7xl">🌍</div>
                <h1 className="text-4xl font-black leading-tight md:text-5xl">
                  Bienvenido a{' '}
                  <span className="text-primary">Oliver Academy</span>
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
                    title="Bienvenida a Oliver Academy"
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
                  { icon: '🎓', title: 'Aprende', desc: 'Clases interactivas a tu propio ritmo' },
                  { icon: '⚔️', title: 'Personaje', desc: 'Elige tu clase y mascota en el mundo VR' },
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
            <div className="mx-auto max-w-md rounded-3xl border border-border bg-surface p-6 shadow-lg md:p-8">
              <h2 className="mb-1 text-2xl font-black">Crea tu cuenta</h2>
              <p className="mb-6 text-sm text-text-muted">
                Elige tu nombre y crea tu acceso — ya puedes ver y tomar tus cursos.
                Cuando quieras, desde el dashboard puedes crear tu mascota y entrar
                al mundo VR. Las APIs se configuran luego en Ajustes.
              </p>

              {supabaseReady ? (
                <>
                  <form onSubmit={handleSignUp} className="flex flex-col gap-4">
                    <label className="flex flex-col gap-1.5 text-sm font-semibold">
                      Nombre
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

                    <label className="flex items-start gap-2.5 rounded-xl border border-border bg-background px-4 py-3 text-sm text-text-muted">
                      <input
                        type="checkbox"
                        checked={isChildSignup}
                        onChange={(e) => setIsChildSignup(e.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                      />
                      <span>
                        Esta cuenta es para mi hijo/a <span className="text-text-muted/70">(la aprobará un administrador antes de poder usarse)</span>
                      </span>
                    </label>

                    {session ? (
                      <Button type="button" onClick={() => finishSignup(nickname)}>
                        Ya tienes sesión — continuar →
                      </Button>
                    ) : (
                      <Button type="submit" disabled={status === 'processing'} className="py-3 text-base">
                        {status === 'processing' ? 'Creando cuenta…' : 'Crear cuenta y continuar →'}
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
                  <Button onClick={() => finishSignup(nickname)} className="mt-1">Continuar sin cuenta →</Button>
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

        </div>
      </main>
    </div>
  )
}
