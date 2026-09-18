import { create } from 'zustand'

// Estado de la clase VR que se esté cursando ahora mismo (ver ClassroomWorld
// en VRPage.jsx) — session-only, nunca se persiste: no es progreso de
// cuenta, es solo "en qué punto vas de la sesión que tienes abierta".
export const useClassSessionStore = create((set) => ({
  activeClassId: null,
  started: false, // true en cuanto el alumno le habla al NPC
  ended: false,   // true cuando el guion completo terminó de reproducirse

  setActiveClass: (classId) => set({ activeClassId: classId, started: false, ended: false }),
  start: () => set({ started: true }),
  end: () => set({ ended: true }),
  reset: () => set({ activeClassId: null, started: false, ended: false }),
}))
