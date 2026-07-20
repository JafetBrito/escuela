import { useEffect, useState } from 'react'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import { Link, useParams } from 'react-router-dom'
import { useLiveClassStore, canJoinClass, findClassByCode, classShortCode } from '../../stores/useLiveClassStore'
import HubContent from './HubContent'

const STATUS_META = {
  programada: { label: 'Programada', cls: 'bg-amber-500/15 text-amber-300 border-amber-400/30', dot: 'bg-amber-300' },
  en_vivo:    { label: 'En vivo',     cls: 'bg-red-500/15 text-red-300 border-red-400/30',       dot: 'bg-red-400 animate-pulse' },
  finalizada: { label: 'Finalizada',  cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30', dot: 'bg-emerald-300' },
}

// Punto de estado + etiqueta — reemplaza el simple "🔴 En vivo" por un punto
// que de verdad pulsa (antes era solo el emoji, no había animación real).
function StatusPill({ status }) {
  const meta = STATUS_META[status] ?? STATUS_META.programada
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${meta.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} /> {meta.label}
    </span>
  )
}

// Cuántos alumnos entraron a la clase (pings kind='entro', únicos) — dato
// real derivado del mismo feed que ya usa el admin, ninguno inventado. Solo
// tiene sentido mostrarlo en clases "para todos" (sin student_id fijo).
function ConnectedBadge({ activeClass, pings }) {
  if (activeClass.student_id || activeClass.status !== 'en_vivo') return null
  const count = new Set(pings.filter((p) => p.kind === 'entro').map((p) => p.student_id)).size
  if (count === 0) return null
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-bold text-white/90">
      👥 {count} conectado{count === 1 ? '' : 's'}
    </span>
  )
}

// Código corto para sincronizar el segundo dispositivo (ya existía la lógica
// de leerlo en SyncCodeInput, pero el Hub nunca mostraba de dónde salía ese
// código) — ahora se ve aquí mismo, con copiado de un toque.
function SyncCodeChip({ classId }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(classShortCode(classId)).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/20"
      title="Copiar código para verla en otro dispositivo"
    >
      🔗 <span className="font-mono tracking-widest">{classShortCode(classId)}</span>
      <span>{copied ? '✓ Copiado' : 'Copiar'}</span>
    </button>
  )
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
      <div className="shrink-0"><StatusPill status={cls.status} /></div>
    </button>
  )
}

// ── Sincronizar con código — la contraparte de la pantalla "En tu teléfono" ──
// de /clases-disponibles: teclea el código y salta directo al Hub de esa clase.
function SyncCodeInput({ classes, onOpen }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const match = findClassByCode(classes, code)
    if (!match) { setError(true); return }
    setError(false)
    onOpen(match.id)
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-primary/70">🔗 Sincronizar con código</p>
      <p className="mt-0.5 text-xs text-text-muted">¿Estás viendo una clase en otra pantalla? Escribe el código que te mostró.</p>
      <div className="mt-2 flex gap-2">
        <input
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(false) }}
          placeholder="Ej: 3F9A2B"
          maxLength={6}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm uppercase tracking-widest text-text outline-none focus:border-primary"
        />
        <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background hover:opacity-90">Conectar</button>
      </div>
      {error && <p className="mt-1.5 text-xs text-danger">No encontramos una clase con ese código.</p>}
    </form>
  )
}

// ── Hub de una clase abierta ────────────────────────────────────────────────
function ClassHub({ onBack }) {
  const activeClass = useLiveClassStore((s) => s.activeClass)
  const pings = useLiveClassStore((s) => s.pings)
  const countdown = useCountdown(activeClass?.status === 'programada' ? activeClass?.scheduled_at : null)

  if (!activeClass) return null
  const hasReward = activeClass.xp_reward > 0 || activeClass.gold_reward > 0
  const unlockTime = new Date(new Date(activeClass.scheduled_at).getTime() - 15 * 60_000)

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-text-muted hover:text-primary">← Todas mis clases</button>

      {/* Tarjeta de anuncio — antes era solo título/descripción/botón; ahora
          trae estado en vivo con punto animado, quién la da, cuántos ya están
          conectados (dato real de pings), la recompensa si tiene, y el código
          de sincronización visible (antes solo se podía teclear a ciegas). */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-blue-700 px-5 py-6 shadow-lg sm:px-7 sm:py-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-black/10 blur-3xl" />

        <div className="relative flex flex-wrap items-center gap-2">
          <StatusPill status={activeClass.status} />
          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-bold text-white/90">
            🧑‍🏫 Con Jafet
          </span>
          <ConnectedBadge activeClass={activeClass} pings={pings} />
        </div>

        <h1 className="relative mt-3 text-2xl font-extrabold text-white sm:text-3xl">{activeClass.title}</h1>
        {activeClass.description && <p className="relative mt-1.5 max-w-2xl text-sm text-white/85">{activeClass.description}</p>}

        <div className="relative mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-white/75">
          <span>
            📅 {new Date(activeClass.scheduled_at).toLocaleString('es-MX', { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </span>
          {countdown && <span>· Empieza {countdown}</span>}
          {hasReward && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2.5 py-0.5 text-xs font-bold text-amber-200">
              🎁 {activeClass.xp_reward > 0 && `+${activeClass.xp_reward} XP`}
              {activeClass.xp_reward > 0 && activeClass.gold_reward > 0 && ' · '}
              {activeClass.gold_reward > 0 && `+${activeClass.gold_reward} oro`}
              {' '}por asistir
            </span>
          )}
        </div>

        <div className="relative mt-5 flex flex-wrap items-center gap-2">
          {activeClass.demo_video_id ? (
            <Link to="/clases-disponibles" className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/25">
              🎬 El video se ve en la computadora — abrir Clases Disponibles →
            </Link>
          ) : canJoinClass(activeClass) ? (
            <a
              href={activeClass.meet_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-black text-indigo-700 shadow-md transition hover:scale-[1.02] hover:opacity-95 active:scale-100"
            >
              🎥 Unirse a la videollamada
            </a>
          ) : (
            <p className="rounded-xl bg-white/10 px-3 py-2 text-sm text-white/80">
              🔒 Se desbloquea a las {unlockTime.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
          {!activeClass.demo_video_id && <SyncCodeChip classId={activeClass.id} />}
        </div>
      </div>

      <HubContent activeClass={activeClass} />
    </div>
  )
}

export default function MyClassesPage() {
  const { classId }  = useParams()
  const classes      = useLiveClassStore((s) => s.classes)
  const fetchClasses = useLiveClassStore((s) => s.fetchClasses)
  const openClass    = useLiveClassStore((s) => s.openClass)
  const closeClass   = useLiveClassStore((s) => s.closeClass)
  const activeClass  = useLiveClassStore((s) => s.activeClass)

  useEffect(() => {
    fetchClasses()
    return () => closeClass()
  }, [fetchClasses, closeClass])

  // Deep-link desde una notificación ("tu clase está en vivo") — abre la
  // clase directo, sin esperar a elegirla de la lista.
  useEffect(() => {
    if (classId) openClass(classId)
  }, [classId, openClass])

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <main className="flex-1 px-4 py-6 md:px-8">
        <div className="mx-auto max-w-2xl">
          {!activeClass && (
            <>
              <h1 className="mb-1 text-2xl font-black text-text">🎓 Mis Clases</h1>
              <p className="mb-6 text-sm text-text-muted">Tus clases en vivo con Jafet — la videollamada es en Jitsi Meet, aquí ves la agenda, los recursos y puedes preguntar.</p>
              <SyncCodeInput classes={classes} onOpen={openClass} />
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
