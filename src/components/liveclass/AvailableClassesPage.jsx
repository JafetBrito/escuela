import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import VideoPlayer from '../video/VideoPlayer'
import { useLiveClassStore } from '../../stores/useLiveClassStore'

// Clases "de práctica": no se programan, no tienen horario ni ventana de
// espera — siempre están ahí. El video vive en ESTA página (computadora);
// el Hub (agenda, recursos, preguntas) se ve por separado en /mis-clases
// desde el segundo dispositivo (típicamente el teléfono), igual que en una
// clase real con Jitsi — solo que aquí el "video en vivo" es uno ya grabado.
function ClassCard({ cls, onOpen }) {
  return (
    <button
      onClick={() => onOpen(cls)}
      className="flex w-full items-start gap-3 rounded-2xl border border-border bg-surface p-4 text-left transition-colors hover:border-primary/50"
    >
      <span className="text-2xl">🎬</span>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-text">{cls.title}</p>
        {cls.description && <p className="mt-0.5 text-sm text-text-muted">{cls.description}</p>}
      </div>
      <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
        Disponible
      </span>
    </button>
  )
}

function ClassPlayer({ cls, onBack }) {
  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-text-muted hover:text-primary">← Todas las clases disponibles</button>

      <div>
        <h1 className="text-xl font-extrabold text-text">{cls.title}</h1>
        {cls.description && <p className="mt-1 text-sm text-text-muted">{cls.description}</p>}
      </div>

      <VideoPlayer videoId={cls.demo_video_id} />

      <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
        <span className="text-2xl">📱</span>
        <div>
          <p className="text-sm font-bold text-text">En tu teléfono, entra a Mis Clases</p>
          <p className="text-xs text-text-muted">Ahí verás la agenda, los recursos y podrás hacer preguntas en tiempo real mientras ves el video aquí.</p>
        </div>
        <Link to="/mis-clases" className="ml-auto shrink-0 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-background transition hover:opacity-90">
          Abrir Mis Clases →
        </Link>
      </div>
    </div>
  )
}

export default function AvailableClassesPage() {
  const classes = useLiveClassStore((s) => s.classes)
  const loading = useLiveClassStore((s) => s.loading)
  const fetchClasses = useLiveClassStore((s) => s.fetchClasses)
  const [openClass, setOpenClass] = useState(null)

  useEffect(() => { fetchClasses() }, [fetchClasses])

  const availableClasses = classes.filter((c) => c.demo_video_id)

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-3xl">
          {!openClass && (
            <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-8 shadow-lg">
              <h1 className="text-3xl font-extrabold text-white">🎬 Clases Disponibles</h1>
              <p className="mt-1 text-sm font-medium text-white/85">Clases de práctica siempre abiertas — sin horario, sin espera. Entra cuando quieras.</p>
            </div>
          )}

          <div className="mt-6">
            {openClass ? (
              <ClassPlayer cls={openClass} onBack={() => setOpenClass(null)} />
            ) : loading ? (
              <p className="py-12 text-center text-sm text-text-muted">Cargando…</p>
            ) : availableClasses.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface py-16 text-center">
                <span className="text-4xl">🎬</span>
                <p className="font-bold text-text">Sin clases disponibles todavía</p>
                <p className="text-sm text-text-muted">Cuando el profesor publique una clase de práctica, aparecerá aquí.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableClasses.map((c) => (
                  <ClassCard key={c.id} cls={c} onOpen={setOpenClass} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <MascotCompanion />
    </div>
  )
}
