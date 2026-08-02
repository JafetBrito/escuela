import { useState } from 'react'
import AdminShell from './AdminShell'
import { useAuthStore } from '../../stores/useAuthStore'
import { useVoiceStore } from '../../stores/useVoiceStore'
import { findPlayers, runGmCommand, SELF_TARGET, setVoicePermission } from '../../services/admin/gmCommands'
import { SHOP_ITEMS, SHOP_CATEGORIES } from '../../data/shopRegistry'
import GmConsole from '../shared/GmConsole'

// Versión de página completa de lo que ya vive en la burbuja flotante
// (DevToolsPanel.jsx) — mismos servicios/stores, sin duplicar lógica, solo
// un layout más cómodo para usarlo sentado en el panel admin en vez de una
// ventanita de 288px. Las herramientas de "mundo" (NPCs, clima, tema
// festivo) se quedan solo en la burbuja — ver "Alcance v1" en el plan.
export default function AdminCommandsPage() {
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const myVoiceEnabled = useVoiceStore((s) => s.myVoiceEnabled)
  const toggleMyVoice = useVoiceStore((s) => s.toggleMyVoice)

  const [consoleOpen, setConsoleOpen] = useState(false)

  const [giveTarget, setGiveTarget] = useState({ id: SELF_TARGET, label: 'yo (tú)' })
  const [giveTargetQuery, setGiveTargetQuery] = useState('')
  const [giveSearch, setGiveSearch] = useState('')
  const [giveBusy, setGiveBusy] = useState(false)
  const [giveMsg, setGiveMsg] = useState('')

  const [voiceQuery, setVoiceQuery] = useState('')
  const [voiceBusy, setVoiceBusy] = useState(false)
  const [voiceMsg, setVoiceMsg] = useState('')

  if (!isAdmin?.()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-text-muted">
        Acceso restringido a administradores.
      </div>
    )
  }

  const handleGiveTargetSearch = async () => {
    const query = giveTargetQuery.trim()
    if (!query) { setGiveTarget({ id: SELF_TARGET, label: 'yo (tú)' }); return }
    const players = await findPlayers(query)
    if (!players.length) { setGiveMsg('❌ Sin resultados para ese jugador.'); return }
    const p = players[0]
    setGiveTarget({ id: p.id, label: `${p.display_name} <${p.email}>` })
    setGiveMsg(`🎯 Objetivo: ${p.display_name}`)
  }

  const handleGiveItem = async (itemId) => {
    if (giveBusy) return
    setGiveBusy(true)
    try {
      const msg = await runGmCommand(giveTarget.id, 'additem', [itemId])
      setGiveMsg(`${msg} → ${giveTarget.label}`)
    } catch (err) {
      setGiveMsg(`❌ ${err.message}`)
    } finally {
      setGiveBusy(false)
    }
  }

  const handleVoiceGrant = async (enabled) => {
    if (!voiceQuery.trim() || voiceBusy) return
    setVoiceBusy(true)
    try {
      const player = await setVoicePermission(voiceQuery.trim(), enabled)
      setVoiceMsg(`${enabled ? '✅' : '🚫'} ${player.display_name || player.email}`)
    } catch (err) {
      setVoiceMsg(`❌ ${err.message}`)
    } finally {
      setVoiceBusy(false)
    }
  }

  const filteredShopItems = SHOP_ITEMS.filter((i) =>
    i.name.toLowerCase().includes(giveSearch.toLowerCase()) || i.id.includes(giveSearch.toLowerCase()),
  )

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-8 shadow-lg">
          <h1 className="text-2xl font-black text-white">🕹️ Comandos</h1>
          <p className="mt-1 text-sm font-medium text-white/80">
            Consola de GM, entrega de objetos y permisos de voz — mismos comandos de siempre, en un solo lugar.
          </p>
        </div>

        {/* Consola GM */}
        <div className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="font-bold text-text">🖥️ Consola de comandos</h2>
          <p className="mt-1 text-xs text-text-muted">
            /additem, /addcoins, /setlevel, /npcadd, /target y más — se abre en una ventana flotante.
          </p>
          <button type="button" onClick={() => setConsoleOpen(true)}
            className="mt-2 rounded-lg border border-primary/40 px-3 py-1.5 text-sm font-semibold text-primary">
            🖥️ Abrir Consola GM
          </button>
        </div>

        {/* Dar objeto */}
        <div className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="font-bold text-text">🎁 Dar objeto</h2>
          <p className="mt-1 text-xs text-text-muted">
            Objetivo: <span className="font-semibold text-text">{giveTarget.label}</span>
          </p>
          <div className="mt-2 flex gap-2">
            <input type="text" value={giveTargetQuery} onChange={(e) => setGiveTargetQuery(e.target.value)}
              placeholder="correo o nombre (vacío = yo)"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-text outline-none focus:border-primary" />
            <button type="button" onClick={handleGiveTargetSearch}
              className="rounded-lg border border-primary/40 px-3 py-1.5 text-sm font-semibold text-primary">
              🎯 Buscar
            </button>
          </div>
          <input type="text" value={giveSearch} onChange={(e) => setGiveSearch(e.target.value)}
            placeholder="Buscar objeto…"
            className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-text outline-none focus:border-primary" />
          <div className="mt-2 grid max-h-72 grid-cols-2 gap-1.5 overflow-y-auto sm:grid-cols-3 md:grid-cols-4">
            {filteredShopItems.map((item) => (
              <button key={item.id} type="button" disabled={giveBusy} onClick={() => handleGiveItem(item.id)}
                title={`${SHOP_CATEGORIES[item.category]?.label ?? item.category}`}
                className="flex items-center gap-1.5 rounded-lg border border-border px-2 py-1.5 text-left text-xs text-text hover:border-primary hover:bg-primary/10 disabled:opacity-50">
                <span>{item.icon}</span>
                <span className="truncate">{item.name}</span>
              </button>
            ))}
            {filteredShopItems.length === 0 && (
              <p className="col-span-full py-2 text-center text-xs text-text-muted">Sin resultados.</p>
            )}
          </div>
          {giveMsg && <p className="mt-2 text-xs text-text-muted">{giveMsg}</p>}
        </div>

        {/* Voz */}
        <div className="rounded-2xl border border-border bg-surface p-4">
          <h2 className="font-bold text-text">🎙️ Voz</h2>
          <button type="button" onClick={toggleMyVoice}
            className="mt-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-background">
            {myVoiceEnabled ? '🎙️ Mi voz: ON' : '🔇 Mi voz: OFF'}
          </button>
          <p className="mt-3 text-xs text-text-muted">Dar/quitar voz a jugador:</p>
          <input type="text" value={voiceQuery} onChange={(e) => setVoiceQuery(e.target.value)}
            placeholder="correo o nombre"
            className="mt-1 w-full max-w-sm rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-text outline-none focus:border-primary" />
          <div className="mt-2 flex max-w-sm gap-2">
            <button type="button" disabled={voiceBusy} onClick={() => handleVoiceGrant(true)}
              className="flex-1 rounded-lg border border-primary/40 px-3 py-1.5 text-sm font-semibold text-primary disabled:opacity-50">
              ✅ Dar
            </button>
            <button type="button" disabled={voiceBusy} onClick={() => handleVoiceGrant(false)}
              className="flex-1 rounded-lg border border-danger/40 px-3 py-1.5 text-sm font-semibold text-danger disabled:opacity-50">
              🚫 Quitar
            </button>
          </div>
          {voiceMsg && <p className="mt-2 text-xs text-text-muted">{voiceMsg}</p>}
        </div>
      </div>

      <GmConsole open={consoleOpen} onClose={() => setConsoleOpen(false)} />
    </AdminShell>
  )
}
