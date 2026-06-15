import { useFriendsStore } from '../../stores/useFriendsStore'
import { useVrPresenceStore } from '../../stores/useVrPresenceStore'
import { useWorldChatStore } from '../../stores/useWorldChatStore'

// Friends list: added from the "➕ Agregar amigo" option when clicking
// another player's name tag in the VR world (see PlayerMenu in VRPage).
// Online status is read live from useVrPresenceStore (only populated while
// the VR page is mounted) — "Susurrar" opens the world chat pre-filled with
// "/w <nombre> " via useWorldChatStore's whisperTarget bridge.
export default function FriendsPanel() {
  const friends = useFriendsStore((s) => s.friends)
  const removeFriend = useFriendsStore((s) => s.removeFriend)
  const players = useVrPresenceStore((s) => s.players)
  const requestWhisper = useWorldChatStore((s) => s.requestWhisper)

  const onlineNames = new Set(Object.values(players).map((p) => p?.name))

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-text">👥 Amigos</p>
      {friends.length === 0 ? (
        <p className="text-sm text-text-muted">
          Aún no tienes amigos. En el mundo VR, pulsa sobre el nombre de otro jugador y elige
          "➕ Agregar amigo".
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {friends.map((name) => {
            const online = onlineNames.has(name)
            return (
              <li
                key={name}
                className="flex items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 py-2"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-text">
                  <span>{online ? '🟢' : '⚪'}</span>
                  {name}
                </span>
                <div className="flex items-center gap-1.5">
                  {online && (
                    <button
                      type="button"
                      onClick={() => requestWhisper(name)}
                      className="rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-background transition-colors hover:bg-primary-hover"
                    >
                      🔒 Susurrar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFriend(name)}
                    className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-text-muted transition-colors hover:border-primary hover:text-primary"
                    aria-label={`Quitar a ${name} de amigos`}
                  >
                    ✖️
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
