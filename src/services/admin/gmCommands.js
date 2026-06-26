import { supabase } from '../supabase/client'
import { useShopStore } from '../../stores/useShopStore'
import { useCurrencyStore } from '../../stores/useCurrencyStore'
import { useLevelStore, XP_PER_LEVEL } from '../../stores/useLevelStore'
import { useMascotStore } from '../../stores/useMascotStore'
import { getShopItemById, SHOP_ITEMS } from '../../data/shopRegistry'
import { pushSnapshotToCloud } from '../persistence/autoSave'

export const SELF_TARGET = 'yo'

// Finds players by email or display_name — only works once the "profiles:
// admin select all" RLS policy from schema.sql is applied, otherwise an
// admin can only ever see their own row.
export async function findPlayers(query) {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, display_name, role')
    .or(`email.ilike.%${query}%,display_name.ilike.%${query}%`)
    .limit(10)
  if (error) throw error
  return data ?? []
}

// Reads a target player's cloud snapshot, lets `mutate` change it in place
// (or return a replacement), then writes it straight back — used for any
// player other than the admin themself, since their stores aren't loaded
// in this browser.
async function mutateRemoteSnapshot(targetId, mutate) {
  const { data: row, error: fetchError } = await supabase
    .from('profiles')
    .select('snapshot')
    .eq('id', targetId)
    .single()
  if (fetchError) throw fetchError

  const snapshot = row?.snapshot ?? {}
  const next = mutate(snapshot) ?? snapshot
  next.lastSaved = new Date().toISOString()

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ snapshot: next, updated_at: new Date().toISOString() })
    .eq('id', targetId)
  if (updateError) throw updateError
}

// Runs one GM command against `targetId` (SELF_TARGET = the admin's own
// account, applied through the live stores so the UI updates immediately;
// otherwise a player's profile id, applied directly to their cloud
// snapshot). Returns a short confirmation string for the console log.
export async function runGmCommand(targetId, name, args) {
  const isSelf = targetId === SELF_TARGET
  const arg = args[0]

  switch (name) {
    case 'additem': {
      if (!getShopItemById(arg)) throw new Error(`Objeto desconocido: ${arg}. Usa /items para ver la lista.`)
      if (isSelf) {
        useShopStore.setState((s) => (s.purchased.includes(arg) ? s : { purchased: [...s.purchased, arg] }))
        await pushSnapshotToCloud()
      } else {
        await mutateRemoteSnapshot(targetId, (snap) => {
          const purchasedItems = snap.purchasedItems ?? []
          if (!purchasedItems.includes(arg)) snap.purchasedItems = [...purchasedItems, arg]
        })
      }
      return `✅ Objeto "${arg}" añadido.`
    }

    case 'removeitem': {
      if (isSelf) {
        useShopStore.setState((s) => ({ purchased: s.purchased.filter((id) => id !== arg) }))
        await pushSnapshotToCloud()
      } else {
        await mutateRemoteSnapshot(targetId, (snap) => {
          snap.purchasedItems = (snap.purchasedItems ?? []).filter((id) => id !== arg)
        })
      }
      return `✅ Objeto "${arg}" eliminado.`
    }

    case 'addcoins': {
      const amount = Number(arg)
      if (!Number.isFinite(amount)) throw new Error('Cantidad inválida.')
      if (isSelf) {
        useCurrencyStore.getState().earnCoins(amount)
        await pushSnapshotToCloud()
      } else {
        await mutateRemoteSnapshot(targetId, (snap) => {
          snap.coins = (snap.coins ?? 0) + amount
        })
      }
      return `✅ ${amount} cobre añadido.`
    }

    case 'setlevel': {
      const level = Number(arg)
      if (!Number.isFinite(level) || level < 1) throw new Error('Nivel inválido.')
      const xp = (level - 1) * XP_PER_LEVEL
      if (isSelf) {
        useLevelStore.getState().loadXp(xp)
        await pushSnapshotToCloud()
      } else {
        await mutateRemoteSnapshot(targetId, (snap) => { snap.xp = xp })
      }
      return `✅ Nivel ${level} aplicado.`
    }

    // Unlike /setlevel (silent — used to jump straight to a level), this goes
    // through addXp() so the level-up banner/sound actually fires, for
    // testing how leveling up looks/feels.
    case 'addxp': {
      const amount = Number(arg)
      if (!Number.isFinite(amount)) throw new Error('Cantidad de XP inválida.')
      if (isSelf) {
        const { level, leveledUp } = useLevelStore.getState().addXp(amount)
        await pushSnapshotToCloud()
        return leveledUp ? `✅ +${amount} XP — ¡subiste a nivel ${level}!` : `✅ +${amount} XP.`
      }
      await mutateRemoteSnapshot(targetId, (snap) => { snap.xp = Math.max(0, (snap.xp ?? 0) + amount) })
      return `✅ +${amount} XP añadidos (no verá el aviso de nivel hasta que recargue).`
    }

    case 'unlockmascot': {
      const id = Number(arg)
      if (!Number.isFinite(id)) throw new Error('ID de mascota inválido.')
      if (isSelf) {
        useMascotStore.getState().unlockMascot(id)
        await pushSnapshotToCloud()
      } else {
        await mutateRemoteSnapshot(targetId, (snap) => {
          const unlockedMascots = snap.unlockedMascots ?? [8]
          if (!unlockedMascots.includes(id)) snap.unlockedMascots = [...unlockedMascots, id]
        })
      }
      return `✅ Mascota ${id} desbloqueada.`
    }

    default:
      throw new Error(`Comando desconocido: /${name}. Escribe /help.`)
  }
}

export function listShopItemIds() {
  return SHOP_ITEMS.map((i) => `${i.id} — ${i.name}`)
}

// Grants/revokes live voice (mic dictation in VR world chat) for whichever
// player matches `query` by email or display name. Admins always have
// voice regardless of this flag (see useAuthStore.canUseVoice) — this is
// only for handing it to a specific other player without making them admin.
export async function setVoicePermission(query, enabled) {
  const players = await findPlayers(query)
  if (!players.length) throw new Error('No se encontró ningún jugador con ese correo/nombre.')
  const player = players[0]
  const { error } = await supabase
    .from('profiles')
    .update({ voice_enabled: enabled })
    .eq('id', player.id)
  if (error) throw error
  return player
}
