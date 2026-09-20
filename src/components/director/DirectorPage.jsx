import { useCallback, useEffect, useState } from 'react'
import AppTopBar from '../shared/AppTopBar'
import { supabase } from '../../services/supabase/client'
import { useAuthStore } from '../../stores/useAuthStore'
import { getAcademy } from '../../data/academies'
import { tr } from '../../i18n'

// Panel del director (/director): su academia, sus profesores y sumar más por
// correo (RPC assign_teacher_to_academy, migration_068).
// ponytail: solo profesores; alumnos por academia cuando exista cómo se inscriben.
export default function DirectorPage() {
  const profile = useAuthStore((s) => s.profile)
  const academy = getAcademy(profile?.academy_id)
  const [teachers, setTeachers] = useState([])
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')

  const load = useCallback(async () => {
    if (!supabase || !profile?.academy_id) return
    const { data } = await supabase.from('profiles').select('id, email, display_name')
      .eq('academy_id', profile.academy_id).eq('role', 'teacher')
    setTeachers(data ?? [])
  }, [profile?.academy_id])

  useEffect(() => { load() }, [load])

  const add = async (e) => {
    e.preventDefault()
    const { data, error } = await supabase.rpc('assign_teacher_to_academy', { p_email: email })
    if (error) setMsg(`❌ ${error.message}`)
    else if (!data) setMsg(tr('No hay ningún profesor con ese correo (un admin debe promoverlo primero).', 'There is no teacher with that email (an admin has to promote them first).'))
    else { setMsg(tr('✅ Profesor agregado a tu academia.', '✅ Teacher added to your academy.')); setEmail(''); load() }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-8">
        {profile?.role !== 'director' || !academy ? (
          <p className="text-sm text-text-muted">{tr('Esta página es solo para directores de academia.', 'This page is only for academy directors.')}</p>
        ) : (
          <>
            <div className="rounded-2xl px-6 py-8 shadow-lg" style={{ background: academy.accent }}>
              <p className="text-4xl">{academy.emoji}</p>
              <h1 className="mt-2 text-3xl font-extrabold text-black/80">{academy.name}</h1>
              <p className="text-sm font-medium text-black/70">{tr('Panel del director', 'Director panel')}</p>
              <a href={`/vr/academia/${academy.id}`} className="mt-4 inline-block rounded-full bg-background px-5 py-2 text-sm font-black text-text">{tr('🕶️ Ir al mapa de la academia', '🕶️ Go to the academy map')}</a>
            </div>
            <form onSubmit={add} className="space-y-2 rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-text-muted">{tr('Sumar un profesor', 'Add a teacher')}</p>
              <div className="flex gap-2">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com"
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
                <button type="submit" disabled={!email.trim()} className="rounded-lg bg-primary/20 px-3 py-2 text-xs font-bold text-primary disabled:opacity-40">{tr('Agregar', 'Add')}</button>
              </div>
              {msg && <p className="text-sm">{msg}</p>}
            </form>
            <div className="rounded-2xl border border-border bg-surface p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">{tr('Profesores', 'Teachers')} ({teachers.length})</p>
              {teachers.length === 0 && <p className="text-sm text-text-muted">{tr('Aún no hay profesores en tu academia.', 'There are no teachers in your academy yet.')}</p>}
              {teachers.map((t) => <p key={t.id} className="text-sm">{t.display_name || t.email}</p>)}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
