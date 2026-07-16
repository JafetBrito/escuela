import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLiveClassStore, canJoinClass } from '../../stores/useLiveClassStore'

// Calendario semanal de clases en vivo — usado en /horario (página propia) y
// como pestaña dentro de /mis-tareas, para no duplicar esta vista en dos
// lugares.
const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function startOfWeek(d) {
  const date = new Date(d)
  const day = (date.getDay() + 6) % 7 // lunes = 0
  date.setDate(date.getDate() - day)
  date.setHours(0, 0, 0, 0)
  return date
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

const CLASS_STATUS_META = {
  programada: { label: 'Programada', icon: '🕓', dot: 'bg-amber-400', pill: 'bg-amber-500/15 text-amber-400' },
  en_vivo:    { label: 'En vivo',    icon: '🔴', dot: 'bg-red-400',   pill: 'bg-red-500/15 text-red-400' },
  finalizada: { label: 'Finalizada', icon: '✅', dot: 'bg-emerald-400', pill: 'bg-emerald-500/15 text-emerald-400' },
}

const MONTH_NAMES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

function formatWeekRange(start) {
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const sameMonth = start.getMonth() === end.getMonth()
  const startLabel = `${start.getDate()}${sameMonth ? '' : ` ${MONTH_NAMES[start.getMonth()]}`}`
  const endLabel = `${end.getDate()} ${MONTH_NAMES[end.getMonth()]}`
  return `${startLabel} – ${endLabel}`
}

function ClassChip({ cls, onOpen }) {
  const meta = CLASS_STATUS_META[cls.status] ?? CLASS_STATUS_META.programada
  const joinable = canJoinClass(cls)
  const isLive = cls.status === 'en_vivo'

  return (
    <button
      type="button"
      onClick={() => onOpen(cls)}
      className={`block w-full overflow-hidden rounded-xl border bg-background/40 text-left transition-colors ${
        isLive ? 'border-red-500/50 shadow-[0_0_0_1px_rgba(239,68,68,0.15)]' : 'border-border/70 hover:border-primary/40'
      }`}
    >
      <div className="flex items-center gap-1.5 border-b border-border/50 px-2.5 py-1">
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${meta.dot} ${isLive ? 'animate-pulse' : ''}`} />
        <span className="text-[10px] font-bold uppercase tracking-wide text-text-muted">
          {new Date(cls.scheduled_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
        </span>
        <span className={`ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-bold ${meta.pill}`}>{meta.label}</span>
      </div>
      <div className="p-2.5">
        <p className="text-[12px] font-bold leading-tight text-text">{cls.title}</p>
        {cls.description && (
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-text-muted">{cls.description}</p>
        )}
        {joinable ? (
          <span className="mt-2 flex items-center justify-center gap-1 rounded-lg bg-primary px-2 py-1.5 text-[11px] font-bold text-background">
            🎥 Entrar ahora
          </span>
        ) : (
          cls.status === 'programada' && (
            <p className="mt-1.5 text-[10px] text-text-muted/70">🔒 Se desbloquea 15 min antes</p>
          )
        )}
      </div>
    </button>
  )
}

// ── Modal de detalle: clic en una clase del calendario ──────────────────────
function ClassDetailModal({ cls, onClose }) {
  const meta = CLASS_STATUS_META[cls.status] ?? CLASS_STATUS_META.programada
  const joinable = canJoinClass(cls)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.pill}`}>{meta.icon} {meta.label}</span>
            <h2 className="mt-1.5 text-lg font-extrabold text-text">{cls.title}</h2>
            <p className="text-xs text-text-muted">
              {new Date(cls.scheduled_at).toLocaleString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button type="button" onClick={onClose} className="shrink-0 text-text-muted hover:text-text">✕</button>
        </div>

        <div className="space-y-4 px-5 py-4">
          {cls.description && (
            <p className="text-sm leading-relaxed text-text-muted">{cls.description}</p>
          )}

          {cls.current_topic && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">📍 En este momento</p>
              <p className="mt-0.5 text-sm font-bold text-text">{cls.current_topic}</p>
            </div>
          )}

          {cls.agenda?.length > 0 && (
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-text-muted">Agenda</p>
              <ul className="space-y-1">
                {cls.agenda.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-text-muted">
                    <span>▫️</span> {item.label}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {cls.resources?.length > 0 && (
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-text-muted">Recursos</p>
              <div className="space-y-1">
                {cls.resources.map((r, i) => (
                  <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="block text-sm text-primary hover:underline">
                    {r.type === 'pdf' ? '📄' : '🔗'} {r.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          {cls.missions?.length > 0 && (
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-text-muted">🎯 Misiones</p>
              <div className="space-y-1.5">
                {cls.missions.map((m, i) => (
                  <div key={i} className="rounded-lg bg-surface-hover px-3 py-2">
                    <p className="text-sm font-semibold text-text">{m.title}</p>
                    {m.description && <p className="text-xs text-text-muted">{m.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {joinable ? (
            <Link
              to="/mis-clases"
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-background transition hover:opacity-90"
            >
              🎥 Ir a Mis Clases
            </Link>
          ) : (
            cls.status === 'programada' && (
              <p className="text-center text-xs text-text-muted">🔒 El enlace se desbloquea 15 minutos antes.</p>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default function WeeklyClassCalendar() {
  const classes = useLiveClassStore((s) => s.classes)
  const loading = useLiveClassStore((s) => s.loading)
  const fetchClasses = useLiveClassStore((s) => s.fetchClasses)
  const [weekOffset, setWeekOffset] = useState(0)
  const [openClass, setOpenClass] = useState(null)

  useEffect(() => { fetchClasses() }, [fetchClasses])

  const weekStart = useMemo(() => {
    const d = startOfWeek(new Date())
    d.setDate(d.getDate() + weekOffset * 7)
    return d
  }, [weekOffset])

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        <p className="text-sm text-text-muted">Cargando clases…</p>
      </div>
    )
  }

  return (
    <div>
      {/* Week nav */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold text-text">📆 {formatWeekRange(weekStart)}</p>
          <p className="text-xs text-text-muted">Tus clases en vivo de la semana</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => setWeekOffset((w) => w - 1)}
            className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-bold text-text-muted transition hover:border-primary/40 hover:text-text">
            ‹
          </button>
          {weekOffset !== 0 && (
            <button type="button" onClick={() => setWeekOffset(0)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-text-muted transition hover:border-primary/40 hover:text-text">
              Hoy
            </button>
          )}
          <button type="button" onClick={() => setWeekOffset((w) => w + 1)}
            className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-bold text-text-muted transition hover:border-primary/40 hover:text-text">
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {days.map((day, i) => {
          const dayClasses = classes
            .filter((c) => sameDay(new Date(c.scheduled_at), day))
            .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
          const isToday = sameDay(day, new Date())
          return (
            <div
              key={i}
              className={`flex flex-col rounded-2xl border p-2.5 ${
                isToday ? 'border-primary/50 bg-primary/[0.06] ring-1 ring-primary/20' : 'border-border bg-surface'
              }`}
            >
              <div className={`mb-2 flex items-center justify-between px-0.5 ${isToday ? 'text-primary' : 'text-text-muted'}`}>
                <p className="text-[11px] font-extrabold uppercase tracking-wide">{WEEKDAYS[i]}</p>
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${isToday ? 'bg-primary text-background' : ''}`}>
                  {day.getDate()}
                </span>
              </div>
              <div className="flex-1 space-y-2">
                {dayClasses.length === 0 ? (
                  <div className="flex h-16 items-center justify-center rounded-xl border border-dashed border-border/50">
                    <p className="text-[10px] text-text-muted/50">Libre</p>
                  </div>
                ) : (
                  dayClasses.map((c) => <ClassChip key={c.id} cls={c} onOpen={setOpenClass} />)
                )}
              </div>
            </div>
          )
        })}
      </div>

      {openClass && <ClassDetailModal cls={openClass} onClose={() => setOpenClass(null)} />}
    </div>
  )
}
