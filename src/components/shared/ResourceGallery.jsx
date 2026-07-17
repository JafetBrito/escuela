// Galería de recursos {label, url, type} — clasifica en imagen/pdf/link y
// renderiza cada grupo apropiadamente (grid de miniaturas / iframe de PDF /
// lista de links). Extraído de HubContent.jsx para reutilizarse también en
// Proyectos (ver ProjectDetailPage.jsx).
export function resourceKind(r) {
  if (r.type === 'pdf') return 'pdf'
  if (r.type === 'image' || /\.(png|jpe?g|gif|webp)(\?|$)/i.test(r.url)) return 'image'
  return 'link'
}

export default function ResourceGallery({ resources }) {
  const images = resources.filter((r) => resourceKind(r) === 'image')
  const pdfs    = resources.filter((r) => resourceKind(r) === 'pdf')
  const links   = resources.filter((r) => resourceKind(r) === 'link')

  if (images.length === 0 && pdfs.length === 0 && links.length === 0) return null

  return (
    <div>
      {images.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-2">
          {images.map((r, i) => (
            <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="group block overflow-hidden rounded-lg border border-border">
              <img src={r.url} alt={r.label} className="h-20 w-full object-cover transition group-hover:opacity-80" />
            </a>
          ))}
        </div>
      )}

      {pdfs.map((r, i) => (
        <div key={i} className="mb-3 overflow-hidden rounded-xl border border-border last:mb-0">
          <div className="flex items-center justify-between border-b border-border bg-surface-hover px-3 py-1.5">
            <p className="text-xs font-semibold text-text">📄 {r.label}</p>
            <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-primary hover:underline">Abrir ↗</a>
          </div>
          <iframe src={r.url} title={r.label} className="h-56 w-full bg-white" />
        </div>
      ))}

      {links.length > 0 && (
        <div className="space-y-1.5">
          {links.map((r, i) => (
            <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm text-primary hover:bg-surface-hover">
              🔗 {r.label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
