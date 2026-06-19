import { getJanulusLevels } from '../../../data/matrixData'

const PLACEHOLDER = [
  { level: 3, name: 'Sin Emojis' },
  { level: 4, name: 'Frases Largas' },
  { level: 5, name: 'Modo Nativo' },
]

export default function JanulingoMap({ lang, langName, langFlag, onPlay, onBack }) {
  const real = getJanulusLevels(lang).map((l) => ({ ...l, locked: false }))
  const fill = PLACEHOLDER.slice(0, Math.max(0, 5 - real.length)).map((p) => ({ ...p, locked: true }))
  const all  = [...real, ...fill]

  return (
    <div className="flex h-full flex-col bg-background text-text">
      <div className="flex items-center border-b border-border bg-surface px-4 py-3">
        <button type="button" onClick={onBack}
          className="text-sm text-text-muted transition-colors hover:text-text">
          ← Idiomas
        </button>
        <div className="flex flex-1 items-center justify-center gap-2">
          <span className="text-lg">{langFlag}</span>
          <span className="font-bold">{langName}</span>
        </div>
        <span className="w-16" aria-hidden="true" />
      </div>

      <div className="flex-1 overflow-auto py-6">
        <p className="mb-8 text-center text-[10px] font-bold uppercase tracking-widest text-text-muted/50">
          Mapa de Niveles
        </p>

        {/* Zigzag path */}
        <div className="relative mx-auto flex max-w-xs flex-col items-center gap-0">
          {/* Vertical connector line */}
          <div className="pointer-events-none absolute left-1/2 top-8 h-[calc(100%-4rem)] w-px -translate-x-1/2 bg-border/25" />

          {all.map((l, i) => (
            <div
              key={l.level}
              className={`relative z-10 flex flex-col items-center gap-1.5 py-5
                transform ${i % 2 === 0 ? '-translate-x-16' : 'translate-x-16'}`}
            >
              <button
                type="button"
                onClick={() => !l.locked && onPlay(l.level)}
                disabled={l.locked}
                className={`flex h-16 w-16 items-center justify-center rounded-full border-4 text-2xl font-black shadow-lg transition-all
                  ${l.locked
                    ? 'cursor-not-allowed border-border/40 bg-surface/50 text-text-muted/30'
                    : 'cursor-pointer border-primary bg-primary/15 text-primary hover:scale-110 hover:bg-primary/25 active:scale-100 active:shadow-none'
                  }`}
              >
                {l.locked ? '🔒' : l.level}
              </button>
              <span className={`text-xs font-semibold ${l.locked ? 'text-text-muted/30' : 'text-text-muted'}`}>
                {l.locked ? '???' : l.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
