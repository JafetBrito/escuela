import { useState } from 'react'

// Panel que aparece al hacer clic en un subrayado ya existente — comentario
// (opcional), quitar, o importar a Notas. Mismo lenguaje visual que
// TextSelectionMenu.jsx (panel oscuro flotante), pero con su propio estado
// (no comparte componente porque este no depende de una selección de texto
// viva, sino de un <mark> ya en el DOM).
export default function HighlightPopover({ highlight, position, onSave, onDelete, onImportToNotes, onClose }) {
  const [comment, setComment] = useState(highlight.comment ?? '')
  const [saved, setSaved] = useState(false)
  const [imported, setImported] = useState(false)

  if (!highlight || !position) return null

  const handleSave = () => {
    onSave(comment.trim() || null)
    setSaved(true)
    setTimeout(() => setSaved(false), 1400)
  }

  const handleImport = () => {
    onImportToNotes()
    setImported(true)
    setTimeout(onClose, 1200)
  }

  return (
    <div
      className="pointer-events-auto fixed z-[10000] w-72 rounded-2xl border border-white/10 bg-zinc-900/96 p-3 shadow-2xl backdrop-blur-md"
      style={{ left: position.x, top: position.y, transform: 'translate(-50%, 8px)' }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <p className="mb-2 line-clamp-2 text-xs italic text-zinc-400">“{highlight.quote}”</p>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Agregar un comentario (opcional)…"
        rows={2}
        className="mb-2 w-full resize-none rounded-lg border border-white/10 bg-white/5 p-2 text-xs text-zinc-200 outline-none focus:border-primary"
      />

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={handleSave}
          className={`flex-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all ${
            saved ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-zinc-200 hover:bg-white/20'
          }`}
        >
          {saved ? '✅ Guardado' : '💾 Guardar'}
        </button>
        <button
          type="button"
          onClick={handleImport}
          className={`flex-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all ${
            imported ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-zinc-200 hover:bg-white/20'
          }`}
        >
          {imported ? '✅ Importado' : '📝 A mis notas'}
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex-1 rounded-lg bg-red-500/10 px-2.5 py-1.5 text-xs font-bold text-red-300 transition-all hover:bg-red-500/20"
        >
          🗑️ Quitar
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-2.5 py-1.5 text-xs text-zinc-500 transition-all hover:bg-white/10 hover:text-zinc-300"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
