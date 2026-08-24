import { useCallback, useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import PhishingOfficeScene, { bridge } from './phishingOfficeScene'
import { PHISHING_OFFICE_QUESTIONS } from '../../../data/phishingOfficeQuestions'

// Joystick táctil — mismo patrón self-contained ya copiado en
// World2dPage.jsx/HospitalMapView.jsx (no vale la pena extraerlo, es chico
// y cada copia vive con su propio juego).
function VirtualJoystick({ dirRef }) {
  const baseRef = useRef(null)
  const stickRef = useRef(null)
  const touchRef = useRef(null)
  const originRef = useRef({ x: 0, y: 0 })

  const move = useCallback((cx, cy) => {
    const o = originRef.current
    const dx = cx - o.x, dy = cy - o.y
    const dist = Math.hypot(dx, dy)
    const max = 44
    const clamped = Math.min(dist, max)
    const angle = Math.atan2(dy, dx)
    const ox = Math.cos(angle) * clamped
    const oy = Math.sin(angle) * clamped
    if (stickRef.current) {
      stickRef.current.style.transform = `translate(calc(-50% + ${ox}px), calc(-50% + ${oy}px))`
    }
    dirRef.current = dist > 8
      ? { x: Math.cos(angle) * Math.min(dist / max, 1), y: Math.sin(angle) * Math.min(dist / max, 1) }
      : { x: 0, y: 0 }
  }, [dirRef])

  const reset = useCallback(() => {
    if (stickRef.current) stickRef.current.style.transform = 'translate(-50%, -50%)'
    dirRef.current = { x: 0, y: 0 }
    touchRef.current = null
  }, [dirRef])

  const onTouchStart = useCallback((e) => {
    const t = e.changedTouches[0]
    touchRef.current = t.identifier
    const rect = baseRef.current.getBoundingClientRect()
    originRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    move(t.clientX, t.clientY)
  }, [move])

  const onTouchMove = useCallback((e) => {
    for (const t of e.changedTouches) {
      if (t.identifier === touchRef.current) { move(t.clientX, t.clientY); break }
    }
  }, [move])

  return (
    <div ref={baseRef} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={reset} onTouchCancel={reset}
      className="relative h-24 w-24 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.18)', touchAction: 'none' }}>
      <div ref={stickRef} className="pointer-events-none absolute left-1/2 top-1/2 h-10 w-10 rounded-full"
        style={{ transform: 'translate(-50%, -50%)', background: 'rgba(255,255,255,0.28)', border: '2px solid rgba(255,255,255,0.5)', backdropFilter: 'blur(4px)' }} />
    </div>
  )
}

// Panel de pregunta — mismo patrón que DoctorPanel (HospitalPanels.jsx):
// opción múltiple, revela correcto/incorrecto + explicación al elegir.
function QuizPanel({ question, onAnswer, onClose }) {
  const [pick, setPick] = useState(null)

  const handlePick = (i) => {
    if (pick !== null) return
    setPick(i)
    onAnswer(i === question.correct)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border-2 border-amber-900/50 bg-surface">
      <div className="flex items-center justify-between border-b border-amber-900/40 bg-amber-950/30 px-4 py-2.5">
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">🎣 {question.deskLabel}</p>
        <button type="button" onClick={onClose} className="rounded-lg border border-white/20 px-2.5 py-1 text-xs font-bold text-white/70 hover:bg-white/10">
          Cerrar ✕
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-5">
        <p className="mb-4 text-base font-bold text-text">{question.scenario}</p>
        <div className="grid gap-2.5">
          {question.options.map((opt, i) => {
            const revealed = pick !== null
            const isCorrect = i === question.correct
            const cls = !revealed
              ? 'border-border hover:border-amber-500 hover:bg-amber-500/5'
              : isCorrect ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
              : pick === i ? 'border-danger bg-danger/15 text-danger'
              : 'border-border/60 opacity-40'
            return (
              <button key={i} type="button" disabled={revealed} onClick={() => handlePick(i)}
                className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-semibold transition-all disabled:cursor-not-allowed ${cls}`}>
                {opt}
              </button>
            )
          })}
        </div>
        {pick !== null && <p className="mt-3 text-xs text-text-muted">{question.explanation}</p>}
      </div>
    </div>
  )
}

function SummaryScreen({ results, onExit }) {
  const correctCount = results.filter((r) => r.correct).length
  return (
    <div className="flex h-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg rounded-3xl border-2 border-border bg-surface p-6 text-center sm:p-8">
        <p className="mb-2 text-5xl">{correctCount === results.length ? '🏆' : '🎣'}</p>
        <p className="mb-1 text-2xl font-black text-text">{correctCount}/{results.length} correctas</p>
        <p className="mb-5 text-sm text-text-muted">Repasa tus respuestas antes de salir:</p>
        <div className="mb-5 space-y-2 text-left">
          {results.map((r) => (
            <div key={r.id} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${r.correct ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-danger/30 bg-danger/10 text-danger'}`}>
              <span>{r.correct ? '✅' : '❌'}</span>
              <span className="truncate">{r.deskLabel}</span>
            </div>
          ))}
        </div>
        <button type="button" onClick={onExit} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-black text-background">
          Volver a Games
        </button>
      </div>
    </div>
  )
}

export default function PhishingOfficeGame() {
  const [screen, setScreen] = useState('intro') // intro | playing | summary
  const containerRef = useRef(null)
  const gameRef = useRef(null)
  const dirRef = useRef({ x: 0, y: 0 })
  const [nearId, setNearId] = useState(null)
  const [openId, setOpenId] = useState(null)
  const [results, setResults] = useState([])

  const answeredIds = results.map((r) => r.id)

  useEffect(() => {
    if (screen !== 'playing' || !containerRef.current) return
    bridge.dir = dirRef
    bridge.onZoneNear = (id) => setNearId(id)

    const config = {
      type: Phaser.AUTO,
      width: containerRef.current.clientWidth || window.innerWidth,
      height: containerRef.current.clientHeight || 480,
      parent: containerRef.current,
      backgroundColor: '#1a1410',
      physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
      scene: [PhishingOfficeScene],
      scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
    }
    gameRef.current = new Phaser.Game(config)

    return () => {
      bridge.onZoneNear = null
      bridge.scene = null
      gameRef.current?.destroy(true)
      gameRef.current = null
    }
  }, [screen])

  const nearQuestion = nearId ? PHISHING_OFFICE_QUESTIONS.find((q) => q.id === nearId) : null
  const openQuestion = openId ? PHISHING_OFFICE_QUESTIONS.find((q) => q.id === openId) : null

  const handleAnswer = (id, correct) => {
    if (answeredIds.includes(id)) return
    const q = PHISHING_OFFICE_QUESTIONS.find((qq) => qq.id === id)
    setResults((prev) => [...prev, { id, deskLabel: q.deskLabel, correct }])
    bridge.scene?.markAnswered(id)
  }

  if (screen === 'intro') {
    return (
      <div className="flex h-full items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-3xl border-2 border-border bg-surface p-6 text-center sm:p-8">
          <p className="mb-3 text-5xl">🎣</p>
          <p className="mb-2 text-xl font-black text-text">Protégete del Phishing</p>
          <p className="mb-6 text-sm text-text-muted">
            Camina por la oficina (flechas/WASD o el joystick en móvil) y acércate a cada escritorio — ahí vas a encontrar una situación real de phishing para resolver.
          </p>
          <button type="button" onClick={() => setScreen('playing')} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-black text-background">
            Comenzar →
          </button>
        </div>
      </div>
    )
  }

  if (screen === 'summary') {
    return <SummaryScreen results={results} onExit={() => setScreen('intro')} />
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#1a1410]">
      <div ref={containerRef} className="h-full w-full" />

      <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full border border-white/15 bg-black/70 px-4 py-1.5 text-[11px] font-bold text-white/80 backdrop-blur">
        📋 {answeredIds.length}/{PHISHING_OFFICE_QUESTIONS.length} escritorios
      </div>

      {answeredIds.length === PHISHING_OFFICE_QUESTIONS.length && !openQuestion && (
        <button type="button" onClick={() => setScreen('summary')}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-xl bg-primary px-5 py-2.5 text-sm font-black text-background shadow-lg">
          Ver resultado final →
        </button>
      )}

      {nearQuestion && !openQuestion && !answeredIds.includes(nearQuestion.id) && (
        <button type="button" onClick={() => setOpenId(nearQuestion.id)}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 rounded-xl border border-amber-500 bg-black/80 px-4 py-2 text-xs font-bold text-amber-300 backdrop-blur md:bottom-4">
          🎣 {nearQuestion.deskLabel} — responder
        </button>
      )}

      <div className="absolute bottom-4 left-4 touch-none select-none md:hidden">
        <VirtualJoystick dirRef={dirRef} />
      </div>
      <div className="absolute bottom-4 right-3 hidden rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-[11px] text-white/50 backdrop-blur md:block">
        WASD / ↑↓←→ para moverte
      </div>

      {openQuestion && (
        <div className="absolute inset-0 z-20 flex flex-col bg-black/80 p-3 backdrop-blur-sm sm:p-6">
          <div className="min-h-0 flex-1">
            <QuizPanel
              question={openQuestion}
              onAnswer={(correct) => handleAnswer(openQuestion.id, correct)}
              onClose={() => setOpenId(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
