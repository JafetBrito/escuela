import { useEffect, useRef, useState } from 'react'
import { getGlossaryEntry } from '../../data/glossaryRegistry'
import { useI18n } from '../../i18n'
import WikiPopover from './WikiPopover'

// Mismo mapeo de idioma → voz que TextSelectionMenu.jsx (leer texto
// seleccionado) — aquí se deriva automáticamente del idioma actual del sitio
// en vez de tener su propio selector, porque el contenido de la clase ya
// viene traducido a ese idioma (ver courseTranslations.js).
const TTS_LANG_MAP = { es: 'es-ES', en: 'en-US', fr: 'fr-FR', it: 'it-IT', ca: 'ca-ES', de: 'de-DE', ja: 'ja-JP', hi: 'hi-IN' }

// El HTML de una clase mezcla párrafos, listas y cajas .tip/.warn/.example
// con bloques <pre><code> de código — se descarta el código (nadie quiere
// escuchar una snippet leída letra por letra) y el resto se aplana a texto
// plano, después se corta en oraciones de ~200 caracteres para encolar
// utterances cortas: así "Detener" corta casi al instante en vez de esperar
// a que termine un solo utterance gigante, y evita el límite silencioso que
// algunos navegadores imponen a utterances muy largos.
function getReadableChunks(html) {
  const div = document.createElement('div')
  // Un espacio tras cada bloque ANTES de parsear — si no, textContent pega
  // "TítuloPárrafo" sin separación al saltar de un </h2> a un <p>, porque el
  // DOM no inserta espacio en los límites de elementos por su cuenta.
  div.innerHTML = html.replace(/<\/(h1|h2|h3|h4|p|li|div|blockquote|tr|td|th)>/gi, '</$1> ')
  div.querySelectorAll('pre, code').forEach((el) => el.remove())
  const text = (div.textContent || '').replace(/\s+/g, ' ').trim()
  if (!text) return []
  const sentences = text.match(/[^.!?]+[.!?]+|\S+$/g) || [text]
  const chunks = []
  let current = ''
  for (const s of sentences) {
    if (current && (current + s).length > 200) { chunks.push(current.trim()); current = '' }
    current += s
  }
  if (current.trim()) chunks.push(current.trim())
  return chunks
}

