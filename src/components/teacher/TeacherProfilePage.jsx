import { useState } from 'react'
import { useAuthStore } from '../../stores/useAuthStore'
import { useTeacherStore } from '../../stores/useTeacherStore'
import TeacherShell from './TeacherShell'

export default function TeacherProfilePage() {
  const session = useAuthStore((s) => s.session)
  const profile = useAuthStore((s) => s.profile)
  const isTeacher = useAuthStore((s) => s.isTeacher)
  const refreshProfile = useAuthStore((s) => s.refreshProfile)
  const updateMyProfile = useTeacherStore((s) => s.updateMyProfile)

  // Inicializado directo desde `profile` (sin efecto) — ProtectedRoute.jsx
  // no deja montar ninguna ruta protegida hasta que authReady es true, y
  // useAuthStore._applySession ya carga el profile ANTES de poner authReady
  // en true, así que profile siempre existe para cuando este componente
  // monta por primera vez.
  const [form, setForm] = useState(() => ({
    display_name: profile?.display_name ?? '',
    avatar_url: profile?.avatar_url ?? '',
    teacher_bio: profile?.teacher_bio ?? '',
  }))
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  if (!isTeacher?.()) {
    return <TeacherShell />
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    const { error } = await updateMyProfile(session.user.id, {
      display_name: form.display_name.trim() || null,
      avatar_url: form.avatar_url.trim() || null,
      teacher_bio: form.teacher_bio.trim() || null,
    })
    setBusy(false)
    if (error) {
      setMsg(`❌ ${error.message}`)
    } else {
      setMsg('✅ Perfil guardado.')
      await refreshProfile()
    }
  }

  return (
    <TeacherShell>
      <div className="max-w-lg space-y-4">
        <h1 className="text-xl font-black text-text">🧑‍🏫 Mi Perfil de Profesor</h1>
        <p className="text-sm text-text-muted">
          Esto es lo que ven tus alumnos en la página pública de tus cursos.
        </p>

        <form onSubmit={handleSave} className="space-y-3 rounded-2xl border border-border bg-surface p-4">
          <div>
            <label className="text-[10px] font-bold uppercase text-text-muted">Nombre público</label>
            <input
              value={form.display_name}
              onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
              className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-text-muted">Foto de perfil (URL)</label>
            <input
              value={form.avatar_url}
              onChange={(e) => setForm((f) => ({ ...f, avatar_url: e.target.value }))}
              className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
              placeholder="https://…"
            />
            {form.avatar_url && (
              <img src={form.avatar_url} alt="" className="mt-2 h-16 w-16 rounded-full object-cover" />
            )}
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-text-muted">Bio pública</label>
            <textarea
              rows={4}
              value={form.teacher_bio}
              onChange={(e) => setForm((f) => ({ ...f, teacher_bio: e.target.value }))}
              className="mt-0.5 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
              placeholder="Cuéntales a tus alumnos quién eres…"
            />
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button type="submit" disabled={busy} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background disabled:opacity-50">
              {busy ? 'Guardando…' : '💾 Guardar'}
            </button>
            {msg && <p className="text-xs text-text-muted">{msg}</p>}
          </div>
        </form>
      </div>
    </TeacherShell>
  )
}
