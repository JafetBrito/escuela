import { useAuthStore } from '../../stores/useAuthStore'
import { useMascotStore } from '../../stores/useMascotStore'
import { useProgressStore } from '../../stores/useProgressStore'
import { useChatStore } from '../../stores/useChatStore'
import { useChatHistoryStore } from '../../stores/useChatHistoryStore'
import { useInventoryStore } from '../../stores/useInventoryStore'
import { useItemEffectsStore } from '../../stores/useItemEffectsStore'
import { useGalleryStore } from '../../stores/useGalleryStore'
import { useCurrencyStore } from '../../stores/useCurrencyStore'
import { useShopStore } from '../../stores/useShopStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { useLevelStore } from '../../stores/useLevelStore'
import { useLibraryStore } from '../../stores/useLibraryStore'
import { useGamesStore } from '../../stores/useGamesStore'
import { buildProgressSnapshot, applyProgressSnapshot } from './progressSnapshot'
import { saveLocalSnapshot, loadLocalSnapshot } from './localStore'

const STORES = [
  useAuthStore,
  useMascotStore,
  useProgressStore,
  useChatStore,
  useChatHistoryStore,
  useInventoryStore,
  useItemEffectsStore,
  useGalleryStore,
  useCurrencyStore,
  useShopStore,
  useSettingsStore,
  useLevelStore,
  useLibraryStore,
  useGamesStore,
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

// Keeps the saved account snapshot in sync with every store change
// (mission/module completions, purchases, chat messages, settings, etc.).
let saveTimer = null
export function startAutoSave() {
  const scheduleSave = () => {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      saveLocalSnapshot(buildProgressSnapshot())
    }, 500)
  }

  STORES.forEach((store) => store.subscribe(scheduleSave))
}
