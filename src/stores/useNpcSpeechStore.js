import { create } from 'zustand'

// Estado del discurso programado que esté sonando ahora mismo (ver
// NpcSpeechPlayer.jsx) — lo consume tanto el NPC 3D (para no interrumpirse a
// sí mismo con una línea suelta) como <NpcDialogueBox> (la caja de diálogo
// estilo RPG en la interfaz 2D, fuera del <Canvas>).
export const useNpcSpeechStore = create((set) => ({
  activeNpcId: null,
  npc: null,            // { id, name, emoji, position, ... } — para el retrato/portada
  chunkText: '',
  chunkIndex: 0,
  chunkTotal: 0,
  // Solo true cuando el jugador local está físicamente cerca del NPC que
  // habla (ver SPEECH_HEAR_RADIUS en NpcSpeechPlayer.jsx) — la caja de
  // diálogo y el audio solo existen para quien está cerca; quien está lejos
  // ni se entera hasta que camina hacia allá.
  isNear: false,

  setActive: (npc) => set({ activeNpcId: npc?.id ?? null, npc }),
  setChunk: (chunkText, chunkIndex, chunkTotal) => set({ chunkText, chunkIndex, chunkTotal }),
  setIsNear: (isNear) => set({ isNear }),
  clear: () => set({ activeNpcId: null, npc: null, chunkText: '', chunkIndex: 0, chunkTotal: 0, isNear: false }),
}))
