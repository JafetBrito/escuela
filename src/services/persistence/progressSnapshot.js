import { useAuthStore } from '../../stores/useAuthStore'
import { useMascotStore } from '../../stores/useMascotStore'
import { useProgressStore } from '../../stores/useProgressStore'
import { useChatStore } from '../../stores/useChatStore'
import { useInventoryStore } from '../../stores/useInventoryStore'
import { useItemEffectsStore } from '../../stores/useItemEffectsStore'
import { useGalleryStore } from '../../stores/useGalleryStore'
import { useCurrencyStore } from '../../stores/useCurrencyStore'
import { useShopStore } from '../../stores/useShopStore'
import { useSettingsStore } from '../../stores/useSettingsStore'

// Unified account file: contains the user's license/key, mascot + settings,
// and progress for every course (namespaced by courseId).
//   { license, selectedMascotId, settings, mascotMemory, progress,
//     onboardingCompleted, inventory, activeItems, gallery, coins,
//     purchasedItems, lastSaved }
export function buildProgressSnapshot() {
  const license = useAuthStore.getState().license
  const { selectedMascotId, memory } = useMascotStore.getState()
  const { progress, onboardingCompleted } = useProgressStore.getState()
  const { items: inventory } = useInventoryStore.getState()
  const { activeItems } = useItemEffectsStore.getState()
  const { shots: gallery } = useGalleryStore.getState()
  const { coins } = useCurrencyStore.getState()
  const { purchased: purchasedItems } = useShopStore.getState()
  const { mascotName, minimaxApiKey, chatModel } = useSettingsStore.getState()

  return {
    license,
    selectedMascotId,
    settings: { mascotName, minimaxApiKey, chatModel },
    mascotMemory: memory,
    progress,
    onboardingCompleted,
    inventory,
    activeItems,
    gallery,
    coins,
    purchasedItems,
    lastSaved: new Date().toISOString(),
  }
}

export function applyProgressSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') {
    throw new Error('Invalid account file')
  }

  if (snapshot.license) {
    useAuthStore.getState().unlock(snapshot.license)
  }

  if (typeof snapshot.selectedMascotId === 'number') {
    useMascotStore.getState().selectMascot(snapshot.selectedMascotId)
  }
  if (snapshot.mascotMemory) {
    useMascotStore.getState().loadMemory(snapshot.mascotMemory)
    useChatStore.getState().loadMessages(snapshot.mascotMemory.conversationHistory ?? [])
  }
  if (snapshot.settings) {
    useSettingsStore.getState().loadSettings(snapshot.settings)
  }

  useProgressStore.getState().loadProgress(
    snapshot.progress ?? {},
    snapshot.onboardingCompleted ?? {},
  )

  useInventoryStore.getState().loadItems(snapshot.inventory ?? [])
  useItemEffectsStore.getState().loadActiveItems(snapshot.activeItems ?? {})
  useGalleryStore.getState().loadShots(snapshot.gallery ?? [])
  useCurrencyStore.getState().loadCoins(snapshot.coins ?? 0)
  useShopStore.getState().loadPurchased(snapshot.purchasedItems ?? [])
}
