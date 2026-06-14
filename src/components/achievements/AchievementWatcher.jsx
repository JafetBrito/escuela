import { useEffect } from 'react'
import { COURSES_DATA } from '../../data/courseRegistry'
import { getAllAchievements, isCourseCompleted } from '../../data/achievementsRegistry'
import { useAchievementsStore } from '../../stores/useAchievementsStore'
import { useProgressStore } from '../../stores/useProgressStore'
import { useInventoryStore } from '../../stores/useInventoryStore'
import { useCollectionStore } from '../../stores/useCollectionStore'
import { useGalleryStore } from '../../stores/useGalleryStore'
import { useCurrencyStore } from '../../stores/useCurrencyStore'
import { useShopStore } from '../../stores/useShopStore'
import { useLevelStore, levelForXp } from '../../stores/useLevelStore'
import { useChatStore } from '../../stores/useChatStore'
import { useChatHistoryStore } from '../../stores/useChatHistoryStore'
import { useLibraryStore } from '../../stores/useLibraryStore'
import { useGlobalMissionsStore } from '../../stores/useGlobalMissionsStore'
import { useMascotStore } from '../../stores/useMascotStore'
import { playAchievementSound } from '../../utils/sound'

const COURSES = Object.values(COURSES_DATA)
const ALL_ACHIEVEMENTS = getAllAchievements(COURSES)

function buildAchievementState(unlockedCount) {
  const { progress } = useProgressStore.getState()

  let completedModules = 0
  let completedCourses = 0
  for (const course of COURSES) {
    const mp = progress[course.courseId]?.moduleProgress ?? []
    completedModules += mp.filter((p) => p.completed).length
    if (isCourseCompleted(course, mp)) completedCourses++
  }

  const { items: inventory } = useInventoryStore.getState()
  const { items: collectionItems } = useCollectionStore.getState()
  const { shots: gallery } = useGalleryStore.getState()
  const { coins } = useCurrencyStore.getState()
  const { purchased } = useShopStore.getState()
  const { xp } = useLevelStore.getState()
  const { messages } = useChatStore.getState()
  const { history } = useChatHistoryStore.getState()
  const { openedBooks } = useLibraryStore.getState()
  const { claimed } = useGlobalMissionsStore.getState()
  const { selectedSkinId } = useMascotStore.getState()

  let historyMessages = 0
  for (const sessions of Object.values(history)) {
    for (const session of sessions) {
      historyMessages += session.messages?.length ?? 0
    }
  }

  return {
    completedModules,
    completedCourses,
    totalCourses: COURSES.length,
    inventoryCount: inventory.length,
    collectionCount: collectionItems.length,
    galleryCount: gallery.length,
    coins,
    purchasedCount: purchased.length,
    level: levelForXp(xp),
    totalChatMessages: messages.length + historyMessages,
    booksOpened: openedBooks.length,
    globalMissionsClaimed: claimed.length,
    selectedSkinId,
    unlockedCount,
    hour: new Date().getHours(),
  }
}

function runAchievementCheck() {
  const { unlocked, unlock } = useAchievementsStore.getState()
  if (unlocked.length === ALL_ACHIEVEMENTS.length) return

  const state = buildAchievementState(unlocked.length)

  for (const achievement of ALL_ACHIEVEMENTS) {
    if (unlocked.includes(achievement.id)) continue
    if (achievement.check(state)) {
      const isNew = unlock(achievement)
      if (isNew) playAchievementSound()
    }
  }
}

// Achievement medals need a `check(state)` — course medals don't define one
// in the registry (their progress is computed from `progress` directly), so
// wrap them here with the same isCourseCompleted logic.
for (const achievement of ALL_ACHIEVEMENTS) {
  if (achievement.check) continue
  const courseId = achievement.id.replace(/^course-/, '')
  const course = COURSES.find((c) => c.courseId === courseId)
  achievement.check = () => {
    if (!course) return false
    const mp = useProgressStore.getState().progress[courseId]?.moduleProgress ?? []
    return isCourseCompleted(course, mp)
  }
}

// Mounted once near the root of the app. Has no UI — it subscribes to every
// store that feeds achievement conditions and unlocks medals as soon as the
// player meets them, queuing a toast (AchievementToast) + sound.
export default function AchievementWatcher() {
  useEffect(() => {
    runAchievementCheck()

    const stores = [
      useProgressStore,
      useInventoryStore,
      useCollectionStore,
      useGalleryStore,
      useCurrencyStore,
      useShopStore,
      useLevelStore,
      useChatStore,
      useChatHistoryStore,
      useLibraryStore,
      useGlobalMissionsStore,
      useMascotStore,
    ]
    const unsubscribers = stores.map((store) => store.subscribe(runAchievementCheck))
    return () => unsubscribers.forEach((unsub) => unsub())
  }, [])

  return null
}

export { ALL_ACHIEVEMENTS }
