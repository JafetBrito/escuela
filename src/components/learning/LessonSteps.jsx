import { useState } from 'react'

// Navegación de una clase EN PASOS horizontales (video → lección → actividad
// → recursos), en vez de todo apilado y dependiendo de que el alumno haga
// scroll hacia abajo por su cuenta. Pedido explícito tras ver que la gente
// miraba el video y se iba, sin bajar a ver el resto — con pasos, cada
// sección se ve completa, una a la vez, con un botón claro para avanzar.
//
// `steps`: [{ id, label, icon, render: () => JSX }] — ya filtrados por el
// caller (solo los pasos que ese módulo realmente tiene). `onFinishLabel`/
// `onFinish` reemplazan el botón "Siguiente" del ÚLTIMO paso, para que ahí
// mismo se pueda saltar a la siguiente CLASE (LearningInterface.jsx ya tenía
// esa navegación; aquí solo se le da su lugar al final del último paso, sin
// duplicar el botón). `finishExtra` es contenido opcional (ej.
// LessonReflectionBox) que se muestra justo arriba del botón de "terminar",
// solo en el último paso — puramente decorativo desde el punto de vista de
// este componente, nunca gatea onFinish.
export default function LessonSteps({ steps, onFinish, onFinishLabel = 'Siguiente clase →', finishExtra = null }) {
  // Arranca siempre en el primer paso — el caller monta este componente con
  // key={módulo.id}, así que al cambiar de clase React lo desmonta y vuelve
  // a montar entero, sin heredar "iba en el paso 3" de la clase anterior.
  const [stepIndex, setStepIndex] = useState(0)

  if (steps.length === 0) return null
  const clampedIndex = Math.min(stepIndex, steps.length - 1)
  const current = steps[clampedIndex]
  const isLast = clampedIndex === steps.length - 1

  return (
    <div className="flex flex-col gap-4">
      {/* Indicador de pasos — también sirve para saltar directo a un paso ya
          visto (no hacia adelante, para no perderse el video/texto sin ver). */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {steps.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => i <= clampedIndex && setStepIndex(i)}
            disabled={i > clampedIndex}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
              i === clampedIndex
                ? 'bg-primary text-background'
                : i < clampedIndex
                  ? 'border border-primary/40 text-primary hover:bg-primary/10'
                  : 'cursor-not-allowed border border-border text-text-muted/50'
            }`}
          >
            <span>{s.icon}</span>
            {s.label}
            {i < clampedIndex && <span className="text-[10px]">✓</span>}
          </button>
        ))}
      </div>

      <div key={current.id} className="module-enter">
        {current.render()}
      </div>

      {isLast && finishExtra}

      <div className="flex items-center justify-between gap-3">
        {clampedIndex > 0 ? (
          <button
            type="button"
            onClick={() => setStepIndex((i) => i - 1)}
            className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
          >
            ← Paso anterior
          </button>
        ) : <span />}

        {isLast ? (
          onFinish && (
            <button
              type="button"
              onClick={onFinish}
              className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-background transition-transform hover:scale-105 active:scale-95"
            >
              {onFinishLabel}
            </button>
          )
        ) : (
          <button
            type="button"
            onClick={() => setStepIndex((i) => i + 1)}
            className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-background transition-transform hover:scale-105 active:scale-95"
          >
            Siguiente: {steps[clampedIndex + 1].label} →
          </button>
        )}
      </div>
    </div>
  )
}
