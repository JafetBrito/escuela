// Comida de la mascota del Hub (fuente única: la lee itemDb/raw.js y usePetStore). `fx` = cuánto sube cada necesidad (0-100).
export const PET_FOOD_ROWS = [
  { key: 'pet-galleta', icon: '🍪', name: ['Galleta de datos', 'Data cookie'], description: ['Una galletita crujiente de bits. Siempre gratis para que tu mascota nunca se quede sin comer.', 'A crunchy bit cookie. Always free so your pet never goes hungry.'], quality: 'common', price: 0, fx: { hunger: 12, mood: 2 } },
  { key: 'pet-manzana', icon: '🍎', name: ['Manzana de bytes', 'Byte apple'], description: ['Fruta fresca de la nube: sacia y alegra.', 'Fresh fruit from the cloud: filling and cheerful.'], quality: 'common', price: 1500, fx: { hunger: 26, mood: 5 } },
  { key: 'pet-pizza', icon: '🍕', name: ['Pizza de píxeles', 'Pixel pizza'], description: ['Una porción enorme. Llena el estómago y levanta el ánimo.', 'A huge slice. Fills the belly and lifts the mood.'], quality: 'uncommon', price: 4000, fx: { hunger: 45, mood: 12 } },
  { key: 'pet-cafe', icon: '☕', name: ['Café de enfoque', 'Focus coffee'], description: ['Devuelve energía y despierta la curiosidad para estudiar.', 'Restores energy and sparks curiosity for studying.'], quality: 'uncommon', price: 2500, fx: { hunger: 6, energy: 30, curiosity: 10 } },
]
