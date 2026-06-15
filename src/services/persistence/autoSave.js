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
import { buildProgressSnapshot, applyProgressSnapshot } from './progressSnapshot'
import { saveLocalSnapshot, loadLocalSnapshot } from './localStore'
import { supabase, isSupabaseConfigured } from '../supabase/client'

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
let cloudSaveTimer = null
function scheduleCloudSave() {
  if (!isSupabaseConfigured()) return
  const { user } = useAuthStore.getState()
  if (!user) return

  if (cloudSaveTimer) clearTimeout(cloudSaveTimer)
  cloudSaveTimer = setTimeout(async () => {
    const snapshot = buildProgressSnapshot()
    await supabase
      .from('profiles')
      .update({ snapshot, updated_at: new Date().toISOString() })
      .eq('id', user.id)
  }, 3000)
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
}
