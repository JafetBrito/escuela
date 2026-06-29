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
import { usePopupPositionStore } from '../../stores/usePopupPositionStore'
import { useGlobalMissionsStore } from '../../stores/useGlobalMissionsStore'
import { useAchievementsStore } from '../../stores/useAchievementsStore'
import { useFriendsStore } from '../../stores/useFriendsStore'
import { useVrSettingsStore } from '../../stores/useVrSettingsStore'
import { useGameStore } from '../../stores/useGameStore'
import { useTutorialStore } from '../../stores/useTutorialStore'
import { useDailyRewardsStore } from '../../stores/useDailyRewardsStore'
import { useQuestsStore } from '../../stores/useQuestsStore'
import { useTerminalRewardsStore } from '../../stores/useTerminalRewardsStore'
import { useVoiceStore } from '../../stores/useVoiceStore'
import { useEquipmentStore } from '../../stores/useEquipmentStore'
import { useSeenStore } from '../../stores/useSeenStore'

// Unified account file: contains the user's license/key, mascot + settings,
// and progress for every course (namespaced by courseId).
//   { license, selectedMascotId, settings, mascotMemory, progress,
//     onboardingCompleted, inventory, activeItems, gallery, coins,
//     purchasedItems, chatHistory, lastSaved }
export function buildProgressSnapshot() {
  const { license, googleUser, user } = useAuthStore.getState()
  const { selectedMascotId, selectedSkinId, unlockedMascots, memory } = useMascotStore.getState()
  const { progress, onboardingCompleted } = useProgressStore.getState()
  const { items: inventory } = useInventoryStore.getState()
  const { activeItems } = useItemEffectsStore.getState()
  const { items: collectionItems } = useCollectionStore.getState()
  const { shots: gallery } = useGalleryStore.getState()
  const { coins } = useCurrencyStore.getState()
  const { purchased: purchasedItems } = useShopStore.getState()
  const { history: chatHistory } = useChatHistoryStore.getState()
  const { xp } = useLevelStore.getState()
  const { lastLocations: libraryLocations, openedBooks } = useLibraryStore.getState()
  const { positions: popupPositions } = usePopupPositionStore.getState()
  const { accepted: globalMissionsAccepted, claimed: globalMissionsClaimed } =
    useGlobalMissionsStore.getState()
  const { unlocked: unlockedAchievements } = useAchievementsStore.getState()
  const { friends } = useFriendsStore.getState()
  const { claimedRewards: gamesClaimedRewards } = useGamesStore.getState()
  const {
    cameraMode,
    mouseSensitivity,
    invertY,
    cameraDistance,
    cameraHeight,
    zoomMin,
    zoomMax,
    pitchMin,
    pitchMax,
    fov,
  } = useVrSettingsStore.getState()
  const { player: gamePlayer, oliver: gameOliver, worldTreeCompleted } = useGameStore.getState()
  const {
    mascotName,
    activeCredentialId,
    temperature,
    maxTokens,
    identity,
    soulRules,
    userProfile,
    aiTone,
    aiVerbosity,
    customInstructions,
    agentMode,
    toolsEnabled,
    heartbeatEnabled,
    heartbeatMinutes,
    notionDatabaseId,
  } = useSettingsStore.getState()

  return {
    userId: user?.id ?? null,
    license,
    googleUser,
    selectedMascotId,
    selectedSkinId,
    unlockedMascots,
    settings: {
      mascotName,
      activeCredentialId,
      temperature,
      maxTokens,
      identity,
      soulRules,
      userProfile,
      aiTone,
      aiVerbosity,
      customInstructions,
      agentMode,
      toolsEnabled,
      heartbeatEnabled,
      heartbeatMinutes,
      notionDatabaseId,
    },
    mascotMemory: memory,
    progress,
    onboardingCompleted,
    inventory,
    activeItems,
    collectionItems,
    gallery,
    coins,
    purchasedItems,
    chatHistory,
    xp,
    libraryLocations,
    openedBooks,
    popupPositions,
    globalMissions: { accepted: globalMissionsAccepted, claimed: globalMissionsClaimed },
    unlockedAchievements,
    friends,
    gamesClaimedRewards,
    vrSettings: {
      cameraMode,
      mouseSensitivity,
      invertY,
      cameraDistance,
      cameraHeight,
      zoomMin,
      zoomMax,
      pitchMin,
      pitchMax,
      fov,
    },
    gameState: { player: gamePlayer, oliver: gameOliver, worldTreeCompleted },
    tutorial: useTutorialStore.getState(),
    dailyRewards: useDailyRewardsStore.getState(),
    quests: useQuestsStore.getState(),
    terminalRewards: useTerminalRewardsStore.getState(),
    voice: useVoiceStore.getState(),
    equippedItems: useEquipmentStore.getState().equipped,
    seen: useSeenStore.getState(),
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
  if (snapshot.googleUser) {
    useAuthStore.getState().loadGoogleUser(snapshot.googleUser)
  }

  if (typeof snapshot.selectedMascotId === 'number') {
    useMascotStore.getState().selectMascot(snapshot.selectedMascotId)
  }
  useMascotStore.getState().loadSkin(snapshot.selectedSkinId)
  useMascotStore.getState().loadUnlockedMascots(snapshot.unlockedMascots)
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
  useCollectionStore.getState().loadItems(snapshot.collectionItems ?? [])
  useGalleryStore.getState().loadShots(snapshot.gallery ?? [])
  useCurrencyStore.getState().loadCoins(snapshot.coins)
  useShopStore.getState().loadPurchased(snapshot.purchasedItems ?? [])
  useChatHistoryStore.getState().loadHistory(snapshot.chatHistory ?? {})
  useLevelStore.getState().loadXp(snapshot.xp)
  useLibraryStore.getState().loadLastLocations(snapshot.libraryLocations ?? {})
  useLibraryStore.getState().loadOpenedBooks(snapshot.openedBooks ?? [])
  usePopupPositionStore.getState().loadPositions(snapshot.popupPositions ?? {})
  useGlobalMissionsStore.getState().loadGlobalMissions(snapshot.globalMissions ?? {})
  useAchievementsStore.getState().loadUnlocked(snapshot.unlockedAchievements ?? [])
  useFriendsStore.getState().loadFriends(snapshot.friends ?? [])
  useGamesStore.getState().loadClaimedRewards(snapshot.gamesClaimedRewards ?? {})
  useVrSettingsStore.getState().loadVrSettings(snapshot.vrSettings ?? {})
  useGameStore.getState().loadGameState(snapshot.gameState ?? null)
  useTutorialStore.getState().loadTutorial(snapshot.tutorial ?? null)
  useDailyRewardsStore.getState().loadDailyRewards(snapshot.dailyRewards ?? {})
  useQuestsStore.getState().loadQuests(snapshot.quests ?? {})
  useTerminalRewardsStore.getState().loadTerminalRewards(snapshot.terminalRewards ?? {})
  useVoiceStore.getState().loadVoice(snapshot.voice ?? {})
  useEquipmentStore.getState().loadEquipped(snapshot.equippedItems)
  useSeenStore.getState().loadSeen(snapshot.seen)
}
