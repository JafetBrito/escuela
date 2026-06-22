import { useAuthStore } from '../../stores/useAuthStore'
import { useMascotStore } from '../../stores/useMascotStore'
import { useProgressStore } from '../../stores/useProgressStore'
import { useChatStore } from '../../stores/useChatStore'
import { useChatHistoryStore } from '../../stores/useChatHistoryStore'
import { useInventoryStore } from '../../stores/useInventoryStore'
import { useItemEffectsStore } from '../../stores/useItemEffectsStore'
import { useCollectionStore } from '../../stores/useCollectionStore'
import { useGalleryStore } from '../../stores/useGalleryStore'
import { useCurrencyStore } from '../../stores/useCurrencyStore'
import { useShopStore } from '../../stores/useShopStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { useLevelStore } from '../../stores/useLevelStore'
import { useLibraryStore } from '../../stores/useLibraryStore'
import { useGamesStore } from '../../stores/useGamesStore'
import { useGlobalMissionsStore } from '../../stores/useGlobalMissionsStore'
import { useAchievementsStore } from '../../stores/useAchievementsStore'
import { useFriendsStore } from '../../stores/useFriendsStore'
import { useVrSettingsStore } from '../../stores/useVrSettingsStore'
import { useGameStore } from '../../stores/useGameStore'
import { buildProgressSnapshot, applyProgressSnapshot } from './progressSnapshot'
import { saveLocalSnapshot, loadLocalSnapshot } from './localStore'
import { supabase, isSupabaseConfigured } from '../supabase/client'
import { useSyncStatusStore } from '../../stores/useSyncStatusStore'

const STORES = [
  useAuthStore,
  useMascotStore,
  useProgressStore,
  useChatStore,
  useChatHistoryStore,
  useInventoryStore,
  useItemEffectsStore,
  useCollectionStore,
  useGalleryStore,
  useCurrencyStore,
  useShopStore,
  useSettingsStore,
  useLevelStore,
  useLibraryStore,
  useGamesStore,
  useGlobalMissionsStore,
  useAchievementsStore,
  useFriendsStore,
  useVrSettingsStore,
  useGameStore,
]

// Restores the user's account (license, progress, coins, settings, chat
// history, etc.) from localStorage on app boot, so a page reload doesn't
// lock them out of their course or reset their progress.
export function hydrateFromLocalStorage() {
  const snapshot = loadLocalSnapshot()
  if (snapshot) {
    applyProgressSnapshot(snapshot)
  }
}

// Pushes the current snapshot to profiles.snapshot so progress, mascot,
// settings and coins follow the user across devices. Debounced separately
// from the local save since it's a network call.
//
// The write used to be unchecked — if it failed (e.g. the live Supabase
// table is missing the `snapshot` column because schema.sql was never
// re-run after that column was added), nothing told the user, and the next
// login's "cloud has no snapshot yet" branch would look identical to a
// brand-new account. Logging + useSyncStatusStore make failures visible
// instead of silent.
export async function pushSnapshotToCloud() {
  if (!isSupabaseConfigured()) return
  const { user } = useAuthStore.getState()
  if (!user) return

  useSyncStatusStore.getState().setSaving()
  const snapshot = buildProgressSnapshot()
  const { error } = await supabase
    .from('profiles')
    .update({ snapshot, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) {
    console.error('[autoSave] cloud sync failed:', error)
    useSyncStatusStore.getState().setError(error.message)
  } else {
    useSyncStatusStore.getState().setSaved()
  }
}

let cloudSaveTimer = null
function scheduleCloudSave() {
  if (!isSupabaseConfigured()) return
  if (!useAuthStore.getState().user) return

  if (cloudSaveTimer) clearTimeout(cloudSaveTimer)
  cloudSaveTimer = setTimeout(pushSnapshotToCloud, 3000)
}

// Keeps the saved account snapshot in sync with every store change
// (mission/module completions, purchases, chat messages, settings, etc.).
let saveTimer = null
export function startAutoSave() {
  const scheduleSave = () => {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      saveLocalSnapshot(buildProgressSnapshot())
    }, 500)
    scheduleCloudSave()
  }

  STORES.forEach((store) => store.subscribe(scheduleSave))

  // Flush to cloud immediately when tab closes — avoids losing the last few seconds of progress
  window.addEventListener('beforeunload', () => {
    const { user, session } = useAuthStore.getState()
    if (!isSupabaseConfigured() || !user || !session?.access_token) return
    const snapshot = buildProgressSnapshot()
    // keepalive ensures the browser sends this even as the page unloads
    fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}`, {
      method: 'PATCH',
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ snapshot, updated_at: new Date().toISOString() }),
      keepalive: true,
    }).then((res) => {
      if (!res.ok) console.error('[autoSave] beforeunload cloud flush failed:', res.status)
    }).catch((err) => console.error('[autoSave] beforeunload cloud flush failed:', err))
  })
}
