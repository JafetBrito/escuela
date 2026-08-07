import { useEffect, useState } from 'react'
import AdminShell from './AdminShell'
import { useAuthStore } from '../../stores/useAuthStore'
import { supabase } from '../../services/supabase/client'

export default function AdminRecruitersPage() {
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const profile = useAuthStore((s) => s.profile)
  const [passes, setPasses] = useState([])
  const [label, setLabel] = useState('')
  const [busy, setBusy] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState('')

  const load = async () => {
    const { data } = await supabase
      .from('recruiter_passes')
      .select('*')
      .order('created_at', { ascending: false })
    setPasses(data ?? [])
  }

  useEffect(() => {
    if (isAdmin?.()) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!isAdmin?.()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-text-muted">
        Acceso restringido a administradores.
      </div>
    )
  }

  const generate = async () => {
    setBusy(true)
    setCopiedUrl('')
    try {
      // ponytail: borrado perezoso — cada vez que se genera uno nuevo, de
      // paso se limpian los ya vencidos, sin necesitar un cron aparte.
      await supabase.from('recruiter_passes').delete().lt('expires_at', new Date().toISOString())
      const { data, error } = await supabase
        .from('recruiter_passes')
        .insert({ label: label.trim() || null, created_by: profile?.id })
        .select()
        .single()
      if (error) throw error
      setLabel('')
      await load()
      const url = `${window.location.origin}/reclutador/${data.token}`
      navigator.clipboard?.writeText(url).catch(() => {})
      setCopiedUrl(url)
    } finally {
      setBusy(false)
    }
  }

  const revoke = async (token) => {
    await supabase.from('recruiter_passes').delete().eq('token', token)
    await load()
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-8 shadow-lg">
          <h1 className="text-2xl font-black text-white">🕵️ Reclutadores</h1>
          <p className="mt-1 text-sm font-medium text-white/80">
            Genera un enlace de acceso completo para mostrarle el proyecto a un reclutador — expira solo en 24 horas.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[200px] flex-1">
              <label className="text-xs font-semibold text-text-muted">Etiqueta (opcional)</label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="ej. Google, entrevista 12/08"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text"
              />
            </div>
            <button
              type="button"
              onClick={generate}
              disabled={busy}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background disabled:opacity-50"
            >
              {busy ? 'Generando…' : '🔗 Generar enlace (24h)'}
            </button>
          </div>
          {copiedUrl && (
            <p className="mt-2 text-xs text-primary">✅ Copiado al portapapeles: {copiedUrl}</p>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="font-bold text-text">Enlaces generados</h2>
          <div className="mt-3 space-y-2">
            {passes.length === 0 && <p className="text-sm text-text-muted">Ninguno todavía.</p>}
            {passes.map((p) => {
              const expired = new Date(p.expires_at).getTime() <= Date.now()
              return (
                <div
                  key={p.token}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
                >
                  <div className="text-sm">
                    <span className={expired ? 'text-text-muted line-through' : 'font-semibold text-text'}>
                      {p.label || '(sin etiqueta)'}
                    </span>
                    <span className="ml-2 text-xs text-text-muted">
                      {expired ? 'expirado' : `expira ${new Date(p.expires_at).toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/reclutador/${p.token}`)}
                      className="text-xs font-semibold text-primary"
                    >
                      Copiar enlace
                    </button>
                    <button type="button" onClick={() => revoke(p.token)} className="text-xs font-semibold text-red-400">
                      Revocar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
