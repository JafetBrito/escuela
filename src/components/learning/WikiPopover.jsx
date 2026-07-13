// Popover flotante del "segundo cerebro": aparece al pasar el mouse sobre un
// .wiki-link dentro de una clase, sin salir del curso. `rect` ya viene en
// coordenadas de viewport (getBoundingClientRect del link), así que position
// fixed no necesita portal — no hay ancestros con transform en este árbol.
const MAX_WIDTH = 360

export default function WikiPopover({ entry, rect, onMouseEnter, onMouseLeave }) {
  if (!entry || !rect) return null

  const left = Math.max(8, Math.min(rect.left, window.innerWidth - MAX_WIDTH - 16))
  const top = rect.bottom + 8

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ position: 'fixed', left, top, width: MAX_WIDTH, zIndex: 200 }}
      className="max-h-[60vh] overflow-y-auto rounded-xl border border-border bg-surface p-4 shadow-2xl"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xl">{entry.icon}</span>
        <div>
          <p className="text-sm font-bold text-text">{entry.term}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">{entry.category}</p>
        </div>
      </div>
      <div
        className="text-xs leading-relaxed text-text-muted [&_p]:mb-2 [&_strong]:font-semibold [&_strong]:text-text [&_em]:italic"
        dangerouslySetInnerHTML={{ __html: entry.content }}
      />
      <a
        href={`/cerebro/${entry.slug}`}
        target="_blank"
        rel="noopener"
        className="mt-2 inline-block text-[11px] font-semibold text-primary hover:underline"
      >
        Ver en Segundo Cerebro ↗
      </a>
    </div>
  )
}
