import { useEffect, useRef, useState } from 'react'
import { useProgressStore } from '../../stores/useProgressStore'

// Práctica de caracteres chinos — Academia de China. `module.hanziPractice =
// { characters: [{ hanzi, pinyin, meaning, mnemonicText, mnemonicSvg }] }` —
// todo texto plano, sin funciones (igual que terminalSim.pattern es string,
// no regex real: el contenido vive en Supabase como jsonb). mnemonicSvg es
// solo el nombre de archivo, resuelto contra
// /course-images/academia-china/mnemonics/<archivo>.
//
// Por cada carácter: mnemotecnia (SVG + texto + pinyin/significado) →
// trazo guiado (hanzi-writer anima el orden real) → quiz de memoria
// (hanzi-writer.quiz(), dibujar sin ayuda) → siguiente carácter. Al superar
// el quiz del último carácter se llama completeMission una sola vez, igual
// que GitTerminalSim con su último checkpoint.
//
// hanzi-writer se importa dinámico (no arriba del archivo) para que su JS
// solo entre al bundle cuando alguien abre un módulo con hanziPractice — el
// resto de los cursos no crecen de peso por esto. Los datos de trazos NO se
// cargan del CDN por defecto de la librería: se auto-hospedan en
// public/hanzi-data/<codepoint-hex>.json (ver CREDITS.txt ahí) para no
// depender de un tercero en producción.
function charDataLoader(char, onLoad, onError) {
  const hex = char.codePointAt(0).toString(16)
  fetch(`/hanzi-data/${hex}.json`)
    .then((r) => {
      if (!r.ok) throw new Error(`Sin datos de trazos para ${char}`)
      return r.json()
    })
    .then(onLoad)
    .catch(onError)
}

const WRITER_SIZE = 240
const MISSION_ID = 'hanzi'

export default function HanziPractice({ courseId, module, className = '' }) {
  const practice = module.hanziPractice
  const isCompleted = useProgressStore((s) => s.isMissionDone(courseId, module.id, MISSION_ID))
  const completeMission = useProgressStore((s) => s.completeMission)

  const [charIndex, setCharIndex] = useState(0)
  const [phase, setPhase] = useState('mnemonic') // 'mnemonic' | 'trace' | 'quiz'
  const [quizResult, setQuizResult] = useState(null) // { totalMistakes } una vez terminado el quiz
  const targetRef = useRef(null)

  const characters = practice?.characters ?? []
  const current = characters[charIndex]
  const isLastChar = charIndex === characters.length - 1

  // Monta/desmonta hanzi-writer en el div de destino cada vez que cambia el
  // carácter o la fase — la librería dibuja su propio SVG dentro del div
  // (a diferencia de GitTerminalSim, que es JSX puro), así que hay que
  // limpiar el contenido a mano al desmontar/cambiar.
  useEffect(() => {
    if ((phase !== 'trace' && phase !== 'quiz') || !current) return
    let cancelled = false
    const node = targetRef.current
    import('hanzi-writer').then(({ default: HanziWriter }) => {
      if (cancelled || !node) return
      const writer = HanziWriter.create(node, current.hanzi, {
        width: WRITER_SIZE,
        height: WRITER_SIZE,
        padding: 12,
        showOutline: true,
        charDataLoader,
      })
      if (phase === 'trace') {
        writer.animateCharacter()
      } else {
        writer.quiz({
          onComplete: ({ totalMistakes }) => setQuizResult({ totalMistakes }),
        })
      }
    })
    return () => {
      cancelled = true
      if (node) node.innerHTML = ''
    }
  }, [phase, charIndex, current])

  if (!practice || characters.length === 0) return null

  if (isCompleted) {
    return (
      <div className={`rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-center ${className}`}>
        <p className="text-sm font-bold text-emerald-400">✅ Ya completaste la práctica de caracteres de esta clase.</p>
      </div>
    )
  }

  const goToNextCharacter = () => {
    if (isLastChar) {
      completeMission(courseId, module.id, MISSION_ID)
      return
    }
    setCharIndex((i) => i + 1)
    setPhase('mnemonic')
    setQuizResult(null)
  }

  return (
    <div className={`rounded-2xl border border-border bg-surface p-4 ${className}`}>
      <p className="mb-3 text-xs font-black uppercase tracking-wide text-text-muted">
        ✍️ Práctica de caracteres ({charIndex + 1}/{characters.length})
      </p>

      {phase === 'mnemonic' && (
        <div className="flex flex-col items-center gap-3 text-center">
          <img
            src={`/course-images/academia-china/mnemonics/${current.mnemonicSvg}`}
            alt={current.meaning}
            className="h-32 w-32"
          />
          <div>
            <p className="text-5xl font-black text-text">{current.hanzi}</p>
            <p className="mt-1 text-sm font-bold text-primary">{current.pinyin} · {current.meaning}</p>
          </div>
          {current.mnemonicText && (
            <p className="max-w-sm text-sm leading-relaxed text-text-muted">{current.mnemonicText}</p>
          )}
          <button
            type="button"
            onClick={() => setPhase('trace')}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background hover:opacity-90"
          >
            ✍️ Practicar trazos
          </button>
        </div>
      )}

      {phase === 'trace' && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-text-muted">Mira cómo se traza {current.hanzi}.</p>
          <div ref={targetRef} className="mx-auto rounded-xl border border-border" style={{ width: WRITER_SIZE, height: WRITER_SIZE }} />
          <button
            type="button"
            onClick={() => setPhase('quiz')}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background hover:opacity-90"
          >
            Ya lo vi, quiero intentarlo de memoria →
          </button>
        </div>
      )}

      {phase === 'quiz' && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-text-muted">Dibuja {current.hanzi} de memoria.</p>
          <div ref={targetRef} className="mx-auto rounded-xl border border-border" style={{ width: WRITER_SIZE, height: WRITER_SIZE }} />
          {quizResult && (
            <>
              <p className="text-sm font-bold text-emerald-400">
                {quizResult.totalMistakes === 0 ? '¡Perfecto, sin errores!' : `¡Completado! (${quizResult.totalMistakes} correcciones)`}
              </p>
              <button
                type="button"
                onClick={goToNextCharacter}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-white hover:opacity-90"
              >
                {isLastChar ? '🎉 Terminar práctica' : 'Siguiente carácter →'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
