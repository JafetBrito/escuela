// Identidad visual de cada academia sobre el mapa base (TEST VR, campo
// plano). Los datos de cuenta (director, miembros) viven en la tabla
// `academies` (migration_067); esto es solo cómo se ve cada una.
export const ACADEMIES = {
  filosofia: { id: 'filosofia', name: 'Academia de Filosofía', emoji: '🏛️', ground: '#8a7f6a', grid: '#b8ad94', accent: '#e8c766', props: 'columns' },
  medicina: { id: 'medicina', name: 'Academia de Medicina', emoji: '🩺', ground: '#dfe9ee', grid: '#a9c4cf', accent: '#2aa6a0', props: 'hospital' }, // ponytail: cruz simple, falta modelo .glb de hospital
  ia: { id: 'ia', name: 'Academia de IA', emoji: '🧠', ground: '#1b2233', grid: '#2f7f6f', accent: '#5ef0c0', props: 'pylons' },
}

export const getAcademy = (id) => ACADEMIES[id] ?? null
