import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'

// Notas "por qué existe esto", no "cómo se usa" — solo se ven en la cuenta
// de reclutador (useAuthStore.enterRecruiterMode). Se elige por el prefijo
// de ruta más largo que matchea; `default` cubre cualquier página sin
// entrada propia, así siempre hay algo que mostrar en cada parte del sitio.
const WHY_NOTES = {
  default:
    'Plataforma educativa completa construida en solitario: cursos, mundo 3D multijugador, gamificación estilo RPG, un asistente de IA con memoria propia y panel admin — todo en React + Supabase.',
  '/dashboard':
    'El dashboard unifica tareas, proyectos, exámenes y misiones en un solo feed accionable — antes cada sistema vivía en su propia página y el alumno tenía que ir a revisarlas una por una.',
  '/vr':
    'El campus 3D (Three.js) no es solo estética: mueve la interacción social y las misiones fuera del navegador plano, con voz en vivo, NPCs con IA y minijuegos — la apuesta es que dar clase se sienta menos como un LMS y más como un mundo compartido.',
  '/mundo':
    'Versión 2D (Phaser) del mismo mundo, para quien no tenga hardware para 3D — sincronizada con el campus VR vía Supabase Realtime.',
  '/mis-clases':
    'Las clases en vivo tienen chat efímero, cola de texto-a-voz y un resumen en PDF generado al cerrar la sesión, para que quede algo tangible sin depender de una grabación.',
  '/curso':
    'El contenido de cada curso vive en Supabase, no hardcodeado en el bundle — un profesor puede editar una clase sin tocar código ni volver a desplegar el sitio.',
  '/admin':
    'Panel admin propio: aprobación de cuentas, calificación de tareas, generación de exámenes, control del mundo VR en vivo — hecho a medida en vez de un CMS genérico.',
  '/logros':
    'Sistema de logros con XP/niveles al estilo RPG: la idea es que terminar un curso se sienta como progreso de personaje, no una casilla marcada.',
}

function matchNote(pathname) {
  const hit = Object.keys(WHY_NOTES)
    .filter((k) => k !== 'default' && pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0]
  return WHY_NOTES[hit] ?? WHY_NOTES.default
}

function formatRemaining(expiresAt) {
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms <= 0) return 'expirado'
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  return `${h}h ${m}m`
}

// Se monta en AppTopBar.jsx, que ya renderiza en casi cualquier página
// logueada — eso solo, sin tocar cada página una por una, ya cumple con
// "una nota en cada parte del sitio".
export default function RecruiterMode() {
  const profile = useAuthStore((s) => s.profile)
  const lock = useAuthStore((s) => s.lock)
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [, forceTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  if (!profile?.recruiter_view) return null

  return (
    <>
      <div className="flex items-center justify-between gap-3 bg-primary/10 px-4 py-1.5 text-xs text-primary">
        <span>
          🕵️ Modo Reclutador — vista de demostración, acceso expira en {formatRemaining(profile.recruiter_expires_at)}
        </span>
        <button type="button" onClick={lock} className="font-semibold underline">
          Salir
        </button>
      </div>
      <div className="fixed bottom-4 right-4 z-40">
        {open && (
          <div className="mb-2 w-72 rounded-xl border border-primary/40 bg-surface p-3 text-xs shadow-xl">
            <p className="font-semibold text-primary">💡 Por qué existe esto</p>
            <p className="mt-1 text-text-muted">{matchNote(location.pathname)}</p>
          </div>
        )}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg shadow-lg"
          title="Por qué existe esta parte del proyecto"
        >
          💡
        </button>
      </div>
    </>
  )
}
