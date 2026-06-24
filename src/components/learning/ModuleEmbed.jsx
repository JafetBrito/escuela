// Slot for an embedded HTML mini-app (e.g. a small app built together with
// Claude during class). Rendered as a sandboxed iframe via `srcDoc` rather
// than dangerouslySetInnerHTML, so embedded markup/scripts can't reach the
// rest of the app's DOM or state. Shows a "coming soon" placeholder until
// `module.embedHtml` is filled in.
export default function ModuleEmbed({ html, className = '', aspectClassName = 'aspect-video' }) {
  if (!html) {
    return (
      <div
        className={`flex aspect-video flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface text-center ${className}`}
      >
        <span className="text-3xl">🔧</span>
        <p className="text-sm font-semibold text-text-muted">Próximamente: aquí construiremos juntos una app con Claude</p>
      </div>
    )
  }

  return (
    <div className={`overflow-hidden rounded-xl border border-border bg-white ${className}`}>
      <iframe
        srcDoc={html}
        sandbox="allow-scripts"
        className={`w-full ${aspectClassName}`}
        title="App embebida"
      />
    </div>
  )
}
