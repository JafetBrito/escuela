import { useEffect, useState } from 'react'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import { Link } from 'react-router-dom'
import { useLiveClassStore, canJoinClass } from '../../stores/useLiveClassStore'
import { useAuthStore } from '../../stores/useAuthStore'

const STATUS_META = {
  programada: { label: 'Programada', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  en_vivo:    { label: '🔴 En vivo', cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
  finalizada: { label: 'Finalizada', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
}

function useCountdown(target) {
  const [text, setText] = useState('')
  useEffect(() => {
    if (!target) return
    const tick = () => {
      const diff = new Date(target) - new Date()
      if (diff <= 0) { setText('¡Es hora!'); return }
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const d = Math.floor(h / 24)
      setText(d > 0 ? `en ${d}d ${h % 24}h` : h > 0 ? `en ${h}h ${m}m` : `en ${m}m`)
    }
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [target])
  return text
}

// ── Lista de clases ─────────────────────────────────────────────────────────
function ClassList({ classes, onOpen }) {
  if (classes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-surface py-16 text-center">
        <span className="text-4xl">📅</span>
        <p className="font-bold text-text">Aún no hay clases programadas</p>
        <p className="text-sm text-text-muted">Cuando se programe una clase en vivo, aparecerá aquí.</p>
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {classes.map((c) => (
        <ClassCard key={c.id} cls={c} onOpen={onOpen} />
      ))}
    </div>
  )
}

function ClassCard({ cls, onOpen }) {
  const meta = STATUS_META[cls.status] ?? STATUS_META.programada
  const countdown = useCountdown(cls.status === 'programada' ? cls.scheduled_at : null)
  return (
    <button
      onClick={() => onOpen(cls.id)}
      className={`flex w-full items-center gap-3 rounded-2xl border bg-surface p-4 text-left transition-colors hover:border-primary/50 ${cls.status === 'en_vivo' ? 'border-red-500/40' : 'border-border'}`}
    >
      <span className="text-2xl">🎓</span>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-text">{cls.title}</p>
        <p className="text-xs text-text-muted">
          {new Date(cls.scheduled_at).toLocaleString('es-MX', { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          {countdown && ` · ${countdown}`}
        </p>
      </div>
      <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${meta.cls}`}>{meta.label}</span>
    </button>
  )
}

// ── Hub de una clase abierta ────────────────────────────────────────────────
function ClassHub({ onBack }) {
  const activeClass = useLiveClassStore((s) => s.activeClass)
  const questions   = useLiveClassStore((s) => s.questions)
  const askQuestion = useLiveClassStore((s) => s.askQuestion)
  const session     = useAuthStore((s) => s.session)
  const [draft, setDraft] = useState('')
  const countdown = useCountdown(activeClass?.status === 'programada' ? activeClass?.scheduled_at : null)

  if (!activeClass) return null
  const meta = STATUS_META[activeClass.status] ?? STATUS_META.programada

  const handleAsk = async (e) => {
    e.preventDefault()
    if (!draft.trim()) return
    await askQuestion(activeClass.id, session?.user?.id, draft)
    setDraft('')
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-text-muted hover:text-primary">← Todas mis clases</button>

      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-6 shadow-lg">
        <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${meta.cls}`}>{meta.label}</span>
        <h1 className="mt-2 text-2xl font-extrabold text-white">{activeClass.title}</h1>
        {activeClass.description && <p className="mt-1 text-sm text-white/85">{activeClass.description}</p>}
        {countdown && <p className="mt-1 text-sm text-white/70">Empieza {countdown}</p>}

        {activeClass.demo_video_id ? (
          <Link to="/clases-disponibles" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/25">
            🎬 El video se ve en la computadora — abrir Clases Disponibles →
          </Link>
        ) : canJoinClass(activeClass) ? (
          <a
            href={activeClass.meet_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-indigo-700 transition hover:opacity-90"
          >
            🎥 Unirse a la videollamada (Jitsi)
          </a>
        ) : (
          <p className="mt-4 text-sm text-white/70">🔒 El enlace se desbloquea 15 minutos antes de la clase.</p>
        )}
      </div>

      {/* Tema actual */}
      {activeClass.current_topic && (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">📍 En este momento</p>
          <p className="mt-0.5 text-lg font-bold text-text">{activeClass.current_topic}</p>
        </div>
      )}

      {/* Agenda */}
      {activeClass.agenda?.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">Agenda</p>
          <ul className="space-y-1.5">
            {activeClass.agenda.map((item, i) => (
              <li key={i} className={`flex items-center gap-2 text-sm ${item.label === activeClass.current_topic ? 'font-bold text-primary' : 'text-text-muted'}`}>
                <span>{item.label === activeClass.current_topic ? '▶️' : '▫️'}</span> {item.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recursos */}
      {activeClass.resources?.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">Recursos</p>
          <div className="space-y-1.5">
            {activeClass.resources.map((r, i) => (
              <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="block text-sm text-primary hover:underline">
                {r.type === 'pdf' ? '📄' : '🔗'} {r.label}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Misiones */}
      {activeClass.missions?.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">🎯 Misiones de la clase</p>
          <div className="space-y-2">
            {activeClass.missions.map((m, i) => (
              <div key={i} className="rounded-xl bg-surface-hover px-3 py-2">
                <p className="text-sm font-semibold text-text">{m.title}</p>
                {m.description && <p className="mt-0.5 text-xs text-text-muted">{m.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preguntas */}
      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-muted">Preguntas</p>
        <div className="space-y-2">
          {questions.length === 0 && <p className="text-sm text-text-muted">Aún no has hecho preguntas en esta clase.</p>}
          {questions.map((q) => (
            <div key={q.id} className="rounded-xl bg-surface-hover px-3 py-2">
              <p className="text-sm text-text">❓ {q.question}</p>
              {q.answered && <p className="mt-1 text-sm text-emerald-400">💬 {q.answer}</p>}
              {!q.answered && <p className="mt-1 text-xs text-text-muted">Esperando respuesta…</p>}
            </div>
          ))}
        </div>
        <form onSubmit={handleAsk} className="mt-3 flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Escribe tu duda…"
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
          />
          <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background hover:opacity-90">Enviar</button>
        </form>
      </div>
    </div>
  )
}

export default function MyClassesPage() {
  const classes      = useLiveClassStore((s) => s.classes)
  const fetchClasses = useLiveClassStore((s) => s.fetchClasses)
  const openClass    = useLiveClassStore((s) => s.openClass)
  const closeClass   = useLiveClassStore((s) => s.closeClass)
  const activeClass  = useLiveClassStore((s) => s.activeClass)

  useEffect(() => {
    fetchClasses()
    return () => closeClass()
  }, [fetchClasses, closeClass])

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <main className="flex-1 px-4 py-6 md:px-8">
        <div className="mx-auto max-w-2xl">
          {!activeClass && (
            <>
              <h1 className="mb-1 text-2xl font-black text-text">🎓 Mis Clases</h1>
              <p className="mb-6 text-sm text-text-muted">Tus clases en vivo con Jafet — la videollamada es en Jitsi Meet, aquí ves la agenda, los recursos y puedes preguntar.</p>
              <ClassList classes={classes} onOpen={openClass} />
            </>
          )}
          {activeClass && <ClassHub onBack={closeClass} />}
        </div>
      </main>
      <MascotCompanion />
    </div>
  )
}
