import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../../services/supabase/client'
import { useAuthStore } from '../../stores/useAuthStore'

// Compartir el perfil de progreso con alguien SIN cuenta: publica un resumen
// (nivel, XP, cursos, racha… nada privado) en public_profiles (migration_073)
// y da un enlace /u/<slug>. Mientras esté compartido, el resumen se refresca
// solo cada vez que se abre Progreso. `summary` lo arma ProgressPage.
const slugify = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'alumno'

export default function ShareProfileCard({ summary }) {
  const userId = useAuthStore((s) => s.session?.user?.id)
  const profile = useAuthStore((s) => s.profile)
  const googlePicture = useAuthStore((s) => s.googleUser?.picture)
  const [row, setRow] = useState(null) // fila propia, o null si nunca compartió
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const refreshedRef = useRef(false)

  const slug = `${slugify(summary.displayName)}-${profile?.tag ?? userId?.slice(0, 4) ?? '0000'}`
  const url = `${window.location.origin}/u/${slug}`

  const payload = useCallback((isPublic) => ({
    user_id: userId,
    slug,
    display_name: summary.displayName,
    avatar_url: profile?.avatar_url || googlePicture || null,
    level: summary.level,
    xp: summary.xp,
    courses_completed: summary.completed,
    courses_in_progress: summary.inProgress,
    streak: summary.streak,
    avg_grade: summary.avgGrade,
    top_areas: summary.topAreas,
    is_public: isPublic,
    updated_at: new Date().toISOString(),
  }), [userId, slug, summary, profile?.avatar_url, googlePicture])

  useEffect(() => {
    if (!supabase || !userId) return
    supabase.from('public_profiles').select('*').eq('user_id', userId).maybeSingle().then(({ data }) => setRow(data ?? null))
  }, [userId])

  // Si ya está compartido, mantiene el resumen al día (una vez por visita).
  useEffect(() => {
    if (!row?.is_public || refreshedRef.current) return
    refreshedRef.current = true
    supabase.from('public_profiles').upsert(payload(true), { onConflict: 'user_id' })
  }, [row, payload])

  const setShared = async (isPublic) => {
    setBusy(true)
    setMsg('')
    const { data, error } = await supabase.from('public_profiles').upsert(payload(isPublic), { onConflict: 'user_id' }).select().single()
    setBusy(false)
    if (error) { setMsg('❌ No se pudo actualizar. ¿Ya corriste migration_073.sql?'); return }
    setRow(data)
    if (isPublic) copy()
  }

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setMsg('✅ Enlace copiado') } catch { setMsg(url) }
  }

  const shared = row?.is_public

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-sm font-bold text-text">🔗 Presume tu nivel</p>
      <p className="mt-1 text-xs text-text-muted">
        Comparte un enlace con tu nivel, XP, cursos y racha. Cualquiera puede verlo, aunque no tenga cuenta. No incluye tus datos privados.
      </p>
      {shared ? (
        <>
          <div className="mt-3 flex items-center gap-2">
            <input readOnly value={url} onFocus={(e) => e.target.select()} className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs text-text" />
            <button type="button" onClick={copy} className="shrink-0 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-background">Copiar</button>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-primary hover:underline">Ver mi perfil público →</a>
            <button type="button" disabled={busy} onClick={() => setShared(false)} className="text-xs text-text-muted hover:text-danger">Dejar de compartir</button>
          </div>
        </>
      ) : (
        <button type="button" disabled={busy} onClick={() => setShared(true)} className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background hover:opacity-90 disabled:opacity-50">
          {busy ? 'Publicando…' : 'Compartir mi perfil'}
        </button>
      )}
      {msg && <p className="mt-2 text-xs text-text-muted">{msg}</p>}
    </div>
  )
}
