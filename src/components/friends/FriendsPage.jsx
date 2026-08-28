import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import { useFriendsStore } from '../../stores/useFriendsStore'
import { useVrPresenceStore } from '../../stores/useVrPresenceStore'
import { useI18n } from '../../i18n'
import { supabase } from '../../services/supabase/client'

// El buzón que vivía aquí (mensajes tipo email) se movió a /buzon
// (MailboxPage.jsx) — esta página ahora es solo lo que dice su nombre:
// tu lista de amigos, agregar amigos, y regalarles algo. Pedido explícito
// del usuario tras notar que las dos cosas mezcladas en una sola página no
// tenía sentido.
const GIFT_AMOUNT_LABEL = '1,000 🪙' // ver migration_043.sql (send_daily_gift)

// ─── Online dot ─────────────────────────────────────────────────────────────
function OnlineDot({ online, t }) {
  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-full"
      style={{
        background: online ? '#22c55e' : '#6b7280',
        boxShadow: online ? '0 0 6px #22c55e88' : 'none',
      }}
      title={online ? t('pages.friends.onlineTitle') : t('pages.friends.offlineTitle')}
    />
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function FriendsPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const friends      = useFriendsStore(s => s.friends)
  const removeFriend = useFriendsStore(s => s.removeFriend)
  const addFriend    = useFriendsStore(s => s.addFriend)
  const players      = useVrPresenceStore(s => s.players)

  const [newName, setNewName] = useState('')
  const [confirmRemove, setConfirmRemove] = useState(null)
  const [giftBusy, setGiftBusy] = useState(null)
  const [giftResult, setGiftResult] = useState(null) // { name, ok, message }

  const onlinePlayers = new Set(Object.values(players).map(p => p?.name).filter(Boolean))

  const handleAdd = (e) => {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed) return
    addFriend(trimmed)
    setNewName('')
  }

  // Un regalo por día en total (no por amigo) — lo hace cumplir el RPC en
  // el servidor (gift_log, unique por remitente+día), esto solo llama y
  // muestra el resultado. El nombre se resuelve contra profiles.display_name
  // — mismo criterio "difuso" que ya usa esta página para el estado en
  // línea, porque los amigos aquí son solo texto, no cuentas vinculadas.
  const handleGift = async (name) => {
    setGiftBusy(name)
    setGiftResult(null)
    const { data, error } = await supabase.rpc('send_daily_gift', { p_recipient_name: name })
    setGiftBusy(null)
    if (error) {
      setGiftResult({ name, ok: false, message: t('pages.friends.giftError') })
      return
    }
    setGiftResult({ name, ok: data?.ok, message: data?.message ?? '' })
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 md:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{t('pages.friends.title')}</h1>
          <p className="mt-1 text-sm text-text-muted">
            {t('pages.friends.subtitle')}
          </p>
        </div>

        {giftResult && (
          <div className={`mb-4 rounded-xl border px-4 py-2.5 text-sm font-semibold ${
            giftResult.ok ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
          }`}>
            {giftResult.message}
          </div>
        )}

        {/* Friends list */}
        <div className="mb-6">
          <p className="mb-2 text-sm font-bold text-text">{t('pages.friends.listCount', { count: friends.length })}</p>
          <div className="rounded-2xl border border-border bg-surface">
            {friends.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <span className="text-4xl">🤝</span>
                <p className="text-sm text-text-muted">
                  {t('pages.friends.emptyTitle')}<br />
                  {t('pages.friends.emptyHint')}
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {friends.map((name) => {
                  const online = onlinePlayers.has(name)
                  return (
                    <li key={name} className="flex items-center gap-3 px-5 py-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold bg-primary/10"
                      >
                        {name[0]?.toUpperCase() ?? '?'}
                      </div>

                      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-semibold text-text">{name}</span>
                          <OnlineDot online={online} t={t} />
                          {online && <span className="text-[10px] font-medium text-green-500">{t('pages.friends.onlineInVr')}</span>}
                        </div>
                        <span className="text-xs text-text-muted">{online ? t('pages.friends.connectedToCampus') : t('pages.friends.disconnected')}</span>
                      </div>

                      <div className="flex shrink-0 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleGift(name)}
                          disabled={giftBusy === name}
                          title={t('pages.friends.sendGiftTitle', { amount: GIFT_AMOUNT_LABEL })}
                          className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 disabled:opacity-50"
                        >
                          {giftBusy === name ? '…' : '🎁'}
                        </button>
                        {online && (
                          <button
                            type="button"
                            onClick={() => navigate('/vr')}
                            className="rounded-lg border border-border px-2 py-1.5 text-xs font-semibold text-text-muted hover:border-primary hover:text-primary"
                          >
                            💬 VR
                          </button>
                        )}
                        {confirmRemove === name ? (
                          <div className="flex gap-1">
                            <button type="button" onClick={() => { removeFriend(name); setConfirmRemove(null) }} className="rounded-lg bg-red-500/10 px-2 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20">
                              {t('pages.friends.confirm')}
                            </button>
                            <button type="button" onClick={() => setConfirmRemove(null)} className="rounded-lg border border-border px-2 py-1.5 text-xs text-text-muted hover:text-text">✕</button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => setConfirmRemove(name)} className="rounded-lg border border-border px-2 py-1.5 text-xs text-text-muted hover:border-red-400 hover:text-red-400">
                            🗑️
                          </button>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
          {friends.length > 0 && (
            <p className="mt-2 text-[11px] text-text-muted">
              {t('pages.friends.giftHint', { amount: GIFT_AMOUNT_LABEL })}
            </p>
          )}
        </div>

        {/* Add friend */}
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="mb-3 text-sm font-bold text-text">{t('pages.friends.addByName')}</p>
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder={t('pages.friends.namePlaceholder')}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={!newName.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background hover:bg-primary-hover disabled:opacity-50"
            >
              {t('pages.friends.add')}
            </button>
          </form>
          <p className="mt-2 text-[11px] text-text-muted">
            {t('pages.friends.nameHint')}
          </p>
        </div>
      </main>

      <MascotCompanion hideViewport />
    </div>
  )
}
