import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import { useFriendsStore } from '../../stores/useFriendsStore'
import { useVrPresenceStore } from '../../stores/useVrPresenceStore'
import { useSitePresenceStore } from '../../stores/useSitePresenceStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { useI18n } from '../../i18n'
import { supabase } from '../../services/supabase/client'

// Amigos — dashboard: quién está conectado (presencia de todo el sitio, ver
// useSitePresenceStore) y si está activo o ausente, con foto de perfil.
// Los amigos siguen siendo nombres de texto (useFriendsStore, sin cuenta
// vinculada), así que se cruzan con los conectados por nombre (sin mayúsculas).
// Un amigo desconectado no tiene foto conocida: sin conexión no hay forma de
// leer el perfil de otra cuenta, así que muestra su inicial.
const GIFT_AMOUNT_LABEL = '1,000 🪙' // ver migration_043.sql (send_daily_gift)
const STATUS = {
  active: { label: 'Activo ahora', color: '#22c55e' },
  away: { label: 'Ausente', color: '#f59e0b' },
  offline: { label: 'Desconectado', color: '#6b7280' },
}

function Avatar({ name, src, status, size = 48 }) {
  const color = STATUS[status].color
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {src ? (
        <img src={src} alt="" referrerPolicy="no-referrer" className="h-full w-full rounded-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/15 text-lg font-bold text-primary">
          {name[0]?.toUpperCase() ?? '?'}
        </div>
      )}
      <span
        className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-surface"
        style={{ background: color, boxShadow: status === 'active' ? `0 0 6px ${color}` : 'none' }}
        title={STATUS[status].label}
      />
    </div>
  )
}

function StatTile({ value, label, color }) {
  return (
    <div className="flex min-w-24 flex-col items-center rounded-xl bg-white/15 px-4 py-2.5">
      <span className="text-xl font-extrabold text-white" style={color ? { color } : {}}>{value}</span>
      <span className="text-[10px] font-semibold text-white/80">{label}</span>
    </div>
  )
}

