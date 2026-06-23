/**
 * ============================================================================
 * 🐾 CATÁLOGO DE MASCOTAS 3D (MASCOTS)
 * ============================================================================
 * ¡ALTO AHÍ! Este es el núcleo visual de la plataforma. Aquí definimos tanto 
 * las figuras geométricas de relleno como los modelos 3D reales (.glb).
 * 
 * ⚠️ REGLA DE ORO DE LA MARCA (CUIDADO AQUÍ):
 * El "Gato Naranja" (Oliver, id: 8) es el protagonista. SIEMPRE debe estar
 * representado por un modelo 3D de un gato realista en CUATRO PATAS. 
 * Queda estrictamente PROHIBIDO reemplazar este archivo con modelos 
 * antropomórficos (con cuerpo de humano) o bípedos. La consistencia es clave.
 * 
 * 🛠️ GUÍA PASO A PASO PARA AGREGAR UN NUEVO MODELO 3D:
 * 
 * PASO 1: El Archivo
 *   - Exporta o consigue tu modelo en formato `.glb` (idealmente optimizado en Blender).
 *   - Pon el archivo físicamente en Astro: `public/tus-modelos/mi-modelo.glb`
 * 
 * PASO 2: La Ruta (El error más común)
 *   - En el campo `modelPath`, NO escribas "public". 
 *   - ✅ BIEN: `modelPath: '/tus-modelos/mi-modelo.glb'`
 * 
 * PASO 3: Calibración en el Espacio 3D (Rotación y Offset)
 *   - Los modelos exportados de Blender a menudo cargan de espaldas o flotando.
 *   - Usa `modelRotationY` para girarlo (ej. `Math.PI` lo gira 180 grados para que vea a la cámara).
 *   - Usa `modelOffsetY` (números negativos) para bajarlo si está flotando por encima del piso.
 * ============================================================================
 */

/**
 * Esquema estricto para que el editor valide las propiedades de cada Mascota.
 * @typedef {Object} Mascot
 * @property {number} id - Identificador único numérico.
 * @property {string} name - Nombre visible de la mascota o figura.
 * @property {string} [icon] - (Opcional) Emoji para la interfaz de usuario (botones, listas).
 * @property {string} geometry - Forma primitiva ('box', 'sphere', 'cat') que se usa si el .glb falla o no existe.
 * @property {string} color - Color HEX que pintará la geometría primitiva.
 * @property {string} [modelPath] - (Opcional) Ruta al .glb servido desde public/ (ej. '/orange_cat.glb').
 * @property {string} [modelSourceUrl] - (Opcional) URL de referencia de los créditos del modelo original.
 * @property {number} [modelRotationY] - (Opcional) Rotación en el eje Y en radianes para corregir modelos que dan la espalda.
 * @property {number} [modelOffsetY] - (Opcional) Desplazamiento vertical para asentar el modelo en el centro de la pantalla.
 */

