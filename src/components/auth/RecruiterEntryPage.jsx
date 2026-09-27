import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Logo from '../shared/Logo'
import { supabase, isSupabaseConfigured } from '../../services/supabase/client'
import { useAuthStore } from '../../stores/useAuthStore'

// Puerta de entrada para /reclutador/:token — valida el token contra
// recruiter_passes (migration_033.sql; validación por RPC desde migration_078.sql) y, si sigue vivo, activa
// useAuthStore.enterRecruiterMode() y manda a /dashboard. Sin
// ProtectedRoute: quien visita este link todavía no tiene sesión.
export default function RecruiterEntryPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const enterRecruiterMode = useAuthStore((s) => s.enterRecruiterMode)
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!isSupabaseConfigured()) {
        if (!cancelled) setStatus('error')
        return
      }
      const { data: expiresAt } = await supabase.rpc('validate_recruiter_pass', { p_token: token })
      if (cancelled) return
      if (!expiresAt || new Date(expiresAt).getTime() <= Date.now()) {
        setStatus('expired')
        return
      }
      enterRecruiterMode(token, expiresAt)
      navigate('/dashboard', { replace: true })
    }
    run()
    return () => { cancelled = true }
  }, [token, enterRecruiterMode, navigate])

  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-text-muted">
        Verificando enlace…
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <Logo />
      <h1 className="text-xl font-bold text-text">Este enlace de reclutador ya no está disponible</h1>
      <p className="max-w-sm text-sm text-text-muted">
        Los enlaces duran 24 horas desde que se generan. Pide uno nuevo a quien te lo compartió.
      </p>
    </div>
  )
}
