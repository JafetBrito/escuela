import { useState, useEffect, useRef, useCallback } from 'react'
import { useInventoryStore } from '../../stores/useInventoryStore'
import { useMascotCompanionStore } from '../../stores/useMascotCompanionStore'

const LANGS = [
  { code: 'es-ES', label: 'ES', name: 'Español' },
  { code: 'en-US', label: 'EN', name: 'English' },
  { code: 'fr-FR', label: 'FR', name: 'Français' },
  { code: 'it-IT', label: 'IT', name: 'Italiano' },
  { code: 'ca-ES', label: 'CA', name: 'Català' },
  { code: 'eu-ES', label: 'EU', name: 'Euskara' },
]

function getSavedLangIdx() {
  try { return parseInt(localStorage.getItem('selMenuLang') ?? '0', 10) || 0 } catch { return 0 }
}

export default function TextSelectionMenu() {
  const addItem = useInventoryStore((s) => s.addItem)
  const setOpen = useMascotCompanionStore((s) => s.setOpen)
  const setPanel = useMascotCompanionStore((s) => s.setPanel)
  const setChatPrefill = useMascotCompanionStore((s) => s.setChatPrefill)
  const menuRef = useRef()

  const [sel, setSel] = useState(null)
  const [langIdx, setLangIdx] = useState(getSavedLangIdx)
  const [reading, setReading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [translation, setTranslation] = useState(null)
  const [translating, setTranslating] = useState(false)

  const hide = useCallback(() => {
    window.speechSynthesis?.cancel()
    setReading(false)
    setSaved(false)
    setCopied(false)
    setTranslation(null)
    setTranslating(false)
    setSel(null)
  }, [])

  // Shared logic: given text + screen-absolute position, show the menu
  const showForSelection = useCallback((text, x, y) => {
    if (!text || text.length < 2) { hide(); return }
    setSel({ text, x, y })
    setSaved(false)
    setCopied(false)
    setTranslation(null)
    setTranslating(false)
  }, [hide])

  // ── Main document listener ──────────────────────────────────────────────
  useEffect(() => {
    const onMouseUp = (e) => {
      if (menuRef.current?.contains(e.target)) return
      const selection = window.getSelection()
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) { hide(); return }
      const text = selection.toString().trim()
      const rect = selection.getRangeAt(0).getBoundingClientRect()
      showForSelection(text, rect.left + rect.width / 2, rect.top)
    }
    const onKeyDown = (e) => { if (e.key === 'Escape') hide() }
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [hide, showForSelection])

  // ── Same-origin iframe listeners (epub reader) ──────────────────────────
  // PDF iframes (browser plugin) are cross-origin → the try/catch skips them.
  useEffect(() => {
    const attachToFrame = (frame) => {
      // Called each time the iframe loads a new document (epub chapter navigation)
      const onLoad = () => {
        try {
          const doc = frame.contentDocument
          if (!doc || doc.__selMenuAttached) return
          doc.__selMenuAttached = true

          doc.addEventListener('mouseup', () => {
            const selection = doc.getSelection()
            if (!selection || selection.isCollapsed || selection.rangeCount === 0) { hide(); return }
            const text = selection.toString().trim()
            const selRect = selection.getRangeAt(0).getBoundingClientRect()
            const frameRect = frame.getBoundingClientRect()
            showForSelection(
              text,
              frameRect.left + selRect.left + selRect.width / 2,
              frameRect.top + selRect.top,
            )
          })
          doc.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide() })
        } catch {
          // Cross-origin iframe (e.g. native PDF viewer) — skip silently
        }
      }
      frame.addEventListener('load', onLoad)
      onLoad() // also try immediately if already loaded
    }

    // Attach to iframes that already exist
    document.querySelectorAll('iframe').forEach(attachToFrame)

    // Watch for iframes added later (epub reader mounts after the app boots)
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.tagName === 'IFRAME') attachToFrame(node)
          else if (node.querySelectorAll) node.querySelectorAll('iframe').forEach(attachToFrame)
        }
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [hide, showForSelection])

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
    setTranslation(null)
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

  const askMascot = () => {
    setChatPrefill(sel.text)
    setPanel('mascota-chat')
    setOpen(true)
    hide()
  }

  const translate = async () => {
    if (translating) return
    setTranslating(true)
    setTranslation(null)
    const targetLang = LANGS[langIdx].code.slice(0, 2)
    try {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sel.text)}&langpair=auto|${targetLang}`
      )
      const data = await res.json()
      const t = data?.responseData?.translatedText
      setTranslation(t && t !== sel.text ? t : '(sin traducción)')
    } catch {
      setTranslation('error')
    } finally {
      setTranslating(false)
    }
  }

  if (!sel) return null

  const menuBelow = sel.y < 72
  const top = menuBelow ? sel.y + 30 : sel.y - 6

  return (
    <div
      ref={menuRef}
      className="pointer-events-auto fixed z-[10000] flex flex-col items-center"
      style={{
        left: sel.x,
        top,
        transform: `translate(-50%, ${menuBelow ? '0%' : '-100%'})`,
      }}
    >
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

        {/* Selector de idioma */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={cycleLang}
          title={`Idioma: ${LANGS[langIdx].name} — clic para cambiar`}
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

        {/* Pregúntale a tu mascota */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={askMascot}
          title="Pregúntale a tu mascota"
          className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold text-zinc-300 transition-all hover:bg-white/10 hover:text-white"
        >
          <span className="text-sm">🐾</span>
          <span>Tu mascota</span>
        </button>

        <div className="mx-0.5 h-4 w-px bg-white/10" />

        {/* Traducir */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={translate}
          title={`Traducir al ${LANGS[langIdx].name}`}
          className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all
            ${translating
              ? 'animate-pulse text-sky-400'
              : translation
                ? 'bg-sky-500/15 text-sky-400'
                : 'text-zinc-300 hover:bg-white/10 hover:text-white'
            }`}
        >
          <span className="text-sm">🌐</span>
          <span>Traducir</span>
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

      {/* ── Translation result panel ── */}
      {(translating || translation) && (
        <div
          onMouseDown={(e) => e.preventDefault()}
          className="mt-1 w-full max-w-xs rounded-xl border border-sky-500/20 bg-zinc-900/96 px-3 py-2 text-xs text-zinc-300 shadow-xl backdrop-blur-md"
        >
          {translating
            ? <span className="animate-pulse text-sky-400/70">Traduciendo…</span>
            : translation === 'error'
              ? <span className="text-red-400">No se pudo traducir</span>
              : <span>{translation}</span>
          }
        </div>
      )}

      {!menuBelow && (
        <div className="h-0 w-0 border-x-[5px] border-x-transparent border-t-[6px] border-t-zinc-900" />
      )}
    </div>
  )
}
