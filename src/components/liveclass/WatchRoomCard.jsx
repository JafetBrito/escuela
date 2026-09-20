import { useEffect, useState } from 'react'
import { useVrStreamStore } from '../../stores/useVrStreamStore'
import { useSocialStore } from '../../stores/useSocialStore'

// Sala de transmisión: un salón de clases en VR sin maestro, solo con la
// pantalla donde se ve el directo, que cualquiera puede crear e invitar a sus
// amigos para platicar mientras lo ven. Cada sala es una instancia aparte
// (canal propio vr:room:<código>), no el campus compartido.
const newCode = () => Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => 'abcdefghijkmnpqrstuvwxyz23456789'[b % 32]).join('')

export default function WatchRoomCard() {
  const live = useVrStreamStore((s) => !!s.embedUrl)
  const friends = useSocialStore((s) => s.friends)
  const [picked, setPicked] = useState({})
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { useSocialStore.getState().load() }, [])

  const create = async () => {
    setBusy(true)
    const code = newCode()
    const path = `/vr/sala/${code}`
    const ids = Object.keys(picked).filter((id) => picked[id])
    const results = await Promise.all(ids.map((id) => useSocialStore.getState().sendInvite(id, 'vr', 'Ver la transmisión en vivo conmigo', { path })))
    const failed = results.filter((r) => !r.ok).length
    if (failed) setMsg(`No se pudo invitar a ${failed} amigo(s).`)
    window.location.assign(path) // navegación dura: el mundo VR arranca limpio
  }

  return (
    <div className={`rounded-2xl border p-5 ${live ? 'border-red-500/40 bg-gradient-to-br from-red-600/15 to-rose-500/5' : 'border-border bg-surface'}`}>
      <p className="text-base font-extrabold text-text">{live ? '🔴 Transmisión en vivo — crea tu sala' : '📺 Sala de transmisión'}</p>
      <p className="mt-1 text-xs text-text-muted">
        Un salón de clases en VR, sin maestro, solo con la pantalla del directo. Invita a tus amigos para platicar mientras lo ven.
        {!live && ' Cuando haya una transmisión en vivo, podrás crearla aquí.'}
      </p>

      {live && (
        <>
          <div className="mt-3">
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-text-muted">Invitar amigos (opcional — tienen que aceptar)</p>
            {friends.length === 0 ? (
              <p className="text-xs text-text-muted">Aún no tienes amigos agregados; puedes crear la sala igual y compartirle el enlace a alguien.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {friends.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setPicked((p) => ({ ...p, [f.id]: !p[f.id] }))}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${picked[f.id] ? 'border-primary bg-primary/15 text-primary' : 'border-border text-text-muted hover:text-text'}`}
                  >
                    {picked[f.id] ? '✓ ' : ''}{f.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button type="button" disabled={busy} onClick={create} className="mt-4 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-black text-white hover:bg-red-500 disabled:opacity-50">
            {busy ? 'Creando…' : '🕶️ Crear sala y entrar'}
          </button>
          {msg && <p className="mt-2 text-xs text-amber-500">{msg}</p>}
        </>
      )}
    </div>
  )
}
