import { useEffect, useRef, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../../services/supabase/client'
import { useVrPresenceStore } from '../../stores/useVrPresenceStore'
import { useWorldChatStore } from '../../stores/useWorldChatStore'

const VR_CHANNEL = 'vr:campus'
const POSITION_INTERVAL = 120

// Same gating pattern as isSupabaseConfigured()/isNotionConfigured(): the VR
// world degrades to single-player (no remote players, local-only chat) when
// Supabase isn't configured, instead of throwing.
export function isVrRealtimeAvailable() {
  return isSupabaseConfigured()
}

// Connects the VR world to a shared Supabase Realtime channel:
// - Presence carries low-frequency roster metadata (name/mascotId/skinId),
//   mirrored into useVrPresenceStore so the player list can drive React
//   renders without thrashing on every movement tick.
// - Broadcast carries high-frequency position updates (kept in a ref, not a
//   store, so remote players can be lerped in useFrame without re-rendering)
//   and world chat messages (fed into useWorldChatStore.receiveMessage).
//
// Returns `{ remoteTransformsRef, sendChatMessage }`. When Realtime isn't
// configured, this is a no-op: the store stays disconnected/empty and
// sendChatMessage does nothing, so the world plays fine single-player.
export function useVrMultiplayer({ playerId, name, mascotId, skinId, avatarId, accountId, positionRef, rotationRef, enabled = true }) {
  const remoteTransformsRef = useRef(new Map())
  const remoteActionsRef = useRef(new Map())
  const channelRef = useRef(null)
  const joinedAtRef = useRef(Date.now())
  const [kicked, setKicked] = useState(false)
  const setConnected = useVrPresenceStore((s) => s.setConnected)
  const setPlayers = useVrPresenceStore((s) => s.setPlayers)
  const reset = useVrPresenceStore((s) => s.reset)
  const receiveMessage = useWorldChatStore((s) => s.receiveMessage)

  useEffect(() => {
    if (!enabled || !isVrRealtimeAvailable() || kicked) return

    const channel = supabase.channel(VR_CHANNEL, {
      config: { presence: { key: playerId }, broadcast: { self: false } },
    })
    channelRef.current = channel

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()

      // Single-session-per-account: if the same logged-in account is present
      // more than once (e.g. opened in a second browser tab/window), the
      // session with the OLDER `joinedAt` disconnects itself so only the
      // newest one stays connected.
      if (accountId) {
        for (const [id, presences] of Object.entries(state)) {
          if (id === playerId) continue
          const meta = presences[0]
          if (meta?.accountId === accountId && (meta.joinedAt ?? 0) > joinedAtRef.current) {
            setKicked(true)
            return
          }
        }
      }

      const players = {}
      for (const [id, presences] of Object.entries(state)) {
        if (id === playerId) continue
        const meta = presences[0]
        if (meta) players[id] = { name: meta.name, mascotId: meta.mascotId, skinId: meta.skinId, avatarId: meta.avatarId }
      }
      setPlayers(players)

      // Drop live transforms for anyone who's no longer present.
      for (const id of remoteTransformsRef.current.keys()) {
        if (!(id in players)) remoteTransformsRef.current.delete(id)
      }
    })

    channel.on('broadcast', { event: 'pos' }, ({ payload }) => {
      if (!payload || payload.id === playerId) return
      remoteTransformsRef.current.set(payload.id, payload)
    })

    // Basic class ability ("golpe") — other players just need to know it
    // happened and what class threw it, to flash the right-colored VFX;
    // unlike position, this doesn't need lerping so a plain Map write is enough.
    channel.on('broadcast', { event: 'action' }, ({ payload }) => {
      if (!payload || payload.id === playerId) return
      remoteActionsRef.current.set(payload.id, payload)
    })

    channel.on('broadcast', { event: 'chat' }, ({ payload }) => {
      if (!payload || payload.id === playerId) return
      // Whispers carry a `target` player id and are only shown to that
      // player; global messages have no `target` and go to everyone.
      if (payload.target && payload.target !== playerId) return
      receiveMessage(payload.author, payload.text, {
        authorId: payload.id,
        whisperFrom: payload.target ? payload.author : null,
      })
    })

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setConnected(true)
        channel.track({ name, mascotId, skinId, avatarId, accountId, joinedAt: joinedAtRef.current })
      }
    })

    return () => {
      setConnected(false)
      reset()
      remoteTransformsRef.current.clear()
      supabase.removeChannel(channel)
      channelRef.current = null
    }
    // Only (re)connect when the player's identity changes — name/mascot/skin
    // updates are pushed via the effect below instead of reconnecting.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId, kicked, enabled])

  // Re-broadcast presence whenever the player's displayed name/mascot/skin
  // changes (e.g. they swap mascots in the Aspecto panel mid-session).
  useEffect(() => {
    const channel = channelRef.current
    if (!channel) return
    channel.track({ name, mascotId, skinId, avatarId, accountId, joinedAt: joinedAtRef.current })
  }, [name, mascotId, skinId, avatarId, accountId])

  // Broadcast this player's position/rotation at a fixed interval. Reads
  // straight from the refs (mutated every frame by <Player>) so this effect
  // itself never needs to re-run on movement.
  useEffect(() => {
    if (!enabled || !isVrRealtimeAvailable()) return
    const interval = setInterval(() => {
      const channel = channelRef.current
      const pos = positionRef?.current
      if (!channel || !pos) return
      channel.send({
        type: 'broadcast',
        event: 'pos',
        payload: {
          id: playerId,
          x: pos.x,
          y: pos.y,
          z: pos.z,
          ry: rotationRef?.current ?? 0,
          name,
          mascotId,
          skinId,
        },
      })
    }, POSITION_INTERVAL)
    return () => clearInterval(interval)
  }, [enabled, playerId, name, mascotId, skinId, positionRef, rotationRef])

  // `targetId`, when given, sends a whisper: only the player with that id
  // (matched against `payload.target` above) will display the message.
  const sendChatMessage = (author, text, targetId) => {
    const channel = channelRef.current
    if (!channel) return
    channel.send({
      type: 'broadcast',
      event: 'chat',
      payload: { id: playerId, author, text, target: targetId ?? null },
    })
  }

  // Broadcasts a one-shot class ability ping; remote clients flash a VFX
  // over this player's last known position for a moment (see AttackBurst).
  const sendAction = (classId) => {
    const channel = channelRef.current
    if (!channel) return
    channel.send({
      type: 'broadcast',
      event: 'action',
      payload: { id: playerId, classId, ts: Date.now() },
    })
  }

  return { remoteTransformsRef, remoteActionsRef, sendChatMessage, sendAction, kicked, channelRef }
}
