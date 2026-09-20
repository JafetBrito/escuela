import { useEffect, useMemo, useState } from 'react'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import { useSocialStore } from '../../stores/useSocialStore'
import { useSitePresenceStore } from '../../stores/useSitePresenceStore'
import { GAMES } from '../../data/gamesRegistry'

// Amigos — dashboard social. Las amistades son entre cuentas y se aceptan
// (solicitud → notificación → aceptar); solo tus amigos aparecen aquí, con su
// estado (presencia de todo el sitio, ver useSitePresenceStore). Puedes
// mandarles un regalo, un reto o una invitación a un juego o mundo: todo
// necesita que el amigo lo acepte (migration_074).
const STATUS = {
  active: { label: 'Activo ahora', color: '#22c55e' },
  away: { label: 'Ausente', color: '#f59e0b' },
  offline: { label: 'Desconectado', color: '#6b7280' },
}

const CHALLENGES = [
  'Terminar una clase hoy',
  'Completar una lección hoy',
  'Completar un curso esta semana',
  'Mantener nuestra racha de hoy',
  'Subir de nivel esta semana',
  'Resolver el reto del día de la semana temática',
  'Entregar una tarea pendiente hoy',
]
const WORLDS = [
  { path: '/vr', icon: '🕶️', title: 'Campus en Realidad Virtual' },
  { path: '/mundo', icon: '🗺️', title: 'Mundo 2D' },
]

function Avatar({ name, src, status, size = 48 }) {
  const color = STATUS[status].color
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {src ? (
        <img src={src} alt="" referrerPolicy="no-referrer" className="h-full w-full rounded-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/15 text-lg font-bold text-primary">{name[0]?.toUpperCase() ?? '?'}</div>
      )}
      <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-surface" style={{ background: color, boxShadow: status === 'active' ? `0 0 6px ${color}` : 'none' }} title={STATUS[status].label} />
    </div>
  )
}

function StatTile({ value, label }) {
  return (
    <div className="flex min-w-24 flex-col items-center rounded-xl bg-white/15 px-4 py-2.5">
      <span className="text-xl font-extrabold text-white">{value}</span>
      <span className="text-[10px] font-semibold text-white/80">{label}</span>
    </div>
  )
}

