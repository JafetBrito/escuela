import { useEffect, useRef, useState } from 'react'

const TIPS = [
  'Muévete con WASD · mira con el ratón · cámara con rueda del ratón.',
  'Presiona E al estar cerca de un NPC para abrir su diálogo.',
  'Presiona M para abrir el mapa del Campus y orientarte.',
  'Completar un curso te da XP y monedas para subir de nivel.',
  'Acepta misiones en /misiones — cada una tiene recompensas únicas.',
  'El Anfiteatro tiene pantalla de video en vivo. ¡Activa el audio!',
  'El campus es compartido — verás a otros estudiantes en tiempo real.',
  'Presiona C para abrir el chat del mundo con otros jugadores.',
  'Los portales te teletransportan a zonas especiales del campus.',
  'Cada clase tiene habilidades únicas. Explora el Árbol del Mundo para elegir.',
]

// Simulated loading steps – replaced with real useProgress in VrAssetProgress
// once Canvas mounts. These just make the pre-canvas wait feel alive.
const LOAD_STEPS = [
  [12,  400],
  [28,  900],
  [44, 1500],
  [60, 2100],
  [74, 2700],
  [85, 3200],
  [93, 3700],
  [100, 4200],
]

function requestFullscreen() {
  const el = document.documentElement
  const req = el.requestFullscreen?.bind(el) ?? el.webkitRequestFullscreen?.bind(el)
  req?.().catch(() => {})
}

export default function VrLoadingScreen({ onEnter, worldName = 'Campus VR' }) {
  const [progress, setProgress] = useState(0)
  const [ready, setReady] = useState(false)
  const [visible, setVisible] = useState(true)
  const [tipIndex, setTipIndex] = useState(0)
  const timersRef = useRef([])

  // Simulated progress bar
  useEffect(() => {
    LOAD_STEPS.forEach(([pct, delay]) => {
      const t = setTimeout(() => {
        setProgress(pct)
        if (pct === 100) setReady(true)
      }, delay)
      timersRef.current.push(t)
    })
    return () => timersRef.current.forEach(clearTimeout)
  }, [])

  // Rotate tips every 3.5 s
  useEffect(() => {
    const id = setInterval(() => setTipIndex((i) => (i + 1) % TIPS.length), 3500)
    return () => clearInterval(id)
  }, [])

  const enter = () => {
    if (!ready || !visible) return
    requestFullscreen()
    setVisible(false)
    setTimeout(onEnter, 420)
  }

  // Any key / click enters once ready
  useEffect(() => {
    if (!ready) return
    const h = (e) => { if (!e.repeat) enter() }
    window.addEventListener('keydown', h)
    window.addEventListener('pointerdown', h)
    return () => {
      window.removeEventListener('keydown', h)
      window.removeEventListener('pointerdown', h)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden select-none"
      style={{
        zIndex: 9999,
        background: 'radial-gradient(ellipse at 50% 55%, #120828 0%, #06030f 65%)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.42s ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {/* ── Stars ─────────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {Array.from({ length: 70 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width:  i % 8 === 0 ? 2 : 1,
              height: i % 8 === 0 ? 2 : 1,
              top:  `${(i * 137.5) % 100}%`,
              left: `${(i * 97.3)  % 100}%`,
              opacity: 0.15 + (i % 5) * 0.08,
              animation: `ls-pulse ${2.5 + (i % 4) * 0.8}s ease-in-out infinite`,
              animationDelay: `${(i % 7) * 0.4}s`,
            }}
          />
        ))}
      </div>

      {/* ── Portal rings (inspired by WoC) ────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
        {/* outer glow blob */}
        <div className="absolute rounded-full"
          style={{ width: 320, height: 320,
            background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)',
            animation: 'ls-pulse 3.5s ease-in-out infinite' }} />
        {/* rings */}
        {[380, 510, 650].map((size, i) => (
          <div key={size} className="absolute rounded-full"
            style={{
              width: size, height: size,
              border: `1px solid rgba(168,85,247,${0.22 - i * 0.06})`,
              animation: `ls-spin ${14 + i * 9}s linear infinite ${i % 2 ? 'reverse' : ''}`,
            }} />
        ))}
      </div>

      {/* ── Logo ─────────────────────────────────────────────────── */}
      <div className="relative z-10 mb-6 flex flex-col items-center gap-2">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-2xl text-5xl shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
            boxShadow: '0 0 48px rgba(168,85,247,0.55)',
            animation: 'ls-pulse 2.8s ease-in-out infinite',
          }}
        >
          🎓
        </div>
        <h1
          className="text-4xl font-black tracking-tight text-white sm:text-5xl"
          style={{ textShadow: '0 0 36px rgba(168,85,247,0.9)' }}
        >
          Oliver Academy
        </h1>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-400">
          {worldName}
        </p>
      </div>

      {/* ── Progress bar ─────────────────────────────────────────── */}
      <div className="relative z-10 w-64 sm:w-80">
        <div className="mb-1.5 flex justify-between text-[11px] text-white/35">
          <span>{ready ? 'Listo' : 'Preparando campus…'}</span>
          <span className="font-semibold text-violet-400">{progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #7c3aed, #a855f7, #c084fc)',
              boxShadow: '0 0 10px rgba(168,85,247,0.7)',
            }}
          />
        </div>
      </div>

      {/* ── Enter button ─────────────────────────────────────────── */}
      <div
        className="relative z-10 mt-7 transition-all duration-500"
        style={{ opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(10px)' }}
      >
        <button
          type="button"
          onClick={enter}
          className="rounded-xl px-10 py-3 text-sm font-black text-white shadow-xl transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            boxShadow: '0 0 28px rgba(168,85,247,0.65)',
            animation: ready ? 'ls-pulse 2.2s ease-in-out infinite' : 'none',
          }}
        >
          ▶ Entrar al Campus
        </button>
        <p className="mt-2 text-center text-[10px] text-white/25">
          o presiona cualquier tecla
        </p>
      </div>

      {/* ── Rotating tip ─────────────────────────────────────────── */}
      <div
        className="relative z-10 mt-8 max-w-xs rounded-xl border border-white/8 bg-white/5 px-4 py-2.5 text-center text-xs text-white/50"
        style={{ minHeight: 44 }}
      >
        💡 {TIPS[tipIndex]}
      </div>

      <p className="absolute bottom-4 right-4 text-[10px] text-white/15">oliver.academy</p>

      <style>{`
        @keyframes ls-spin  { to { transform: rotate(360deg); } }
        @keyframes ls-pulse {
          0%, 100% { opacity: 0.65; }
          50%       { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
