import { useState } from 'react'
import { useAuthStore } from '../../stores/useAuthStore'
import { getAcademy } from '../../data/academies'
import { tr } from '../../i18n'

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
    if (other && !window.confirm(tr(tr(`Ya estás inscrito en ${other.name}. ¿Cambiarte a esta academia?`, `You are already enrolled in ${other.name}. Switch to this academy?`), `You are already enrolled in ${other.name}. Switch to this academy?`))) return
    setBusy(true)
    setError('')
    try { await updateProfile({ academy_id: enrolled ? null : academyId }) } catch { setError(tr('No se pudo guardar.', 'Could not save.')) }
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
        {enrolled ? tr('✅ Inscrito · salirme', '✅ Enrolled · leave') : tr('🎓 Inscribirme en esta academia', '🎓 Enroll in this academy')}
      </button>
      {error && <p className="mt-1 text-xs text-white/90">{error}</p>}
    </>
  )
}
