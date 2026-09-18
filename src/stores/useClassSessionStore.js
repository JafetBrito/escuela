import { create } from 'zustand'

// Estado de la clase VR que se esté cursando ahora mismo (ver ClassroomWorld
// + ClassLessonRunner en VRPage.jsx) — session-only, nunca se persiste: no
// es progreso de cuenta, es solo "en qué punto vas de la sesión abierta".
//
// Una clase es una lista de `steps` (ver vrClassRegistry.js): 'dialogue'
// (el NPC habla, ver NpcSpeechPlayer), 'reflection' (una pregunta con
// pausa real — no avanza sola, el alumno le da "Continuar" cuando terminó
// de pensarla) o 'video' (el proyector del salón). `stepIndex` avanza de
// uno en uno; cuando se sale del último paso, `end()` habilita <ClassEndPanel>.
export const useClassSessionStore = create((set) => ({
  activeClassId: null,
  started: false, // true en cuanto el alumno le habla al NPC
  ended: false,   // true cuando ya no quedan pasos
  stepIndex: 0,
  paused: false,  // true mientras el panel de "pregunta a mitad de clase" está abierto

  setActiveClass: (classId) => set({ activeClassId: classId, started: false, ended: false, stepIndex: 0, paused: false }),
  start: () => set({ started: true }),
  nextStep: () => set((s) => ({ stepIndex: s.stepIndex + 1 })),
  end: () => set({ ended: true }),
  setPaused: (paused) => set({ paused }),
  reset: () => set({ activeClassId: null, started: false, ended: false, stepIndex: 0, paused: false }),
}))
