import { useEffect, useState, useRef } from 'react'

const TIPS = [
  '🐾 Oliver es un gato naranja realista. Siempre camina sobre sus 4 patas.',
  '⌨️ Completar un curso te da XP para subir de nivel y desbloquear habilidades.',
  '🎯 Hacer misiones diarias es la forma más rápida de acumular experiencia.',
  '🌀 Acércate a los portales y presiona E para viajar entre mundos.',
  '💬 Presiona C para abrir el chat del mundo y hablar con otros jugadores.',
  '📜 Acepta misiones en la página de Misiones para ganar monedas y XP extra.',
  '🐾 El Arañazo de Oliver elimina una respuesta incorrecta en los Boss Fights.',
  '🎭 El Anfiteatro tiene una pantalla de video en vivo. ¡Activa el audio!',
  '🗺️ Presiona M para abrir el mapa del Campus y ver todos los mundos disponibles.',
  '🤖 Cada clase tiene habilidades únicas. El Ingeniero de IA predice la respuesta correcta.',
  '🕹️ El Ciber-Estratega puede bloquear proyectiles del jefe con Proxy Velo.',
  '🦉 El Filósofo usa la Réplica Socrática para ganar tiempo extra en exámenes.',
  '🔮 El Oráculo Felino de Oliver resalta el círculo correcto en el estadio.',
  '🌐 El Campus es compartido. Verás a otros estudiantes moverse en tiempo real.',
  '🎨 El Diseñador puede confundir al jefe con Burst Visual por 2 segundos.',
  '📡 Usa el Escaneo Táctico para ver las debilidades del enemigo antes de atacar.',
]

// Simulated loading steps: [progress%, delay_ms_from_start]
const LOAD_STEPS = [
  [8,   300],
  [18,  700],
  [32, 1200],
  [48, 1800],
  [63, 2400],
  [75, 3000],
  [85, 3600],
  [93, 4200],
  [100, 5000],
]

export default function VrLoadingScreen({ onEnter, worldName = 'Campus VR' }) {
  const [progress, setProgress] = useState(0)
  const [ready, setReady] = useState(false)
  const [visible, setVisible] = useState(true)
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)])
  const timersRef = useRef([])

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

  const enter = () => {
    if (!ready) return
    setVisible(false)
    // Give the fade-out transition time before unmounting
    setTimeout(onEnter, 400)
  }

  useEffect(() => {
    if (!ready) return
    const handler = (e) => {
      if (e.type === 'keydown' || e.type === 'pointerdown') enter()
    }
    window.addEventListener('keydown', handler)
    window.addEventListener('pointerdown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
      window.removeEventListener('pointerdown', handler)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-400"
      style={{
        zIndex: 9999,
        background: 'linear-gradient(160deg, #0a0e1a 0%, #0f172a 50%, #0e0a1f 100%)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {/* Stars background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.6 + 0.1,
              animation: `pulse ${Math.random() * 3 + 2}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* Logo + cat */}
      <div className="relative z-10 mb-8 flex flex-col items-center gap-3">
        <div className="text-7xl animate-bounce" style={{ animationDuration: '2s' }}>🐱</div>
        <h1 className="text-3xl font-black tracking-widest text-white" style={{ textShadow: '0 0 20px rgba(251,146,60,0.8)' }}>
          oliver.academy
        </h1>
        <p className="text-sm font-semibold tracking-widest text-orange-400 uppercase">
          {worldName}
        </p>
      </div>

      {/* Tip */}
      <div className="relative z-10 mb-10 max-w-md px-6 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Consejo</p>
        <p className="text-sm leading-relaxed text-slate-300">{tip}</p>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 w-72 sm:w-96">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
          <span>Cargando mundo…</span>
          <span className="font-bold text-orange-400">{progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #ea580c, #f97316, #fb923c)',
              boxShadow: '0 0 12px rgba(249,115,22,0.6)',
            }}
          />
        </div>
      </div>

      {/* "Press any key" */}
      <div
        className="relative z-10 mt-10 transition-all duration-500"
        style={{ opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(8px)' }}
      >
        <button
          type="button"
          onClick={enter}
          className="rounded-full border border-orange-500/40 bg-orange-500/10 px-8 py-3 text-sm font-semibold text-orange-300 backdrop-blur transition-colors hover:bg-orange-500/20"
          style={{ animation: ready ? 'pulse 2s ease-in-out infinite' : 'none' }}
        >
          Presiona cualquier tecla para continuar
        </button>
      </div>

      {/* Version watermark */}
      <p className="absolute bottom-4 right-4 text-xs text-slate-700">v1.0 · oliver.academy</p>
    </div>
  )
}
