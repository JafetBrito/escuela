import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import VideoPlayer from '../video/VideoPlayer'
import HubContent from './HubContent'
import { useLiveClassStore, classShortCode } from '../../stores/useLiveClassStore'

// Clases "de práctica": no se programan, no tienen horario ni ventana de
// espera — siempre están ahí. El video vive en ESTA página (computadora).
// Al elegir una, primero se pregunta cómo quiere trabajar el alumno:
//  - "phone"     → el Hub (agenda/recursos/preguntas) se ve en el segundo
//                  dispositivo, en /mis-clases — igual que una clase real
//                  con Jitsi, solo que aquí el "en vivo" es un video grabado.
//  - "sideBySide"→ el Hub se ve aquí mismo, junto al video, en un solo
//                  dispositivo (reutiliza el mismo HubContent que /mis-clases).
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

// ── Popup: cómo quieres sincronizar tu experiencia ──────────────────────────
function SyncModal({ cls, onChoose, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <span className="text-3xl">🔗</span>
        <h2 className="mt-2 text-lg font-extrabold text-text">Sincroniza tu experiencia</h2>
        <p className="mt-1 text-sm text-text-muted">
          "{cls.title}" tiene un Hub con agenda, recursos y misiones. ¿Cómo quieres verlo?
        </p>

        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={() => onChoose('phone')}
            className="flex w-full items-start gap-3 rounded-xl border border-primary/40 bg-primary/5 p-3 text-left transition hover:bg-primary/10"
          >
            <span className="text-xl">📱</span>
            <div>
              <p className="text-sm font-bold text-text">En mi teléfono</p>
              <p className="text-xs text-text-muted">El video se queda aquí en la computadora — abre <b>Mis Clases</b> en tu teléfono para el Hub.</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onChoose('sideBySide')}
            className="flex w-full items-start gap-3 rounded-xl border border-border bg-background/40 p-3 text-left transition hover:border-primary/40"
          >
            <span className="text-xl">💻</span>
            <div>
              <p className="text-sm font-bold text-text">Aquí mismo, lado a lado</p>
              <p className="text-xs text-text-muted">Video y Hub juntos en esta pantalla — útil si solo tienes un dispositivo.</p>
            </div>
          </button>
        </div>

        <button type="button" onClick={onClose} className="mt-4 w-full text-center text-xs text-text-muted hover:text-text">
          Cancelar
        </button>
      </div>
    </div>
  )
}

function ClassPlayer({ cls, mode, onBack }) {
  const activeClass  = useLiveClassStore((s) => s.activeClass)
  const openClass    = useLiveClassStore((s) => s.openClass)
  const closeClass   = useLiveClassStore((s) => s.closeClass)

  useEffect(() => {
    if (mode === 'sideBySide') openClass(cls.id)
    return () => closeClass()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cls.id, mode])

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-text-muted hover:text-primary">← Todas las clases disponibles</button>

      <div>
        <h1 className="text-xl font-extrabold text-text">{cls.title}</h1>
        {cls.description && <p className="mt-1 text-sm text-text-muted">{cls.description}</p>}
      </div>

      {mode === 'phone' ? (
        <>
          <VideoPlayer videoId={cls.demo_video_id} />
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-primary/70">📱 En tu teléfono</p>
            <p className="mt-1 text-sm text-text-muted">Abre Mis Clases → "Sincronizar con código" y escribe:</p>
            <p className="mt-3 font-mono text-4xl font-black tracking-[0.2em] text-primary">{classShortCode(cls.id)}</p>
            <p className="mt-3 text-xs text-text-muted">Ahí verás la agenda, los recursos y podrás hacer preguntas en tiempo real mientras ves el video aquí.</p>
            <Link to="/mis-clases" className="mt-4 inline-block rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10">
              ¿Ya estás ahí? Abrir Mis Clases →
            </Link>
          </div>
        </>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
          <div className="min-w-0">
            <VideoPlayer videoId={cls.demo_video_id} />
          </div>
          {/* Antes tenía max-h-[75vh] + overflow-y-auto propio — un scroll
              anidado dentro del scroll de la página se ve mal y descuadra la
              columna en pantallas grandes ("no se ve bien en computadora").
              Ahora crece con su contenido y usa el scroll normal de la
              página; sticky sigue funcionando mientras quepa en el viewport. */}
          <div className="min-w-0 space-y-4 lg:sticky lg:top-6">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <p className="text-sm font-extrabold text-text">Hub de la clase</p>
              <span className="ml-auto flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Sincronizado
              </span>
            </div>
            {activeClass ? <HubContent activeClass={activeClass} /> : <p className="text-sm text-text-muted">Cargando Hub…</p>}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AvailableClassesPage() {
  const classes = useLiveClassStore((s) => s.classes)
  const loading = useLiveClassStore((s) => s.loading)
  const fetchClasses = useLiveClassStore((s) => s.fetchClasses)
  const [syncingClass, setSyncingClass] = useState(null) // clase esperando elección del modal
  const [openClassEntry, setOpenClassEntry] = useState(null) // { cls, mode }

  useEffect(() => { fetchClasses() }, [fetchClasses])

  const availableClasses = classes.filter((c) => c.demo_video_id)

  const handleChooseMode = (mode) => {
    setOpenClassEntry({ cls: syncingClass, mode })
    setSyncingClass(null)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className={`mx-auto ${openClassEntry?.mode === 'sideBySide' ? 'max-w-7xl' : 'max-w-3xl'}`}>
          {!openClassEntry && (
            <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-8 shadow-lg">
              <h1 className="text-3xl font-extrabold text-white">🎬 Clases Disponibles</h1>
              <p className="mt-1 text-sm font-medium text-white/85">Clases de práctica siempre abiertas — sin horario, sin espera. Entra cuando quieras.</p>
            </div>
          )}

          <div className="mt-6">
            {openClassEntry ? (
              <ClassPlayer cls={openClassEntry.cls} mode={openClassEntry.mode} onBack={() => setOpenClassEntry(null)} />
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
                  <ClassCard key={c.id} cls={c} onOpen={setSyncingClass} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {syncingClass && <SyncModal cls={syncingClass} onChoose={handleChooseMode} onClose={() => setSyncingClass(null)} />}

      <MascotCompanion />
    </div>
  )
}
