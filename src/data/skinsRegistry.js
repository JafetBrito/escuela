// "Aspecto": cosmetic skins for the mascot. These only change the color
// palette and add a small accessory icon — the 3D model itself (geometry)
// is fixed in Configuración → Aspecto is no longer allowed to swap it.
export const SKINS = [
  { id: 'default', name: 'Original', color: null, accessory: null },
  { id: 'azul', name: 'Azul Eléctrico', color: '#3b82f6', accessory: null },
  { id: 'rosa', name: 'Rosa Chicle', color: '#ec4899', accessory: null },
  { id: 'esmeralda', name: 'Esmeralda', color: '#10b981', accessory: null },
  { id: 'dorado', name: 'Dorado Real', color: '#fbbf24', accessory: '👑' },
  { id: 'sombra', name: 'Sombra', color: '#1e293b', accessory: '🎩' },
  { id: 'fiesta', name: 'Modo Fiesta', color: '#a855f7', accessory: '🎉' },
  { id: 'lectura', name: 'Modo Estudio', color: null, accessory: '🤓' },
]

export function getSkinById(id) {
  return SKINS.find((s) => s.id === id) ?? SKINS[0]
}
