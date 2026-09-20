import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../../services/supabase/client'

// /u/:slug — perfil de progreso compartido por un alumno (ver ShareProfileCard).
// Pública: no requiere cuenta. Termina con una invitación a registrarse.
function Stat({ value, label }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3 text-center">
      <p className="text-2xl font-black text-text">{value}</p>
      <p className="text-[11px] font-semibold text-text-muted">{label}</p>
    </div>
  )
}

export default function PublicProfilePage() {
  const { slug } = useParams()
  const [profile, setProfile] = useState(undefined) // undefined = cargando, null = no existe

  useEffect(() => {
    if (!supabase) return
    supabase.from('public_profiles').select('*').eq('slug', slug).eq('is_public', true).maybeSingle()
      .then(({ data }) => setProfile(data ?? null))
  }, [slug])

  const CTA = (
    <Link to="/login" className="inline-block rounded-xl bg-primary px-6 py-3 text-sm font-black text-background shadow-lg hover:opacity-90">
      Regístrate en Oliver Academy
    </Link>
  )

  return (
    <div className="min-h-screen bg-background text-text">
      <header className="border-b border-border bg-surface px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link to="/" className="text-lg font-black">OLIVER <span className="text-primary">ACADEMY</span></Link>
          <Link to="/login" className="text-sm font-bold text-primary hover:underline">Entrar</Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-5 px-4 py-8">
        {profile === undefined ? (
          <p className="py-16 text-center text-sm text-text-muted">Cargando…</p>
        ) : profile === null ? (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <p className="text-4xl">🔎</p>
            <p className="mt-2 font-bold">Este perfil no existe o ya no se comparte.</p>
            <div className="mt-5">{CTA}</div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 shadow-lg">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" referrerPolicy="no-referrer" className="h-20 w-20 rounded-full border-4 border-white/30 object-cover" />
              ) : (
                <span className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/30 bg-white/15 text-3xl font-black text-white">
                  {profile.display_name[0]?.toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <h1 className="truncate text-3xl font-black text-white">{profile.display_name}</h1>
                <p className="text-sm font-semibold text-white/85">Nivel {profile.level} · {profile.xp.toLocaleString()} XP</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat value={profile.level} label="Nivel" />
              <Stat value={profile.courses_completed} label="Cursos completados" />
              <Stat value={profile.courses_in_progress} label="Cursos en curso" />
              <Stat value={`🔥 ${profile.streak}`} label="Racha de días" />
            </div>

            {profile.top_areas?.length > 0 && (
              <div className="rounded-2xl border border-border bg-surface p-5">
                <h2 className="mb-3 text-sm font-extrabold">Sus áreas fuertes</h2>
                <div className="space-y-2.5">
                  {profile.top_areas.map((a) => (
                    <div key={a.name}>
                      <div className="mb-1 flex justify-between text-xs font-semibold text-text-muted"><span>{a.name}</span><span>{a.pct}%</span></div>
                      <div className="h-2 rounded-full bg-surface-hover"><div className="h-2 rounded-full bg-primary" style={{ width: `${a.pct}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-primary/30 bg-primary/10 p-6 text-center">
              <p className="text-lg font-black">¿Quieres subir de nivel como {profile.display_name}?</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-text-muted">
                Oliver Academy tiene cursos, clases en vivo, un campus en realidad virtual y una comunidad para aprender de todo, todos los días.
              </p>
              <div className="mt-4">{CTA}</div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
