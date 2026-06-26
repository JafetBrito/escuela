import { create } from 'zustand'
import { TUTORIAL_MISSIONS } from '../data/tutorialMissions'
import { useLevelStore } from './useLevelStore'

export const useTutorialStore = create((set, get) => ({
  done: [],       // ids of completed mission steps
  // Set by VrArbol right before sending the player to /vr/world-tree for the
  // "choose_classes" step — VRPage's class-selection flow checks this and
  // navigates back here instead of its normal default (/vr) once both
  // classes are picked, then clears it. null outside the tutorial, so a
  // returning player who visits WorldTree directly keeps the normal flow.
  returnTo: null,
  setReturnTo: (path) => set({ returnTo: path }),

  completeStep(id) {
    const { done } = get()
    if (done.includes(id)) return
    const mission = TUTORIAL_MISSIONS.find(m => m.id === id)
    if (mission?.xp) useLevelStore.getState().addXp(mission.xp)
    set({ done: [...done, id] })
  },

  isTutorialComplete() {
    const { done } = get()
    // Tutorial is done when all non-skippable missions are complete
    const required = TUTORIAL_MISSIONS.filter(m => !m.skippable)
    return required.every(m => done.includes(m.id))
  },

  loadTutorial(data) {
    set({ done: data?.done ?? [] })
  },

  reset() {
    set({ done: [] })
  },
}))