// Ventana para mandar un reto, una invitación a un juego o a un mundo.
function InviteModal({ friend, onClose, onSent }) {
  const sendInvite = useSocialStore((s) => s.sendInvite)
  const [tab, setTab] = useState('challenge')
  const [busy, setBusy] = useState(false)

  const send = async (kind, title, payload) => {
    setBusy(true)
    const r = await sendInvite(friend.id, kind, title, payload)
    setBusy(false)
    onSent(r.message ?? (r.ok ? 'Enviado' : 'No se pudo enviar'), r.ok)
    if (r.ok) onClose()
  }

  const TABS = [['challenge', '🎯 Retos'], ['game', '🎮 Juegos'], ['vr', '🌐 Mundos']]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="text-base font-extrabold text-text">Invitar a {friend.name}</p>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-text">✕</button>
        </div>
        <p className="mt-0.5 text-xs text-text-muted">{friend.name} tendrá que aceptar para que cuente.</p>

        <div className="mt-3 flex gap-1 rounded-xl border border-border bg-background p-1">
          {TABS.map(([k, l]) => (
            <button key={k} type="button" onClick={() => setTab(k)} className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-bold transition ${tab === k ? 'bg-surface text-text shadow-sm' : 'text-text-muted hover:text-text'}`}>{l}</button>
          ))}
        </div>

        <div className="mt-3 grid gap-2">
          {tab === 'challenge' && CHALLENGES.map((c) => (
            <button key={c} type="button" disabled={busy} onClick={() => send('challenge', c, {})} className="rounded-xl border border-border px-4 py-2.5 text-left text-sm font-semibold text-text transition hover:border-primary hover:bg-primary/5 disabled:opacity-50">🎯 {c}</button>
          ))}
          {tab === 'game' && GAMES.map((g) => (
            <button key={g.id} type="button" disabled={busy} onClick={() => send('game', `Jugar ${g.title}`, { path: `/games/${g.id}` })} className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-left text-sm font-semibold text-text transition hover:border-primary hover:bg-primary/5 disabled:opacity-50">
              <span className="text-lg">{g.icon}</span> {g.title}
            </button>
          ))}
          {tab === 'vr' && WORLDS.map((w) => (
            <button key={w.path} type="button" disabled={busy} onClick={() => send('vr', `Encontrémonos en: ${w.title}`, { path: w.path })} className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-left text-sm font-semibold text-text transition hover:border-primary hover:bg-primary/5 disabled:opacity-50">
              <span className="text-lg">{w.icon}</span> {w.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function FriendsPage() {
  const { friends, incoming, outgoing, challenges, loaded } = useSocialStore()
  const { load, sendRequest, respondRequest, removeFriend, sendGift, completeInvite } = useSocialStore.getState()
  const siteOnline = useSitePresenceStore((s) => s.online)

  const [newFriend, setNewFriend] = useState('')
  const [query, setQuery] = useState('')
  const [confirmRemove, setConfirmRemove] = useState(null)
  const [inviteFor, setInviteFor] = useState(null)
  const [busyGift, setBusyGift] = useState(null)
  const [banner, setBanner] = useState(null) // { ok, message }

  useEffect(() => {
    load()
    const t = setInterval(load, 20_000)
    return () => clearInterval(t)
  }, [load])

  const rows = useMemo(() => friends.map((f) => {
    const p = siteOnline[f.id]
    return { ...f, avatar: f.avatar ?? p?.avatar, status: p ? (p.status === 'away' ? 'away' : 'active') : 'offline' }
  }), [friends, siteOnline])

  const q = query.trim().toLowerCase()
  const shown = rows.filter((r) => !q || `${r.name}#${r.tag}`.toLowerCase().includes(q))
  const connected = shown.filter((r) => r.status !== 'offline')
  const offline = shown.filter((r) => r.status === 'offline')
  const activeCount = rows.filter((r) => r.status === 'active').length
  const awayCount = rows.filter((r) => r.status === 'away').length

  const say = (message, ok = true) => { setBanner({ ok, message }); setTimeout(() => setBanner(null), 5000) }

  const handleAdd = async (e) => {
    e.preventDefault()
    const r = await sendRequest(newFriend)
    say(r.message, r.ok)
    if (r.ok) setNewFriend('')
  }

  const handleGift = async (f) => {
    setBusyGift(f.id)
    const r = await sendGift(f.id)
    setBusyGift(null)
    say(r.message, r.ok)
  }

  const FriendCard = ({ r }) => (
    <li className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface p-3.5">
      <Avatar name={r.name} src={r.avatar} status={r.status} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-text">{r.name}<span className="font-mono text-xs text-text-muted">#{r.tag}</span></p>
        <p className="text-xs font-medium" style={{ color: STATUS[r.status].color }}>{STATUS[r.status].label}</p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-1.5">
        <button type="button" onClick={() => handleGift(r)} disabled={busyGift === r.id} title="Enviar regalo del día (1,000 🪙) — tiene que aceptarlo" className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 disabled:opacity-50">{busyGift === r.id ? '…' : '🎁'}</button>
        <button type="button" onClick={() => setInviteFor(r)} title="Retos, juegos y mundos" className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-text-muted hover:border-primary hover:text-primary">🎯 Invitar</button>
        {confirmRemove === r.id ? (
          <>
            <button type="button" onClick={() => { removeFriend(r.id); setConfirmRemove(null) }} className="rounded-lg bg-red-500/10 px-2 py-1.5 text-xs font-semibold text-red-400">Quitar</button>
            <button type="button" onClick={() => setConfirmRemove(null)} className="rounded-lg border border-border px-2 py-1.5 text-xs text-text-muted">✕</button>
          </>
        ) : (
          <button type="button" onClick={() => setConfirmRemove(r.id)} className="rounded-lg border border-border px-2 py-1.5 text-xs text-text-muted hover:border-red-400 hover:text-red-400">🗑️</button>
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
              <h1 className="text-3xl font-extrabold text-white drop-shadow-sm">🤝 Amigos</h1>
              <p className="mt-1 text-sm font-medium text-white/85">Solo tus amigos confirmados: cada solicitud, regalo e invitación tiene que ser aceptada.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <StatTile value={friends.length} label="Amigos" />
              <StatTile value={activeCount} label="Activos" />
              <StatTile value={awayCount} label="Ausentes" />
              <StatTile value={rows.length - activeCount - awayCount} label="Desconectados" />
            </div>
          </div>
        </div>

        {banner && (
          <div className={`mt-4 rounded-xl border px-4 py-2.5 text-sm font-semibold ${banner.ok ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-amber-500/30 bg-amber-500/10 text-amber-400'}`}>{banner.message}</div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="min-w-0">
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="🔍 Buscar entre tus amigos…" className="mb-4 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text outline-none focus:border-primary" />

            {!loaded ? (
              <p className="py-10 text-center text-sm text-text-muted">Cargando…</p>
            ) : friends.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-14 text-center">
                <span className="text-4xl">🤝</span>
                <p className="text-sm text-text-muted">Aún no tienes amigos.<br />Envía una solicitud con su nombre y etiqueta (Nombre#1234).</p>
              </div>
            ) : (
              <>
                <h2 className="mb-2 text-xs font-black uppercase tracking-widest text-emerald-500">🟢 Conectados ({connected.length})</h2>
                {connected.length === 0 ? (
                  <p className="mb-6 rounded-2xl border border-dashed border-border py-6 text-center text-sm text-text-muted">Ninguno de tus amigos está conectado ahora.</p>
                ) : (
                  <ul className="mb-6 grid gap-3 xl:grid-cols-2">{connected.map((r) => <FriendCard key={r.id} r={r} />)}</ul>
                )}
                <h2 className="mb-2 text-xs font-black uppercase tracking-widest text-text-muted/70">⚫ Desconectados ({offline.length})</h2>
                <ul className="grid gap-3 xl:grid-cols-2">{offline.map((r) => <FriendCard key={r.id} r={r} />)}</ul>
                <p className="mt-3 text-[11px] text-text-muted">Regalo: 1,000 🪙 al día en total. Tu amigo lo recibe cuando lo acepta en sus notificaciones.</p>
              </>
            )}

            {challenges.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-2 text-xs font-black uppercase tracking-widest text-text-muted/70">🎯 Retos en curso</h2>
                <ul className="space-y-2">
                  {challenges.map((c) => (
                    <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface px-4 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-text">{c.title}</p>
                        <p className="text-[11px] text-text-muted">{c.mine ? `Reto de ${c.other}` : `Retaste a ${c.other}`}</p>
                      </div>
                      {c.status === 'done' ? (
                        <span className="text-xs font-bold text-emerald-500">🏆 Cumplido</span>
                      ) : c.mine ? (
                        <button type="button" onClick={async () => { await completeInvite(c.id); say('¡Reto marcado como cumplido!') }} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-background">Ya lo cumplí</button>
                      ) : (
                        <span className="text-xs text-text-muted">En curso…</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-surface p-5">
              <p className="mb-1 text-sm font-bold text-text">Agregar amigo</p>
              <p className="mb-3 text-[11px] text-text-muted">Escribe su nombre con la etiqueta, como <span className="font-mono">Jafet#4821</span>. Le llegará una solicitud y tiene que aceptarla.</p>
              <form onSubmit={handleAdd} className="flex gap-2">
                <input type="text" value={newFriend} onChange={(e) => setNewFriend(e.target.value)} placeholder="Nombre#1234" className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" />
                <button type="submit" disabled={!newFriend.trim()} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background hover:bg-primary-hover disabled:opacity-50">Enviar</button>
              </form>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5">
              <p className="mb-3 text-sm font-bold text-text">📨 Solicitudes recibidas ({incoming.length})</p>
              {incoming.length === 0 ? <p className="text-sm text-text-muted">No tienes solicitudes pendientes.</p> : (
                <ul className="space-y-2.5">
                  {incoming.map((r) => (
                    <li key={r.id} className="flex items-center gap-3">
                      <Avatar name={r.name} src={r.avatar} status="offline" size={38} />
                      <p className="min-w-0 flex-1 truncate text-sm font-semibold text-text">{r.name}<span className="font-mono text-xs text-text-muted">#{r.tag}</span></p>
                      <button type="button" onClick={async () => { await respondRequest(r.id, true); say('¡Nuevo amigo!') }} className="rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-background">Aceptar</button>
                      <button type="button" onClick={() => respondRequest(r.id, false)} className="rounded-lg border border-border px-2.5 py-1 text-xs text-text-muted hover:text-danger">Rechazar</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {outgoing.length > 0 && (
              <div className="rounded-2xl border border-border bg-surface p-5">
                <p className="mb-3 text-sm font-bold text-text">⏳ Solicitudes enviadas ({outgoing.length})</p>
                <ul className="space-y-2">
                  {outgoing.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="min-w-0 truncate text-text">{r.name}<span className="font-mono text-xs text-text-muted">#{r.tag}</span></span>
                      <button type="button" onClick={() => removeFriend(r.friendId)} className="text-xs text-text-muted hover:text-danger">Cancelar</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </main>

      {inviteFor && <InviteModal friend={inviteFor} onClose={() => setInviteFor(null)} onSent={say} />}
      <MascotCompanion hideViewport />
    </div>
  )
}
