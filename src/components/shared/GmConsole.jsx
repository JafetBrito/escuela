import { useEffect, useRef, useState } from 'react'
import { findPlayers, runGmCommand, listShopItemIds, SELF_TARGET } from '../../services/admin/gmCommands'

const HELP_LINES = [
  'Comandos disponibles:',
  '  /additem <itemId>      — da un objeto (a ti o al jugador con /target)',
  '  /removeitem <itemId>   — quita un objeto',
  '  /addcoins <cantidad>   — da cobre (puede ser negativo)',
  '  /setlevel <nivel>      — fija el nivel (1-99), sin aviso de subida',
  '  /addxp <cantidad>      — da experiencia y muestra el aviso de subir de nivel',
  '  /unlockmascot <id>     — desbloquea una mascota por su id numérico',
  '  /items                 — lista los ids de objetos de la Tienda',
  '  /who <texto>           — busca jugadores por correo o nombre',
  '  /target <correo|yo>    — cambia a quién afectan los comandos',
]

// Admin-only "GM console" (World of Warcraft moderator-style): a command
// line to give/quitar objetos, subir nivel, etc. — on the admin's own
// account or on any other player's, by email/nombre. Targeting another
// player writes straight to their profiles.snapshot in Supabase since
// their stores aren't loaded in this browser.
export default function GmConsole({ open, onClose }) {
  const [lines, setLines] = useState(['🖥️ Consola GM — escribe /help para ver los comandos.'])
  const [input, setInput] = useState('')
  const [target, setTarget] = useState({ id: SELF_TARGET, label: 'yo (tú)' })
  const [busy, setBusy] = useState(false)
  const logRef = useRef(null)

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [lines])

  if (!open) return null

  const log = (line) => setLines((prev) => [...prev, line])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || busy) return
    setInput('')
    log(`> ${trimmed}`)

    const [cmdRaw, ...args] = trimmed.replace(/^\//, '').split(/\s+/)
    const cmd = cmdRaw.toLowerCase()

    setBusy(true)
    try {
      if (cmd === 'help') {
        HELP_LINES.forEach(log)
      } else if (cmd === 'items') {
        listShopItemIds().forEach(log)
      } else if (cmd === 'who') {
        const players = await findPlayers(args.join(' '))
        if (!players.length) log('Sin resultados.')
        else players.forEach((p) => log(`${p.display_name} <${p.email}> — ${p.role} — id:${p.id}`))
      } else if (cmd === 'target') {
        const query = args.join(' ')
        if (!query || query === 'yo') {
          setTarget({ id: SELF_TARGET, label: 'yo (tú)' })
          log('🎯 Objetivo: yo')
        } else {
          const players = await findPlayers(query)
          if (!players.length) {
            log('No se encontró ningún jugador con ese correo/nombre.')
          } else {
            const p = players[0]
            setTarget({ id: p.id, label: `${p.display_name} <${p.email}>` })
            log(`🎯 Objetivo: ${p.display_name} <${p.email}>`)
          }
        }
      } else {
        const result = await runGmCommand(target.id, cmd, args)
        log(result)
      }
    } catch (err) {
      log(`❌ ${err.message}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed bottom-20 left-4 z-[999] flex h-96 w-96 flex-col rounded-xl border border-primary/40 bg-black/95 font-mono text-xs text-[#39ff14] shadow-2xl">
      <div className="flex items-center justify-between border-b border-primary/30 px-3 py-2">
        <span className="font-semibold">🖥️ Consola GM — objetivo: {target.label}</span>
        <button type="button" onClick={onClose} className="text-text-muted hover:text-text">✕</button>
      </div>
      <div ref={logRef} className="flex-1 space-y-0.5 overflow-y-auto whitespace-pre-wrap px-3 py-2">
        {lines.map((line, i) => <div key={i}>{line}</div>)}
      </div>
      <form onSubmit={handleSubmit} className="flex border-t border-primary/30 px-2 py-2">
        <span className="pr-1">/</span>
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={busy}
          placeholder="additem camara"
          className="flex-1 bg-transparent outline-none placeholder:text-[#39ff14]/30"
        />
      </form>
    </div>
  )
}
