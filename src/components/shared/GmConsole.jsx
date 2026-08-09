import { useEffect, useRef, useState } from 'react'
import { findPlayers, runGmCommand, listShopItemIds, SELF_TARGET } from '../../services/admin/gmCommands'
import { useMobStore } from '../../stores/useMobStore'
import { useSpawnedNpcStore } from '../../stores/useSpawnedNpcStore'
import { MOB_TYPES } from '../../data/mobRegistry'
import { OLIVER_NPC, EINSTEIN_NPC, JAFET_NPC, SHOPKEEPER_NPC, VR_NPCS } from '../../data/vrNpcRegistry'

const SUMMONABLE_NPCS = [OLIVER_NPC, EINSTEIN_NPC, JAFET_NPC, SHOPKEEPER_NPC, ...VR_NPCS]
const norm = (s) => (s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')

// Buttons that pre-fill the input instead of firing blind — most commands
// need an argument, and this is meant for trying them out, not for
// accidentally granting XP/coins with one misplaced click.
const COMMAND_PALETTE = [
  { cmd: '/help', desc: 'Ver esta ayuda' },
  { cmd: '/items', desc: 'Ids de objetos de la Tienda' },
  { cmd: '/additem ', desc: 'Dar un objeto' },
  { cmd: '/removeitem ', desc: 'Quitar un objeto' },
  { cmd: '/addcoins ', desc: 'Dar cobre' },
  { cmd: '/setlevel ', desc: 'Fijar nivel' },
  { cmd: '/addxp ', desc: 'Dar XP (con aviso)' },
  { cmd: '/unlockmascot ', desc: 'Desbloquear mascota por id' },
  { cmd: '/npcadd ', desc: 'Invocar monstruo o NPC' },
  { cmd: '/npcclear', desc: 'Quitar NPCs invocados' },
  { cmd: '/who ', desc: 'Buscar jugador' },
  { cmd: '/target ', desc: 'Cambiar a quién afectan los comandos' },
]

const HELP_LINES = [
  'Comandos disponibles:',
  '  /additem <itemId>      — da un objeto (a ti o al jugador con /target)',
  '  /removeitem <itemId>   — quita un objeto',
  '  /addcoins <cantidad>   — da cobre (puede ser negativo)',
  '  /setlevel <nivel>      — fija el nivel (1-99), sin aviso de subida',
  '  /addxp <cantidad>      — da experiencia y muestra el aviso de subir de nivel',
  '  /unlockmascot <id>     — desbloquea una mascota por su id numérico',
  '  /items                 — lista los ids de objetos de la Tienda',
  '  /npcadd <tipo>         — coloca un monstruo o NPC cerca de ti (ej. bug-de-codigo, einstein)',
  '  /npcclear              — quita todos los NPCs invocados con /npcadd',
  '  /who <texto>           — busca jugadores por correo o nombre',
  '  /target <correo|yo>    — cambia a quién afectan los comandos',
]

// Admin-only "GM console" (World of Warcraft moderator-style): a command
// line to give/quitar objetos, subir nivel, etc. — on la cuenta del admin o
// en la de cualquier jugador, por email/nombre. Apuntar a otro jugador
// escribe directo a su profiles.snapshot en Supabase ya que sus stores no
// están cargados en este navegador.
export default function GmConsole({ open, onClose, playerPositionRef }) {
  const [lines, setLines] = useState(['🖥️ Consola GM — escribe /help para ver los comandos.'])
  const [input, setInput] = useState('')
  const [target, setTarget] = useState({ id: SELF_TARGET, label: 'yo (tú)' })
  const [busy, setBusy] = useState(false)
  const logRef = useRef(null)
  const inputRef = useRef(null)

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
      } else if (cmd === 'npcadd') {
        const query = norm(args[0])
        if (!query) {
          log(`Monstruos: ${Object.values(MOB_TYPES).map((t) => t.id).join(', ')}`)
          log(`NPCs: ${SUMMONABLE_NPCS.map((n) => n.id).join(', ')}`)
        } else {
          const mobType = Object.values(MOB_TYPES).find((t) =>
            norm(t.id) === query || norm(t.name).includes(query),
          )
          const npc = SUMMONABLE_NPCS.find((n) => norm(String(n.id)) === query || norm(n.name).includes(query))
          const pos = playerPositionRef?.current
          const spawnPos = pos ? [pos.x + 2, 0, pos.z] : [0, 0, -53]
          if (mobType) {
            useMobStore.getState().spawnAt(mobType.id, spawnPos)
            log(`✅ ${mobType.icon} ${mobType.name} colocado cerca de ti.`)
          } else if (npc) {
            useSpawnedNpcStore.getState().spawnAt(npc, spawnPos)
            log(`✅ ${npc.icon ?? '🧑'} ${npc.name} colocado cerca de ti.`)
          } else {
            log(`❌ No encontré ningún monstruo ni NPC llamado "${args[0]}". Escribe /npcadd sin nada para ver la lista.`)
          }
        }
      } else if (cmd === 'npcclear') {
        useSpawnedNpcStore.getState().clear()
        log('✅ NPCs invocados eliminados.')
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

  const fillCommand = (cmd) => {
    setInput(cmd)
    inputRef.current?.focus()
  }

  return (
    // Backdrop a pantalla completa (igual que TerminalModal/BashTerminalModal)
    // — antes la consola era solo una cajita en la esquina SIN backdrop, así
    // que el mundo 3D detrás seguía capturando clics/arrastres de cámara y
    // te robaba el foco del input apenas movías el mouse: por eso escribir
    // "no hacía nada", en realidad nunca llegaba a teclear en la consola.
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4">
      <div className="flex h-[32rem] w-full max-w-lg flex-col rounded-xl border border-primary/40 bg-black/95 font-mono text-xs text-[#39ff14] shadow-2xl">
        <div className="flex items-center justify-between border-b border-primary/30 px-3 py-2">
          <span className="font-semibold">🖥️ Consola GM — objetivo: {target.label}</span>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-text">✕</button>
        </div>

        <div className="flex flex-wrap gap-1 border-b border-primary/30 px-2 py-2">
          {COMMAND_PALETTE.map((c) => (
            <button
              key={c.cmd}
              type="button"
              title={c.desc}
              onClick={() => fillCommand(c.cmd)}
              className="rounded border border-[#39ff14]/30 px-1.5 py-0.5 text-[10px] hover:border-[#39ff14] hover:bg-[#39ff14]/10"
            >
              {c.cmd.trim()}
            </button>
          ))}
        </div>

        <div ref={logRef} className="flex-1 space-y-0.5 overflow-y-auto whitespace-pre-wrap px-3 py-2">
          {lines.map((line, i) => <div key={i}>{line}</div>)}
        </div>
        <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-primary/30 px-2 py-2">
          <span className="pr-1">/</span>
          <input
            ref={inputRef}
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy}
            placeholder="additem camara"
            className="flex-1 bg-transparent outline-none placeholder:text-[#39ff14]/30"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="rounded bg-[#39ff14]/15 px-3 py-1 text-[11px] font-bold text-[#39ff14] transition-colors hover:bg-[#39ff14]/25 disabled:opacity-40"
          >
            ▶ Ejecutar
          </button>
        </form>
      </div>
    </div>
  )
}