/** @type {Mascot[]} */
export const MASCOTS = [
  // --- FIGURAS PRIMITIVAS (FALLBACKS) ---
  { id: 1, name: 'Cubo', geometry: 'box', color: '#98ca3f' },
  { id: 2, name: 'Esfera', geometry: 'sphere', color: '#60a5fa' },
  { id: 3, name: 'Cono', geometry: 'cone', color: '#f472b6' },
  { id: 4, name: 'Toro', geometry: 'torus', color: '#fbbf24' },
  { id: 5, name: 'Cápsula', geometry: 'capsule', color: '#a78bfa' },
  { id: 6, name: 'Octaedro', geometry: 'octahedron', color: '#34d399' },
  { id: 7, name: 'Nudo', geometry: 'torusKnot', color: '#f87171' },
  
  // --- MODELOS 3D REALES (.GLB) ---
  // Todos viven ahora bajo public/MODELOS 3D/ (antes sueltos en la raíz de
  // public/). Mago/Mago Ancestral/Zorro Mago/Lagarto Mago se movieron a la
  // subcarpeta NPC/ (siguen funcionando aquí como mascotas porque
  // vrNpcRegistry.js los reutiliza por id para varios NPCs del campus), el
  // resto vive en MASCOTAS/.
  {
    id: 8,
    name: 'Gato Naranja',
    icon: '🐱',
    geometry: 'cat',
    color: '#f97316',
    description: 'El gato legendario de Oliver School. Ágil, curioso y siempre a tu lado en cada aventura de aprendizaje.',
    modelPath: '/MODELOS 3D/MASCOTAS/orange_cat.glb',
    modelSourceUrl: 'https://sketchfab.com/3d-models/orange-cat-2b722183b60e4fcfbe3c2263536d2fa6',
    modelRotationY: Math.PI,
    modelOffsetY: -0.35,
  },
  {
    id: 9,
    name: 'Mago',
    icon: '🧙',
    geometry: 'cat',
    color: '#a78bfa',
    description: 'Un hechicero con poderes arcanos. Transforma el conocimiento en magia pura y guía al estudiante por senderos misteriosos.',
    modelPath: '/MODELOS 3D/NPC/mage.glb',
  },
  {
    id: 10,
    name: 'Mago Ancestral',
    icon: '🧙‍♂️',
    geometry: 'cat',
    color: '#818cf8',
    description: 'Sabio ancestral lleno de sabiduría milenaria. Guía con paciencia y serenidad a todo el que busca el conocimiento.',
    modelPath: '/MODELOS 3D/NPC/mage_elder.glb',
  },
  {
    id: 11,
    name: 'Zorro Mago',
    icon: '🦊',
    geometry: 'cat',
    color: '#fb923c',
    description: 'Astuto y veloz, este zorro combina magia y astucia para superar cualquier obstáculo del camino.',
    modelPath: '/MODELOS 3D/NPC/mage_fox.glb',
  },
  {
    id: 12,
    name: 'Lagarto Mago',
    icon: '🦎',
    geometry: 'cat',
    color: '#34d399',
    description: 'Guardián de los secretos naturales. Adaptable y poderoso en cualquier terreno; nunca se rinde.',
    modelPath: '/MODELOS 3D/NPC/lizard_mage.glb',
  },
  {
    id: 13,
    name: 'Perro Globo',
    icon: '🐶',
    geometry: 'cat',
    color: '#f472b6',
    description: 'Alegre e inquebrantable. Su energía positiva te mantendrá motivado ante cualquier desafío académico.',
    // ⚠️ balloon_dog.glb no está en la nueva carpeta MODELOS 3D — esta ruta
    // sigue rota hasta que se agregue el archivo. Mientras tanto cae al
    // gato de respaldo (CatMesh) por geometry: 'cat'.
    modelPath: '/balloon_dog.glb',
  },
  {
    id: 14,
    name: 'Ajo',
    icon: '🧄',
    geometry: 'cat',
    color: '#fef3c7',
    description: 'Pequeño y resistente, nunca le falta picardía. Un compañero curioso para cualquier aventura.',
    modelPath: '/MODELOS 3D/MASCOTAS/ajo.glb',
  },
  {
    id: 15,
    name: 'Toro',
    icon: '🐂',
    geometry: 'cat',
    color: '#92400e',
    description: 'Fuerte y leal, avanza sin detenerse ante ningún reto académico.',
    modelPath: '/MODELOS 3D/MASCOTAS/bull.glb',
  },
  {
    id: 16,
    name: 'Gato',
    icon: '🐈',
    geometry: 'cat',
    color: '#78716c',
    description: 'Un segundo gato, tan curioso como el original pero con su propio estilo.',
    modelPath: '/MODELOS 3D/MASCOTAS/gato.glb',
  },
  {
    id: 17,
    name: 'Búho',
    icon: '🦉',
    geometry: 'cat',
    color: '#b45309',
    description: 'Sabio y observador, ve lo que otros pasan por alto.',
    modelPath: '/MODELOS 3D/MASCOTAS/owl.glb',
  },
]

/**
 * Recupera el objeto completo de una mascota utilizando su ID.
 * Sistema a prueba de fallos: Si alguien pide un ID que no existe (o se borró),
 * siempre devolverá la primera mascota del arreglo (El Cubo por defecto) para evitar que la UI crashee.
 * 
 * @param {number} id - El ID de la mascota a buscar.
 * @returns {Mascot} El objeto de la mascota encontrada o el fallback por defecto.
 */
export function getMascotById(id) {
  return MASCOTS.find((m) => m.id === id) ?? MASCOTS[0]
}