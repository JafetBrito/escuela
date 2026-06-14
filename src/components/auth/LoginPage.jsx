import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../shared/Button'
import Card from '../shared/Card'
import Logo from '../shared/Logo'
import { useAuthStore } from '../../stores/useAuthStore'
import { isSupabaseConfigured } from '../../services/supabase/client'
import { renderGoogleButton, isGoogleAuthConfigured } from '../../services/auth/googleAuth'

const FACEBOOK_ENABLED = import.meta.env.VITE_ENABLE_FACEBOOK_LOGIN === 'true'

export default function LoginPage() {
  const navigate = useNavigate()
  const signInWithEmail = useAuthStore((s) => s.signInWithEmail)
  const signInWithOAuth = useAuthStore((s) => s.signInWithOAuth)
  const registerWithGoogle = useAuthStore((s) => s.registerWithGoogle)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('idle')
  const googleButtonRef = useRef(null)

  const supabaseReady = isSupabaseConfigured()

  // Local-mode fallback: lets people sign in with Google without Supabase.
  useEffect(() => {
    if (supabaseReady || !googleButtonRef.current) return
    renderGoogleButton(
      googleButtonRef.current,
      (googleUser) => {
        registerWithGoogle(googleUser)
        navigate('/dashboard')
      },
      (err) => setError(err.message),
    )
  }, [supabaseReady, registerWithGoogle, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setStatus('processing')
    try {
      await signInWithEmail(email, password)
      navigate('/dashboard')
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

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <header className="flex items-center justify-between px-6 py-5 md:px-12">
        <Link to="/">
          <Logo />
        </Link>
        <Link to="/crear-cuenta" className="text-sm text-text-muted hover:text-text">
          Crear cuenta →
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md">
          <h1 className="mb-1 text-2xl font-bold">Inicia sesión</h1>
          <p className="mb-6 text-sm text-text-muted">
            Accede a tu cuenta de oliver.escuela: tu mascota, tu progreso, tus chats y tu llave
            te están esperando.
          </p>

          {supabaseReady ? (
            <>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-lg border border-border bg-background px-4 py-2.5 text-text outline-none focus:border-primary"
                  />
                </label>
                <Button type="submit" disabled={status === 'processing'} className="mt-1">
                  {status === 'processing' ? 'Entrando…' : 'Iniciar sesión'}
                </Button>
              </form>

              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs uppercase tracking-wide text-text-muted">o continúa con</span>
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
            <div className="flex flex-col items-center gap-3">
              <p className="text-center text-sm text-text-muted">
                Las cuentas en la nube aún no están configuradas en este sitio. Puedes entrar
                con Google para probar el modo local.
              </p>
              <div ref={googleButtonRef} />
              {!isGoogleAuthConfigured() && (
                <p className="text-center text-xs text-text-muted">
                  El registro con Google tampoco está configurado todavía.
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
              {error}
            </div>
          )}

          <p className="mt-4 text-center text-xs text-text-muted">
            ¿No tienes cuenta?{' '}
            <Link to="/crear-cuenta" className="text-primary underline">
              Crea una gratis
            </Link>
          </p>
          <p className="mt-1 text-center text-xs text-text-muted">
            ¿Ya tienes una llave?{' '}
            <Link to="/unlock" className="text-primary underline">
              Canjéala aquí
            </Link>
          </p>
        </Card>
      </main>
    </div>
  )
}
