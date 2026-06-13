import { create } from 'zustand'
import { getCourseData } from '../data/courseRegistry'
import { getModuleMissions, MISSION_TYPES } from '../data/missionsRegistry'
import { useCurrencyStore } from './useCurrencyStore'

const emptyCourseState = () => ({
  selectedModuleId: null,
  moduleProgress: [],
  moduleMissions: {},
})

// Stable empty references for selector fallbacks (e.g.
// `s.progress[courseId]?.moduleProgress ?? EMPTY_ARRAY`) so React's
// useSyncExternalStore doesn't see a "new" value on every render.
export const EMPTY_ARRAY = []
export const EMPTY_OBJECT = {}

// All progress is namespaced by courseId so multiple courses (e.g. the main
// NotebookLM course and the 2-class demo course) can be tracked
// independently without their module ids (1, 2, 3…) colliding.
export const useProgressStore = create((set, get) => ({
  progress: {}, // { [courseId]: { selectedModuleId, moduleProgress, moduleMissions } }
  onboardingCompleted: {}, // { [courseId]: boolean }

  getCourseProgress: (courseId) => get().progress[courseId] ?? emptyCourseState(),

  getSelectedModuleId: (courseId) => {
    const courseData = getCourseData(courseId)
    return get().progress[courseId]?.selectedModuleId ?? courseData.modules[0]?.id
  },

  isOnboardingCompleted: (courseId) => !!get().onboardingCompleted[courseId],

  completeOnboarding: (courseId) =>
    set((state) => ({
      onboardingCompleted: { ...state.onboardingCompleted, [courseId]: true },
    })),

  isMissionDone: (courseId, moduleId, missionId) =>
    !!get().progress[courseId]?.moduleMissions[moduleId]?.[missionId],

  areMissionsComplete: (courseId, module) => {
    const done = get().progress[courseId]?.moduleMissions[module.id] ?? {}
    return getModuleMissions(module).every((m) => done[m.id])
  },

  // Completes a single mission for a module. When every mission for that
  // module is done, the module itself is marked complete (unlocks the next
  // one and awards the course medal once all modules are done).
  completeMission: (courseId, moduleId, missionId) =>
    set((state) => {
      const courseState = state.progress[courseId] ?? emptyCourseState()
      const current = courseState.moduleMissions[moduleId] ?? {}
      if (current[missionId]) return {}

      const reward = MISSION_TYPES[missionId]?.reward ?? 0
      if (reward > 0) useCurrencyStore.getState().earnCoins(reward)

      const updatedMissions = { ...current, [missionId]: true }
      const courseData = getCourseData(courseId)
      const moduleData = courseData.modules.find((m) => m.id === moduleId)
      const allDone = moduleData
        ? getModuleMissions(moduleData).every((m) => updatedMissions[m.id])
        : false

      let moduleProgress = courseState.moduleProgress
      if (allDone) {
        const existing = moduleProgress.find((p) => p.moduleId === moduleId)
        moduleProgress = existing
          ? moduleProgress.map((p) =>
              p.moduleId === moduleId ? { ...p, completed: true } : p,
            )
          : [...moduleProgress, { moduleId, completed: true, exerciseAnswers: {}, notes: '' }]
      }

      return {
        progress: {
          ...state.progress,
          [courseId]: {
            ...courseState,
            moduleMissions: { ...courseState.moduleMissions, [moduleId]: updatedMissions },
            moduleProgress,
          },
        },
      }
    }),

  // Modules unlock sequentially: the first module is always open, module N
  // requires module N-1's quiz to be passed (moduleProgress[].completed === true).
  isModuleUnlocked: (courseId, id) => {
    const courseData = getCourseData(courseId)
    const targetModule = courseData.modules.find((m) => m.id === id)
    if (!targetModule) return false

    const firstOrder = Math.min(...courseData.modules.map((m) => m.order))
    if (targetModule.order === firstOrder) return true

    const prevModule = courseData.modules.find((m) => m.order === targetModule.order - 1)
    if (!prevModule) return true

    const moduleProgress = get().progress[courseId]?.moduleProgress ?? []
    return moduleProgress.some((p) => p.moduleId === prevModule.id && p.completed)
  },

  setSelectedModule: (courseId, id) => {
    if (!get().isModuleUnlocked(courseId, id)) return
    set((state) => ({
      progress: {
        ...state.progress,
        [courseId]: {
          ...(state.progress[courseId] ?? emptyCourseState()),
          selectedModuleId: id,
        },
      },
    }))
  },

  markModuleComplete: (courseId, id) =>
    set((state) => {
      const courseState = state.progress[courseId] ?? emptyCourseState()
      const existing = courseState.moduleProgress.find((m) => m.moduleId === id)
      const moduleProgress = existing
        ? courseState.moduleProgress.map((m) =>
            m.moduleId === id ? { ...m, completed: true } : m,
          )
        : [...courseState.moduleProgress, { moduleId: id, completed: true, exerciseAnswers: {}, notes: '' }]

      return {
        progress: { ...state.progress, [courseId]: { ...courseState, moduleProgress } },
      }
    }),

  setModuleNote: (courseId, id, notes) =>
    set((state) => {
      const courseState = state.progress[courseId] ?? emptyCourseState()
      const existing = courseState.moduleProgress.find((m) => m.moduleId === id)
      const moduleProgress = existing
        ? courseState.moduleProgress.map((m) => (m.moduleId === id ? { ...m, notes } : m))
        : [...courseState.moduleProgress, { moduleId: id, completed: false, exerciseAnswers: {}, notes }]

      return {
        progress: { ...state.progress, [courseId]: { ...courseState, moduleProgress } },
      }
    }),

  loadProgress: (progress, onboardingCompleted) =>
    set({ progress: progress ?? {}, onboardingCompleted: onboardingCompleted ?? {} }),
}))
