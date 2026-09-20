import { useState } from 'react'
import { useAuthStore } from '../../stores/useAuthStore'
import { getAcademy } from '../../data/academies'

// Inscribirse (o salirse) de una academia: guarda profiles.academy_id. Con eso
// los profesores de esa academia te ven en su lista de alumnos y te pueden
// asignar tareas. Se muestra en la portada de cada academia.
export default function AcademyEnrollButton({ academyId }) {
  const academyIdMine = useAuthStore((s) => s.profile?.academy_id)
  const role = useAuthStore((s) => s.profile?.role)
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (role !== 'student') return null
  const enrolled = academyIdMine === academyId
  const other = academyIdMine && !enrolled ? getAcademy(academyIdMine) : null

  const toggle = async () => {
    if (other && !window.confirm(`Ya estás inscrito en ${other.name}. ¿Cambiarte a esta academia?`)) return
    setBusy(true)
    setError('')
    try { await updateProfile({ academy_id: enrolled ? null : academyId }) } catch { setError('No se pudo guardar.') }
    setBusy(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className={`mt-3 inline-block rounded-full px-5 py-2 text-sm font-black shadow transition hover:scale-105 disabled:opacity-60 ${enrolled ? 'bg-emerald-500 text-white' : 'bg-white/20 text-white ring-1 ring-white/50'}`}
      >
        {enrolled ? '✅ Inscrito · salirme' : '🎓 Inscribirme en esta academia'}
      </button>
      {error && <p className="mt-1 text-xs text-white/90">{error}</p>}
    </>
  )
}