// Renders a rich-text lesson from dangerouslySetInnerHTML.
// Content is written by us (trusted), never from user input.
//
// Hover sobre un .wiki-link (ver glossaryRegistry.js) muestra un popover con
// la entrada del "segundo cerebro" sin salir del curso — event delegation
// sobre el contenedor porque el HTML es dangerouslySetInnerHTML, no JSX.
export default function TextLesson({ content, className = '' }) {
  const { lang } = useI18n()
  const [hover, setHover] = useState(null) // { entry, rect }
  const [reading, setReading] = useState(false)
  const hideTimer = useRef(null)
  const chunksRef = useRef([])
  const chunkIndexRef = useRef(0)
  // Incrementa en cada start/stop/cambio de contenido — cualquier callback
  // onend/onerror que dispare para una sesión vieja se descarta en vez de
  // seguir la cola. Sin esto, si el alumno da clic en "Leer" más de una vez
  // seguida (o cambia de clase a medio leer), los onend de la lectura
  // anterior seguían llamando a speakNextChunk() con el índice/chunks YA
  // reemplazados por la lectura nueva — la voz terminaba leyendo una mezcla
  // de ambas, empezando de cualquier punto menos el principio.
  const sessionRef = useRef(0)

  // Si el alumno cambia de clase (o sale de la página) a media lectura, la
  // voz no debe seguir hablando del contenido anterior.
  useEffect(() => {
    sessionRef.current += 1
    window.speechSynthesis?.cancel()
    setReading(false)
  }, [content])

  if (!content) return null

  const stopReading = () => {
    sessionRef.current += 1
    window.speechSynthesis?.cancel()
    setReading(false)
  }

  const speakChunk = (session) => {
    if (session !== sessionRef.current) return
    const chunks = chunksRef.current
    const i = chunkIndexRef.current
    if (i >= chunks.length) { setReading(false); return }
    const utt = new SpeechSynthesisUtterance(chunks[i])
    utt.lang = TTS_LANG_MAP[lang] ?? 'es-ES'
    utt.rate = 0.95
    const advance = () => {
      if (session !== sessionRef.current) return
      chunkIndexRef.current += 1
      speakChunk(session)
    }
    utt.onend = advance
    utt.onerror = advance
    window.speechSynthesis.speak(utt)
  }

  const startReading = () => {
    if (!window.speechSynthesis) return
    sessionRef.current += 1
    const session = sessionRef.current
    chunksRef.current = getReadableChunks(content)
    chunkIndexRef.current = 0
    if (chunksRef.current.length === 0) return
    setReading(true)
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      // Ya había algo hablando (sesión anterior) — cancel()+speak() en el
      // mismo tick es una carrera conocida en Chrome/Android (mismo problema
      // documentado en utils/tts.js), así que se le da un respiro al motor.
      window.speechSynthesis.cancel()
      setTimeout(() => speakChunk(session), 60)
    } else {
      speakChunk(session)
    }
  }

  const toggleReading = () => (reading ? stopReading() : startReading())

  const cancelHide = () => clearTimeout(hideTimer.current)
  const scheduleHide = () => {
    hideTimer.current = setTimeout(() => setHover(null), 150)
  }

  const handleMouseOver = (e) => {
    const link = e.target.closest('a.wiki-link')
    if (!link) return
    const slug = link.getAttribute('href')?.split('/cerebro/')[1]
    const entry = slug && getGlossaryEntry(slug)
    if (!entry) return
    cancelHide()
    setHover({ entry, rect: link.getBoundingClientRect() })
  }

  const handleMouseOut = (e) => {
    if (e.target.closest('a.wiki-link')) scheduleHide()
  }

  return (
    <div onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
      <button
        type="button"
        onClick={toggleReading}
        className={`mb-3 flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all
          ${reading
            ? 'animate-pulse border-amber-500/40 bg-amber-500/10 text-amber-400'
            : 'border-border bg-surface text-text hover:border-primary/40 hover:text-primary'
          }`}
      >
        <span className="text-base">{reading ? '⏹' : '🔊'}</span>
        <span>{reading ? 'Detener lectura' : 'Leer esta clase en voz alta'}</span>
      </button>
      <div
        className={`rounded-xl border border-border bg-surface px-6 py-5 text-text
          [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-primary first:[&_h2]:mt-0
          [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-text
          [&_p]:mb-3 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-text-muted
          [&_ul]:mb-3 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:text-sm [&_ul]:text-text-muted
          [&_ol]:mb-3 [&_ol]:ml-5 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:text-sm [&_ol]:text-text-muted
          [&_li]:leading-relaxed
          [&_strong]:font-semibold [&_strong]:text-text
          [&_code]:rounded [&_code]:bg-black/40 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:text-emerald-400
          [&_pre]:mb-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-emerald-900/40 [&_pre]:bg-black/60 [&_pre]:p-4
          [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-sm [&_pre_code]:text-emerald-300
          [&_blockquote]:mb-3 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:text-sm [&_blockquote]:italic [&_blockquote]:text-text-muted
          [&_.tip]:mb-3 [&_.tip]:rounded-xl [&_.tip]:border [&_.tip]:border-blue-500/30 [&_.tip]:bg-blue-900/20 [&_.tip]:p-4 [&_.tip]:text-sm [&_.tip]:text-blue-300
          [&_.warn]:mb-3 [&_.warn]:rounded-xl [&_.warn]:border [&_.warn]:border-yellow-500/30 [&_.warn]:bg-yellow-900/20 [&_.warn]:p-4 [&_.warn]:text-sm [&_.warn]:text-yellow-300
          [&_.example]:mb-3 [&_.example]:rounded-xl [&_.example]:border [&_.example]:border-violet-500/30 [&_.example]:bg-violet-900/20 [&_.example]:p-4 [&_.example]:text-sm [&_.example]:text-violet-200
          [&_.bad]:mb-3 [&_.bad]:rounded-xl [&_.bad]:border [&_.bad]:border-red-500/30 [&_.bad]:bg-red-900/20 [&_.bad]:p-4 [&_.bad]:text-sm [&_.bad]:text-red-200
          [&_.wiki-link]:font-semibold [&_.wiki-link]:text-primary [&_.wiki-link]:underline [&_.wiki-link]:decoration-dotted [&_.wiki-link]:underline-offset-2 [&_.wiki-link]:hover:opacity-80
          ${className}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      <WikiPopover
        entry={hover?.entry}
        rect={hover?.rect}
        onMouseEnter={cancelHide}
        onMouseLeave={scheduleHide}
      />
    </div>
  )
}
