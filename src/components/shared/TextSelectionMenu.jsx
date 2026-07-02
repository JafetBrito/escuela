import { useState, useEffect, useRef, useCallback } from 'react'
import { useInventoryStore } from '../../stores/useInventoryStore'

const LANGS = [
  { code: 'es-ES', label: 'ES', name: 'Español' },
  { code: 'en-US', label: 'EN', name: 'English' },
  { code: 'fr-FR', label: 'FR', name: 'Français' },
  { code: 'it-IT', label: 'IT', name: 'Italiano' },
  { code: 'ca-ES', label: 'CA', name: 'Català' },
  { code: 'eu-ES', label: 'EU', name: 'Euskara' },
]

// Persists chosen TTS language across sessions
function getSavedLangIdx() {
  try { return parseInt(localStorage.getItem('selMenuLang') ?? '0', 10) || 0 } catch { return 0 }
}

export default function TextSelectionMenu() {
  const addItem = useInventoryStore((s) => s.addItem)
  const menuRef = useRef()

  const [sel, setSel] = useState(null)      // { text, x, y }
  const [langIdx, setLangIdx] = useState(getSavedLangIdx)
  const [reading, setReading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  const hide = useCallback(() => {
    window.speechSynthesis?.cancel()
    setReading(false)
    setSaved(false)
    setCopied(false)
    setSel(null)
  }, [])

  useEffect(() => {
    const onMouseUp = (e) => {
      // Ignore clicks inside our own menu
      if (menuRef.current?.contains(e.target)) return

      const selection = window.getSelection()
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        hide()
        return
      }
      const text = selection.toString().trim()
      if (text.length < 2) { hide(); return }

      const rect = selection.getRangeAt(0).getBoundingClientRect()
      setSel({ text, x: rect.left + rect.width / 2, y: rect.top })
      setSaved(false)
      setCopied(false)
    }

    const onKeyDown = (e) => { if (e.key === 'Escape') hide() }

    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [hide])

  // Stop reading when menu closes
  useEffect(() => { if (!sel) window.speechSynthesis?.cancel() }, [sel])

  const speak = () => {
    const synth = window.speechSynthesis
    if (reading) { synth.cancel(); setReading(false); return }
    synth.cancel()
    const utt = new SpeechSynthesisUtterance(sel.text)
    utt.lang = LANGS[langIdx].code
    utt.onend = () => setReading(false)
    utt.onerror = () => setReading(false)
    setReading(true)
    synth.speak(utt)
  }

  const cycleLang = () => {
    const next = (langIdx + 1) % LANGS.length
    setLangIdx(next)
    try { localStorage.setItem('selMenuLang', String(next)) } catch {}
    if (reading) { window.speechSynthesis?.cancel(); setReading(false) }
  }

  const copy = () => {
    navigator.clipboard?.writeText(sel.text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const saveNote = () => {
    addItem({ type: 'note', text: `"${sel.text}"` })
    setSaved(true)
    setTimeout(hide, 1400)
  }

  const search = () => {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(sel.text)}`, '_blank', 'noopener')
  }

  if (!sel) return null

  // Position: above selection normally, below if too close to top of viewport
  const menuBelow = sel.y < 72
  const top = menuBelow ? sel.y + 30 : sel.y - 6

  return (
    <div
      ref={menuRef}
      className="pointer-events-auto fixed z-[9999] flex flex-col items-center"
      style={{
        left: sel.x,
        top,
        transform: `translate(-50%, ${menuBelow ? '0%' : '-100%'})`,
      }}
    >
      {/* Up-arrow (when menu appears below the selection) */}
      {menuBelow && (
        <div className="h-0 w-0 border-x-[5px] border-x-transparent border-b-[6px] border-b-zinc-900" />
      )}

      {/* ── Main toolbar ── */}
      <div className="flex items-center gap-0.5 rounded-2xl border border-white/10 bg-zinc-900/96 px-1.5 py-1.5 shadow-2xl backdrop-blur-md">

        {/* Leer en voz alta */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={speak}
          title={reading ? 'Detener lectura' : `Leer en voz alta (${LANGS[langIdx].name})`}
          className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all
            ${reading
              ? 'animate-pulse bg-amber-500/20 text-amber-400'
              : 'text-zinc-300 hover:bg-white/10 hover:text-white'
            }`}
        >
          <span className="text-sm">{reading ? '⏹' : '🔊'}</span>
          <span>{reading ? 'Parar' : 'Leer'}</span>
        </button>

        {/* Selector de idioma (cicla entre las 6 opciones) */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={cycleLang}
          title={`Idioma de lectura: ${LANGS[langIdx].name} — clic para cambiar`}
          className="min-w-[2rem] rounded-xl border border-white/10 bg-white/5 px-2 py-1.5 text-[10px] font-black text-zinc-400 transition-all hover:bg-white/10 hover:text-white"
        >
          {LANGS[langIdx].label}
        </button>

        <div className="mx-0.5 h-4 w-px bg-white/10" />

        {/* Guardar en notas */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={saveNote}
          title="Guardar en mis notas"
          className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all
            ${saved
              ? 'bg-green-500/20 text-green-400'
              : 'text-zinc-300 hover:bg-white/10 hover:text-white'
            }`}
        >
          <span className="text-sm">{saved ? '✅' : '📝'}</span>
          <span>{saved ? '¡Guardado!' : 'Notas'}</span>
        </button>

        <div className="mx-0.5 h-4 w-px bg-white/10" />

        {/* Copiar */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={copy}
          title="Copiar al portapapeles"
          className={`flex items-center gap-1 rounded-xl px-2 py-1.5 text-xs transition-all
            ${copied ? 'text-primary' : 'text-zinc-400 hover:bg-white/10 hover:text-white'}`}
        >
          <span className="text-sm">{copied ? '✓' : '📋'}</span>
        </button>

        {/* Buscar en Google */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={search}
          title="Buscar en Google"
          className="rounded-xl px-2 py-1.5 text-xs text-zinc-400 transition-all hover:bg-white/10 hover:text-white"
        >
          <span className="text-sm">🔍</span>
        </button>

        <div className="mx-0.5 h-4 w-px bg-white/10" />

        {/* Cerrar */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={hide}
          title="Cerrar (Esc)"
          className="rounded-xl px-2 py-1.5 text-xs text-zinc-600 transition-all hover:bg-white/10 hover:text-zinc-400"
        >
          ✕
        </button>
      </div>

      {/* Down-arrow (when menu appears above the selection) */}
      {!menuBelow && (
        <div className="h-0 w-0 border-x-[5px] border-x-transparent border-t-[6px] border-t-zinc-900" />
      )}
    </div>
  )
}