export default function FriendsPage() {
  const { t } = useI18n()
  const navigate = useNavigate()
  const myId = useAuthStore((s) => s.session?.user?.id)
  const friends = useFriendsStore((s) => s.friends)
  const removeFriend = useFriendsStore((s) => s.removeFriend)
  const addFriend = useFriendsStore((s) => s.addFriend)
  const vrPlayers = useVrPresenceStore((s) => s.players)
  const siteOnline = useSitePresenceStore((s) => s.online)

  const [newName, setNewName] = useState('')
  const [query, setQuery] = useState('')
  const [confirmRemove, setConfirmRemove] = useState(null)
  const [giftBusy, setGiftBusy] = useState(null)
  const [giftResult, setGiftResult] = useState(null) // { ok, message }

  // Conectados ahora (sin contarme a mí): por nombre en minúsculas.
  const onlineByName = useMemo(() => {
    const m = {}
    for (const [id, p] of Object.entries(siteOnline)) if (id !== myId && p.name) m[p.name.toLowerCase()] = p
    for (const p of Object.values(vrPlayers)) if (p?.name && !m[p.name.toLowerCase()]) m[p.name.toLowerCase()] = { name: p.name, status: 'active' }
    return m
  }, [siteOnline, vrPlayers, myId])

  const rows = useMemo(() => friends.map((name) => {
    const p = onlineByName[name.toLowerCase()]
    return { name, avatar: p?.avatar, status: p ? (p.status === 'away' ? 'away' : 'active') : 'offline' }
  }), [friends, onlineByName])

  const q = query.trim().toLowerCase()
  const shown = rows.filter((r) => !q || r.name.toLowerCase().includes(q))
  const connected = shown.filter((r) => r.status !== 'offline')
  const offline = shown.filter((r) => r.status === 'offline')
  const activeCount = rows.filter((r) => r.status === 'active').length
  const awayCount = rows.filter((r) => r.status === 'away').length

  const friendSet = useMemo(() => new Set(friends.map((f) => f.toLowerCase())), [friends])
  const discover = Object.entries(siteOnline)
    .filter(([id, p]) => id !== myId && p.name && !friendSet.has(p.name.toLowerCase()))
    .slice(0, 30)

  const handleAdd = (e) => {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed) return
    addFriend(trimmed)
    setNewName('')
  }

  // Un regalo por día en total (no por amigo) — lo hace cumplir el RPC en el
  // servidor (gift_log, unique por remitente+día). El nombre se resuelve
  // contra profiles.display_name.
  const handleGift = async (name) => {
    setGiftBusy(name)
    setGiftResult(null)
    const { data, error } = await supabase.rpc('send_daily_gift', { p_recipient_name: name })
    setGiftBusy(null)
    setGiftResult(error ? { ok: false, message: t('pages.friends.giftError') } : { ok: data?.ok, message: data?.message ?? '' })
  }

  const FriendCard = ({ r }) => (
    <li className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3.5">
      <Avatar name={r.name} src={r.avatar} status={r.status} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-text">{r.name}</p>
        <p className="text-xs font-medium" style={{ color: STATUS[r.status].color }}>{STATUS[r.status].label}</p>
      </div>
      <div className="flex shrink-0 gap-1.5">
        <button
          type="button"
          onClick={() => handleGift(r.name)}
          disabled={giftBusy === r.name}
          title={t('pages.friends.sendGiftTitle', { amount: GIFT_AMOUNT_LABEL })}
          className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 disabled:opacity-50"
        >
          {giftBusy === r.name ? '…' : '🎁'}
        </button>
        {r.status !== 'offline' && (
          <button type="button" onClick={() => navigate('/vr')} className="rounded-lg border border-border px-2 py-1.5 text-xs font-semibold text-text-muted hover:border-primary hover:text-primary">
            💬 VR
          </button>
        )}
        {confirmRemove === r.name ? (
          <>
            <button type="button" onClick={() => { removeFriend(r.name); setConfirmRemove(null) }} className="rounded-lg bg-red-500/10 px-2 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20">
              {t('pages.friends.confirm')}
            </button>
            <button type="button" onClick={() => setConfirmRemove(null)} className="rounded-lg border border-border px-2 py-1.5 text-xs text-text-muted hover:text-text">✕</button>
          </>
        ) : (
          <button type="button" onClick={() => setConfirmRemove(r.name)} className="rounded-lg border border-border px-2 py-1.5 text-xs text-text-muted hover:border-red-400 hover:text-red-400">🗑️</button>
        )}
      </div>
    </li>
  )

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 md:px-8">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-7 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-white drop-shadow-sm">{t('pages.friends.title')}</h1>
              <p className="mt-1 text-sm font-medium text-white/85">{t('pages.friends.subtitle')}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <StatTile value={friends.length} label="Amigos" />
              <StatTile value={activeCount} label="Activos" color="#86efac" />
              <StatTile value={awayCount} label="Ausentes" color="#fcd34d" />
              <StatTile value={rows.length - activeCount - awayCount} label="Desconectados" />
            </div>
          </div>
        </div>

        {giftResult && (
          <div className={`mt-4 rounded-xl border px-4 py-2.5 text-sm font-semibold ${
            giftResult.ok ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
          }`}>
            {giftResult.message}
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Lista de amigos */}
          <section className="min-w-0">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="🔍 Buscar entre tus amigos…"
              className="mb-4 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none focus:border-primary"
            />

            {friends.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-14 text-center">
                <span className="text-4xl">🤝</span>
                <p className="text-sm text-text-muted">{t('pages.friends.emptyTitle')}<br />{t('pages.friends.emptyHint')}</p>
              </div>
            ) : (
              <>
                <h2 className="mb-2 text-xs font-black uppercase tracking-widest text-emerald-500">🟢 Conectados ({connected.length})</h2>
                {connected.length === 0 ? (
                  <p className="mb-6 rounded-2xl border border-dashed border-border py-6 text-center text-sm text-text-muted">Ninguno de tus amigos está conectado ahora.</p>
                ) : (
                  <ul className="mb-6 grid gap-3 xl:grid-cols-2">{connected.map((r) => <FriendCard key={r.name} r={r} />)}</ul>
                )}

                <h2 className="mb-2 text-xs font-black uppercase tracking-widest text-text-muted/70">⚫ Desconectados ({offline.length})</h2>
                <ul className="grid gap-3 xl:grid-cols-2">{offline.map((r) => <FriendCard key={r.name} r={r} />)}</ul>

                <p className="mt-3 text-[11px] text-text-muted">{t('pages.friends.giftHint', { amount: GIFT_AMOUNT_LABEL })}</p>
              </>
            )}
          </section>

          {/* Agregar + conectados ahora */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-surface p-5">
              <p className="mb-3 text-sm font-bold text-text">{t('pages.friends.addByName')}</p>
              <form onSubmit={handleAdd} className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t('pages.friends.namePlaceholder')}
                  className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
                />
                <button type="submit" disabled={!newName.trim()} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background hover:bg-primary-hover disabled:opacity-50">
                  {t('pages.friends.add')}
                </button>
              </form>
              <p className="mt-2 text-[11px] text-text-muted">{t('pages.friends.nameHint')}</p>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5">
              <p className="mb-3 text-sm font-bold text-text">🌐 Conectados ahora ({discover.length})</p>
              {discover.length === 0 ? (
                <p className="text-sm text-text-muted">No hay nadie más conectado en este momento.</p>
              ) : (
                <ul className="space-y-2.5">
                  {discover.map(([id, p]) => (
                    <li key={id} className="flex items-center gap-3">
                      <Avatar name={p.name} src={p.avatar} status={p.status === 'away' ? 'away' : 'active'} size={38} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-text">{p.name}</p>
                        <p className="text-[11px]" style={{ color: STATUS[p.status === 'away' ? 'away' : 'active'].color }}>{STATUS[p.status === 'away' ? 'away' : 'active'].label}</p>
                      </div>
                      <button type="button" onClick={() => addFriend(p.name)} className="shrink-0 rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-text-muted hover:border-primary hover:text-primary">
                        + Agregar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </main>

      <MascotCompanion hideViewport />
    </div>
  )
}
