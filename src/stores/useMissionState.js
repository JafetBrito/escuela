import { useChatStore } from './useChatStore'
import { useChatHistoryStore } from './useChatHistoryStore'
import { useProgressStore } from './useProgressStore'
import { useItemEffectsStore } from './useItemEffectsStore'
import { useShopStore } from './useShopStore'
import { useLibraryStore } from './useLibraryStore'
import { useMascotStore } from './useMascotStore'
import { useLevelStore, levelForXp } from './useLevelStore'
import { useFriendsStore } from './useFriendsStore'

// Combines state from several stores into the flat object consumed by
// GLOBAL_MISSIONS' `check(state)` functions (see globalMissionsRegistry.js).
export function useMissionState() {
  const currentMessages = useChatStore((s) => s.messages)
  const chatHistory = useChatHistoryStore((s) => s.history)
  const progress = useProgressStore((s) => s.progress)
  const activeItems = useItemEffectsStore((s) => s.activeItems)
  const purchased = useShopStore((s) => s.purchased)
  const openedBooks = useLibraryStore((s) => s.openedBooks)
  const selectedSkinId = useMascotStore((s) => s.selectedSkinId)
  const level = useLevelStore((s) => levelForXp(s.xp))
  const friendsCount = useFriendsStore((s) => s.friends.length)

  const historyMessages = Object.values(chatHistory).reduce(
    (sum, sessions) => sum + sessions.reduce((s2, session) => s2 + (session.messages?.length ?? 0), 0),
    0,
  )

  const completedModules = Object.values(progress).reduce(
    (sum, courseState) =>
      sum + (courseState.moduleProgress?.filter((m) => m.completed).length ?? 0),
    0,
  )

  return {
    totalChatMessages: currentMessages.length + historyMessages,
    completedModules,
    hasActiveItem: Object.values(activeItems).some(Boolean),
    purchasedCount: purchased.length,
    booksOpened: openedBooks.length,
    selectedSkinId,
    level,
    friendsCount,
  }
}
