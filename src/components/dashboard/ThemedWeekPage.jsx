import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import courses from '../../data/courses.json'
import { dayIndex, dateKey, weekDates, efemerideOf } from '../../data/themedWeeks'
import { useThemedWeekStore, resolveThemedWeek } from '../../stores/useThemedWeekStore'
import { useThemedAnswersStore } from '../../stores/useThemedAnswersStore'

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

// /semana — el contenido del día de la semana temática: dato, figura, efeméride,
// pregunta (con respuesta que se envía) y tarea. Los días de esta semana se
// pueden abrir para repasar/completar los que faltaron; los futuros no.
export default function ThemedWeekPage() {
  const navigate = useNavigate()
  const override = useThemedWeekStore((s) => s.override)
  const week = useMemo(() => resolveThemedWeek(override), [override])
  const entries = useThemedAnswersStore((s) => s.entries)
  const submitAnswer = useThemedAnswersStore((s) => s.submitAnswer)
  const toggleTask = useThemedAnswersStore((s) => s.toggleTask)

  const today = useMemo(() => new Date(), [])
  const dates = useMemo(() => weekDates(today), [today])
  const [selected, setSelected] = useState(dayIndex(today))
  const [draft, setDraft] = useState({}) // { [dateKey]: texto sin enviar }
  const [reward, setReward] = useState(null)

  const featured = useMemo(
    () => (week ? courses.filter((c) => week.categories.includes(c.category) && !c.locked).slice(0, 4) : []),
    [week],
  )

  if (!week) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-text">
        <AppTopBar />
        <p className="p-10 text-center text-sm text-text-muted">No hay semana temática activa ahora mismo.</p>
      </div>
    )
  }

  const date = dates[selected]
  const key = dateKey(date)
  const day = week.days[selected] ?? {}
  const entry = entries[key]
  const efem = efemerideOf(date)
  const text = draft[key] ?? entry?.answer ?? ''
  const doneCount = dates.filter((d) => entries[dateKey(d)]?.answer).length

  const send = () => {
    const r = submitAnswer(key, week.id, text)
    if (r) setReward(r)
    setDraft((d) => ({ ...d, [key]: undefined }))
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <main className="flex-1 px-4 py-6 md:px-8">
        <div className="mx-auto w-full max-w-[1400px] space-y-5">
          <div className="rounded-2xl px-6 py-6 shadow-lg" style={{ background: `linear-gradient(135deg, ${week.color}, ${week.color}99)` }}>
            <p className="text-[11px] font-black uppercase tracking-widest text-white/80">Esta semana en Oliver Academy</p>
            <h1 className="mt-1 text-3xl font-extrabold text-white drop-shadow-sm">{week.icon} {week.title}</h1>
            <p className="mt-1 text-sm font-medium text-white/90">{week.blurb}</p>
            <p className="mt-2 text-xs font-bold text-white/80">Respuestas enviadas: {doneCount} / 7</p>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {dates.map((d, i) => {
              const future = i > dayIndex(today)
              const e = entries[dateKey(d)]
              return (
                <button
                  key={i}
                  type="button"
                  disabled={future}
                  onClick={() => { setSelected(i); setReward(null) }}
                  className={`rounded-xl border px-2 py-2 text-center transition disabled:opacity-40 ${
                    selected === i ? 'border-primary bg-primary/10' : 'border-border bg-surface hover:border-primary/40'
                  }`}
                >
                  <p className="text-[11px] font-bold text-text-muted">{DAY_NAMES[i]} {d.getDate()}</p>
                  <p className="text-base">{e?.answer && e?.taskDone ? '✅' : e?.answer || e?.taskDone ? '🟡' : future ? '🔒' : '⚪'}</p>
                </button>
              )
            })}
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-4">
              {efem && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">📆 Un día como hoy</p>
                  <p className="mt-1 text-sm text-text">{efem.text}</p>
                </div>
              )}
              {day.figure && (
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-muted/70">🧑‍🏫 Figura del día</p>
                  <p className="mt-1 text-xl font-extrabold text-text">{day.figure.name}</p>
                  <p className="text-xs text-text-muted">{day.figure.years} · {day.figure.role}</p>
                </div>
              )}
              {day.fact && (
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-muted/70">💡 Hoy aprendemos</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-text">{day.fact}</p>
                </div>
              )}
              <div className="rounded-2xl border border-border bg-surface p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted/70">📚 Cursos de la semana</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {featured.length === 0 && <span className="text-xs text-text-muted">Pronto habrá cursos de este tema.</span>}
                  {featured.map((c) => (
                    <button key={c.id} type="button" onClick={() => navigate(`/learn/${c.id}`)}
                      className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-text transition hover:border-primary hover:text-primary">
                      {c.icon} {c.title}
                    </button>
                  ))}
                </div>
                <Link to="/clases-disponibles" className="mt-3 inline-block text-xs font-semibold text-primary hover:underline">
                  🎥 Ver la clase en vivo con profesor invitado →
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              {day.question && (
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-muted/70">❓ Pregunta del día</p>
                  <p className="mt-1.5 text-sm font-semibold text-text">{day.question}</p>
                  <textarea
                    value={text}
                    onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                    rows={5}
                    maxLength={1500}
                    placeholder="Escribe tu respuesta…"
                    className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
                  />
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <button type="button" onClick={send} disabled={!text.trim()}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background hover:opacity-90 disabled:opacity-40">
                      {entry?.answer ? 'Actualizar respuesta' : 'Enviar respuesta'}
                    </button>
                    {entry?.answer && !reward && <span className="text-xs font-semibold text-emerald-500">✅ Enviada</span>}
                    {reward && <span className="text-xs font-bold text-emerald-500">🎁 +{reward.xp} XP · +{reward.coins} monedas</span>}
                  </div>
                </div>
              )}
              {day.task && (
                <button
                  type="button"
                  onClick={() => toggleTask(key, week.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${entry?.taskDone ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-border bg-surface hover:border-primary/40'}`}
                >
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-muted/70">📝 Tarea del día</p>
                  <p className="mt-1.5 text-sm text-text">{entry?.taskDone ? '✅ ' : '⬜ '}{day.task}</p>
                  <p className="mt-1 text-[11px] text-text-muted">Toca para marcarla como hecha.</p>
                </button>
              )}
              {!day.question && !day.fact && !day.figure && !day.task && (
                <p className="text-sm text-text-muted">Este día no tiene contenido todavía.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
