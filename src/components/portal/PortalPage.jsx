import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Card from '../shared/Card'
import Logo from '../shared/Logo'
import Dropzone from './Dropzone'
import { useAuthStore } from '../../stores/useAuthStore'
import { isSupabaseConfigured } from '../../services/supabase/client'

export default function PortalPage() {
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const redeemLicense = useAuthStore((s) => s.redeemLicense)
  const license = useAuthStore((s) => s.license)
  const session = useAuthStore((s) => s.session)
  const isUnlocked = useAuthStore((s) => s.isUnlocked)
  const authReady = useAuthStore((s) => s.authReady)
  const navigate = useNavigate()

  const loggedIn = isSupabaseConfigured() ? Boolean(session) : isUnlocked

  if (authReady && !loggedIn) {
    return <Navigate to="/login" replace />
  }

  const handleFile = async (file) => {
    setError('')
    try {
      const text = await file.text()
      const parsedLicense = JSON.parse(text)
      await redeemLicense(parsedLicense)
      setDone(true)
      setTimeout(() => navigate('/dashboard'), 800)
    } catch (err) {
      setError(err.message || 'No pudimos leer el archivo. ¿Es un .key/.json válido?')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <header className="flex items-center justify-between px-6 py-5 md:px-12">
        <Link to="/">
          <Logo />
        </Link>
        <Link to="/crear-cuenta" className="text-sm text-text-muted hover:text-text">
          Obtener una llave →
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md">
          <h1 className="mb-1 text-2xl font-bold">Canjea tu llave</h1>
          <p className="mb-6 text-sm text-text-muted">
            Sube tu archivo de llave (<code className="text-text">.key</code> o{' '}
            <code className="text-text">.json</code>) para desbloquear el resto de las clases
            de tus cursos. Tu llave queda guardada en tu cuenta.
          </p>

          {license && (
            <div className="mb-4 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-primary">
              ✅ Ya tienes una llave activa
              {license.type === 'full'
                ? ' (acceso completo a todos los cursos).'
                : ` (curso: ${license.courseId}).`}
              {' '}Puedes subir otra para reemplazarla.
            </div>
          )}

          <Dropzone onFile={handleFile} />

          {done && (
            <div className="mt-4 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-primary">
              ✅ Llave activada. Llevándote al Dashboard…
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
              {error}
            </div>
          )}

          <p className="mt-4 text-center text-xs text-text-muted">
            ¿No tienes una llave?{' '}
            <Link to="/crear-cuenta" className="text-primary underline">
              Consíguela aquí
            </Link>
          </p>
        </Card>
      </main>
    </div>
  )
}
