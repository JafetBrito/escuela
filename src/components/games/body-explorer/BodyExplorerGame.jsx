import { useState, Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import MascotMesh from '../../mascot/MascotMesh'
import SceneEffects from '../../shared/SceneEffects'
import { PlayerAvatarBody } from '../../vr/engine/Player'
import { getMascotById } from '../../../data/mascotRegistry'
import { useCurrencyStore } from '../../../stores/useCurrencyStore'
import { useLevelStore } from '../../../stores/useLevelStore'

// Juego compartido por las escuelas de Medicina y Biología: gira un modelo 3D
// real (los mismos .glb ya usados en el resto de la app — sin inventar
// assets nuevos) y compara sistemas del cuerpo entre el humano y 3 animales.
// No es un modelo anatómico con órganos internos (eso es la exploración VR
// "próxima" del cuerpo humano) — este es honesto sobre lo que muestra: el
// modelo externo, con datos reales de anatomía comparada por sistema.

const SUBJECTS = [
  { id: 'hombre', label: 'Humano (Hombre)', icon: '🧍', kind: 'avatar', avatarId: 'hombre' },
  { id: 'mujer', label: 'Humano (Mujer)', icon: '🧍‍♀️', kind: 'avatar', avatarId: 'mujer' },
  { id: 'toro', label: 'Toro', icon: '🐂', kind: 'mascot', mascotId: 15 },
  { id: 'gato', label: 'Gato', icon: '🐈', kind: 'mascot', mascotId: 16 },
  { id: 'buho', label: 'Búho', icon: '🦉', kind: 'mascot', mascotId: 17 },
]

const SYSTEMS = [
  { id: 'esqueleto', icon: '💀', label: 'Esqueleto' },
  { id: 'circulatorio', icon: '❤️', label: 'Circulatorio' },
  { id: 'respiratorio', icon: '🫁', label: 'Respiratorio' },
  { id: 'digestivo', icon: '🍽️', label: 'Digestivo' },
  { id: 'nervioso', icon: '🧠', label: 'Nervioso' },
]

// Datos reales de anatomía comparada, por sujeto y sistema.
const FACTS = {
  hombre: {
    esqueleto: 'El esqueleto humano adulto tiene 206 huesos, aunque nacemos con cerca de 300 — muchos se fusionan mientras crecemos.',
    circulatorio: 'El corazón humano late en promedio 100,000 veces al día, bombeando sangre por unos 100,000 km de vasos sanguíneos.',
    respiratorio: 'Los pulmones humanos tienen unos 300 millones de diminutos sacos de aire (alvéolos) donde ocurre el intercambio de oxígeno.',
    digestivo: 'El intestino delgado humano mide unos 6-7 metros — enrollado dentro del abdomen para caber en tan poco espacio.',
    nervioso: 'El cerebro humano tiene unos 86,000 millones de neuronas, comunicándose entre sí a velocidades de hasta 120 metros por segundo.',
  },
  toro: {
    esqueleto: 'El esqueleto del toro está adaptado para soportar mucho peso corporal, con huesos de las patas especialmente robustos.',
    circulatorio: 'El corazón de un toro adulto puede pesar más de 2 kg — varias veces el tamaño de un corazón humano.',
    respiratorio: 'Los toros tienen pulmones grandes que les permiten un esfuerzo físico sostenido para pastar y moverse largas distancias.',
    digestivo: 'El estómago del toro tiene 4 cámaras (rumen, retículo, omaso, abomaso) porque es un rumiante — así digiere pasto y celulosa que los humanos no podemos aprovechar.',
    nervioso: 'Los toros tienen visión panorámica de casi 330° por la posición lateral de sus ojos, aunque con poca visión frontal en profundidad.',
  },
  gato: {
    esqueleto: 'Un gato tiene alrededor de 230 huesos (más que un humano) y una clavícula flotante que le permite pasar por espacios muy estrechos.',
    circulatorio: 'El corazón de un gato late mucho más rápido que el humano: entre 140 y 220 veces por minuto en reposo.',
    respiratorio: 'Los gatos respiran entre 20 y 30 veces por minuto en reposo, más rápido que un humano adulto.',
    digestivo: 'Los gatos son carnívoros estrictos — su sistema digestivo está adaptado casi exclusivamente para procesar proteína animal.',
    nervioso: 'Los bigotes de un gato son órganos sensoriales conectados a terminaciones nerviosas profundas, que le ayudan a detectar espacios y vibraciones en la oscuridad.',
  },
  buho: {
    esqueleto: 'Los búhos tienen el doble de vértebras cervicales que los humanos (14 contra 7), lo que les permite girar la cabeza hasta 270°.',
    circulatorio: 'Los búhos tienen arterias especiales en el cuello que evitan cortar el flujo de sangre al cerebro incluso girando la cabeza al extremo.',
    respiratorio: 'Las aves, incluidos los búhos, tienen sacos aéreos además de pulmones — un sistema respiratorio más eficiente que el de los mamíferos.',
    digestivo: 'Los búhos tragan a sus presas casi enteras y luego regurgitan una "egagrópila" con los huesos y el pelo que no pudieron digerir.',
    nervioso: 'Los búhos tienen una audición tan precisa que pueden cazar en total oscuridad guiándose solo por el sonido.',
  },
}
FACTS.mujer = FACTS.hombre

const QUIZ_POOL = [
  { q: '¿Qué animal tiene un estómago con 4 cámaras para digerir pasto y celulosa?', options: ['Gato', 'Búho', 'Toro', 'Humano'], correct: 2 },
  { q: '¿Qué animal puede girar la cabeza hasta 270°?', options: ['Toro', 'Búho', 'Gato', 'Humano'], correct: 1 },
  { q: '¿Cuántos huesos tiene aproximadamente el esqueleto humano adulto?', options: ['150', '206', '300', '450'], correct: 1 },
  { q: '¿Qué animal tiene una clavícula flotante que le permite pasar por espacios muy estrechos?', options: ['Toro', 'Búho', 'Gato', 'Humano'], correct: 2 },
  { q: '¿Aproximadamente cuántas neuronas tiene el cerebro humano?', options: ['86 millones', '86,000 millones', '860 millones', '8.6 millones'], correct: 1 },
  { q: '¿Qué tienen las aves en su sistema respiratorio, además de pulmones, que los mamíferos no tienen?', options: ['Branquias', 'Sacos aéreos', 'Un segundo corazón', 'Aletas'], correct: 1 },
  { q: '¿Qué es una "egagrópila", que regurgitan los búhos?', options: ['Un tipo de huevo', 'Una bola con huesos y pelo no digeridos de sus presas', 'Una pluma especial', 'Un sonido de caza'], correct: 1 },
  { q: '¿Por qué los toros son capaces de digerir pasto que los humanos no pueden aprovechar?', options: ['Tienen dientes especiales', 'Su estómago de 4 cámaras (rumiante) fermenta la celulosa', 'No digieren el pasto, solo lo mastican', 'Tienen dos estómagos separados sin conexión'], correct: 1 },
]

function Viewer3D({ subject }) {
  return (
    <div className="h-64 w-full overflow-hidden rounded-2xl border border-border bg-surface sm:h-80">
      <Canvas camera={{ position: [0, 0.4, 4], fov: 40 }}>
        <ambientLight color="#ffecd8" intensity={0.95} />
        <directionalLight position={[3, 3, 3]} color="#ffd9a0" intensity={1.4} />
        <directionalLight position={[-3, 1, -2]} color="#a0c4ff" intensity={0.28} />
        <Suspense fallback={null}>
          {subject.kind === 'avatar'
            ? <PlayerAvatarBody avatarId={subject.avatarId} />
            : <MascotMesh mascot={getMascotById(subject.mascotId)} />}
        </Suspense>
        <SceneEffects />
        <OrbitControls enablePan={false} minDistance={2} maxDistance={7} />
      </Canvas>
    </div>
  )
}

function SelectScreen({ onSelect }) {
  return (
    <div className="flex flex-col items-center gap-6 p-6 w-full max-w-lg mx-auto">
      <div className="text-center">
        <div className="text-5xl mb-2">🧬</div>
        <h1 className="text-2xl font-black text-text">Explorador 3D: Cuerpo y Naturaleza</h1>
        <p className="text-sm text-text-muted mt-1">Gira un modelo 3D real, compara sus sistemas con los de otras especies, y pon a prueba lo que aprendiste.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 w-full sm:grid-cols-3">
        {SUBJECTS.map((s) => (
          <button key={s.id} type="button" onClick={() => onSelect(s)}
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-lg active:scale-95">
            <span className="text-4xl">{s.icon}</span>
            <span className="text-sm font-bold text-text">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function ExploreScreen({ subject, onChangeSubject, onStartQuiz }) {
  const [activeSystem, setActiveSystem] = useState('esqueleto')
  return (
    <div className="flex flex-col items-center gap-4 p-6 w-full max-w-lg mx-auto">
      <div className="flex w-full items-center justify-between">
        <h2 className="text-lg font-bold text-text">{subject.icon} {subject.label}</h2>
        <button type="button" onClick={onChangeSubject} className="text-xs text-text-muted hover:text-text">← Cambiar</button>
      </div>
      <Viewer3D subject={subject} />
      <p className="text-[11px] text-text-muted">Arrastra para girar, pellizca o usa la rueda del mouse para acercar.</p>
      <div className="grid grid-cols-5 gap-1 w-full">
        {SYSTEMS.map((sys) => (
          <button key={sys.id} type="button" onClick={() => setActiveSystem(sys.id)}
            className={`flex flex-col items-center gap-0.5 rounded-xl border py-2 text-[10px] font-semibold transition-colors ${
              activeSystem === sys.id ? 'border-primary bg-primary/10 text-primary' : 'border-border text-text-muted hover:text-text'
            }`}>
            <span className="text-lg">{sys.icon}</span>
            {sys.label}
          </button>
        ))}
      </div>
      <div className="w-full rounded-xl border border-border bg-surface p-4 text-sm text-text">
        {FACTS[subject.id][activeSystem]}
      </div>
      <button type="button" onClick={onStartQuiz} className="w-full rounded-xl bg-primary py-3 font-bold text-background">
        🧪 Poner a prueba lo que aprendí
      </button>
    </div>
  )
}

function QuizScreen({ onFinish }) {
  const [questions] = useState(() => [...QUIZ_POOL].sort(() => Math.random() - 0.5).slice(0, 6))
  const [round, setRound] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [locked, setLocked] = useState(false)
  const current = questions[round]

  const handleAnswer = (idx) => {
    if (locked) return
    const ok = idx === current.correct
    setFeedback(ok ? 'correct' : 'wrong')
    setLocked(true)
    if (ok) setCorrectCount((c) => c + 1)
    setTimeout(() => {
      const next = round + 1
      if (next >= questions.length) { onFinish(ok ? correctCount + 1 : correctCount, questions.length); return }
      setRound(next)
      setFeedback(null)
      setLocked(false)
    }, 700)
  }

  return (
    <div className="flex flex-col items-center gap-5 p-6 w-full max-w-md mx-auto">
      <p className="text-xs text-text-muted">Pregunta {round + 1}/{questions.length} · Aciertos: {correctCount}</p>
      <p className="text-base font-bold text-text text-center">{current.q}</p>
      <div className="flex flex-col gap-2 w-full">
        {current.options.map((opt, i) => (
          <button key={opt} type="button" disabled={locked} onClick={() => handleAnswer(i)}
            className={`rounded-xl border py-3 text-sm font-semibold transition-all active:scale-95 ${
              locked
                ? i === current.correct ? 'border-green-500 bg-green-500/20 text-green-300' : 'border-white/5 bg-white/5 text-white/30'
                : 'border-border bg-surface text-text hover:border-primary hover:bg-primary/10 hover:text-primary'
            }`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function ResultsScreen({ correctCount, total, onRestart }) {
  const earnCoins = useCurrencyStore((s) => s.earnCoins)
  const addXp = useLevelStore((s) => s.addXp)
  const pct = Math.round((correctCount / total) * 100)
  const coinsEarned = Math.round(180 * (correctCount / total))
  const xpEarned = Math.round(35 * (correctCount / total))

  useMemo(() => {
    if (coinsEarned > 0) earnCoins(coinsEarned)
    if (xpEarned > 0) addXp(xpEarned)
    // ponytail: useMemo como "solo una vez al montar" — mismo patrón que
    // otros juegos de esta sesión usan con useEffect([]), aquí es un cálculo
    // puro sin dependencias externas así que useMemo(fn, []) es equivalente
    // y evita un import extra de useEffect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col items-center gap-5 p-6 w-full max-w-sm mx-auto text-center">
      <span className="text-6xl">{pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '📖'}</span>
      <h2 className="text-lg font-black text-text">{correctCount}/{total} correctas</h2>
      <div className="flex gap-4 text-sm font-bold">
        <span className="text-amber-400">🪙 +{coinsEarned}</span>
        <span className="text-sky-300">+{xpEarned} XP</span>
      </div>
      <button type="button" onClick={onRestart} className="w-full rounded-xl bg-primary py-3 font-bold text-background">
        🔄 Explorar otra especie
      </button>
    </div>
  )
}

export default function BodyExplorerGame() {
  const [phase, setPhase] = useState('select') // select | explore | quiz | results
  const [subject, setSubject] = useState(null)
  const [results, setResults] = useState(null)

  return (
    <div className="flex min-h-full flex-col items-center justify-start bg-background py-4 overflow-y-auto">
      {phase === 'select' && (
        <SelectScreen onSelect={(s) => { setSubject(s); setPhase('explore') }} />
      )}
      {phase === 'explore' && subject && (
        <ExploreScreen subject={subject} onChangeSubject={() => setPhase('select')} onStartQuiz={() => setPhase('quiz')} />
      )}
      {phase === 'quiz' && (
        <QuizScreen onFinish={(correctCount, total) => { setResults({ correctCount, total }); setPhase('results') }} />
      )}
      {phase === 'results' && results && (
        <ResultsScreen correctCount={results.correctCount} total={results.total} onRestart={() => setPhase('select')} />
      )}
    </div>
  )
}
