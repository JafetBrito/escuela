import { useEffect, useState } from 'react'
import AppTopBar from '../shared/AppTopBar'
import { useAuthStore } from '../../stores/useAuthStore'
import { useAdminUsersStore } from '../../stores/useAdminUsersStore'

const AGE_PROFILES = [
  { id: 'normal',  label: 'Normal',  icon: '🧑' },
  { id: 'kids',    label: 'Niños',   icon: '🧒' },
  { id: 'seniors', label: 'Abuelos', icon: '👴' },
]

// Perfil de edad por cuenta (profiles.age_profile) — controla, para cada
// alumno, cuánto del "mundo videojuego" (VR, mascota, misiones, combate,
// ajedrez multijugador, chat entre alumnos) ve, y le fuerza un tema visual
// acorde (ver ThemeController.jsx). Solo el admin lo puede cambiar, nunca el
// propio alumno — pensado incluso para cuentas de niños abiertas con el
// correo de un padre o tutor.
export default function AdminAgeProfilesPage() {
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const students = useAdminUsersStore((s) => s.students)
  const loading = useAdminUsersStore((s) => s.loading)
  const fetchStudents = useAdminUsersStore((s) => s.fetchStudents)
  const setAgeProfile = useAdminUsersStore((s) => s.setAgeProfile)
  const [savedId, setSavedId] = useState(null)

  useEffect(() => {
    if (!isAdmin?.()) return
    fetchStudents()
  }, [fetchStudents, isAdmin])

  if (!isAdmin?.()) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-text">
        <AppTopBar />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-text-muted">Acceso restringido a administradores.</p>
        </div>
      </div>
    )
  }

  const handleChange = async (studentId, ageProfile) => {
    const { error } = await setAgeProfile(studentId, ageProfile)
    if (!error) {
      setSavedId(studentId)
      setTimeout(() => setSavedId((id) => (id === studentId ? null : id)), 1500)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 shadow-lg">
            <h1 className="text-3xl font-extrabold text-white drop-shadow-sm">🧒 Perfiles de Edad</h1>
            <p className="mt-1 text-sm font-medium text-white/85">
              Elige el perfil de cada alumno — controla qué tanto del mundo VR/juegos/comunidad ve, y le
              cambia el tema visual. El alumno no puede cambiarlo por su cuenta.
            </p>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
            {loading && <p className="p-4 text-sm text-text-muted">Cargando alumnos…</p>}
            {!loading && students.length === 0 && (
              <p className="p-4 text-sm text-text-muted">No hay alumnos todavía.</p>
            )}
            {students.map((st) => (
              <div key={st.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4 last:border-b-0">
                <div className="min-w-0">
                  <p className="font-bold text-text">{st.display_name || st.email}</p>
                  <p className="text-xs text-text-muted">{st.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={st.age_profile ?? 'normal'}
                    onChange={(e) => handleChange(st.id, e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-text outline-none focus:border-primary"
                  >
                    {AGE_PROFILES.map((p) => (
                      <option key={p.id} value={p.id}>{p.icon} {p.label}</option>
                    ))}
                  </select>
                  {savedId === st.id && <span className="text-xs font-bold text-emerald-400">✓ Guardado</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
