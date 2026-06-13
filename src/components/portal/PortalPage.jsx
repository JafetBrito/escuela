import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../shared/Card'
import Logo from '../shared/Logo'
import Dropzone from './Dropzone'
import { useAuthStore } from '../../stores/useAuthStore'
import { validateLicense } from '../../services/crypto/keyCrypto'

export default function PortalPage() {
  const [error, setError] = useState('')
  const unlock = useAuthStore((s) => s.unlock)
  const navigate = useNavigate()

  const handleFile = async (file) => {
    setError('')
    try {
      const text = await file.text()
      const license = JSON.parse(text)

      if (!validateLicense(license)) {
        setError('Esta llave no es válida o está dañada.')
        return
      }

      unlock(license)
      navigate('/dashboard')
    } catch {
      setError('No pudimos leer el archivo. ¿Es un .key/.json válido?')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <header className="flex items-center justify-between px-6 py-5 md:px-12">
        <Link to="/">
          <Logo />
        </Link>
        <Link to="/crear-cuenta" className="text-sm text-text-muted hover:text-text">
          Comprar acceso →
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md">
          <h1 className="mb-1 text-2xl font-bold">Desbloquear curso</h1>
          <p className="mb-6 text-sm text-text-muted">
            Sube tu archivo de licencia para acceder a tu curso y a tu
            mascota 3D.
          </p>

          <Dropzone onFile={handleFile} />

          {error && (
            <div className="mt-4 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
              {error}
            </div>
          )}

          <p className="mt-4 text-center text-xs text-text-muted">
            ¿No tienes una llave?{' '}
            <Link to="/crear-cuenta" className="text-primary underline">
              Cómprala aquí
            </Link>
          </p>
        </Card>
      </main>
    </div>
  )
}
