// Mascot definitions. Set `modelPath` to a `/models/*.glb` URL (served from
// the `public/` folder) to load a real GLTF model via drei's useGLTF;
// MascotMesh falls back to the primitive `geometry`/`color` when it's null.
export const MASCOTS = [
  { id: 1, name: 'Cubo', geometry: 'box', color: '#98ca3f' },
  { id: 2, name: 'Esfera', geometry: 'sphere', color: '#60a5fa' },
  { id: 3, name: 'Cono', geometry: 'cone', color: '#f472b6' },
  { id: 4, name: 'Toro', geometry: 'torus', color: '#fbbf24' },
  { id: 5, name: 'Cápsula', geometry: 'capsule', color: '#a78bfa' },
  { id: 6, name: 'Octaedro', geometry: 'octahedron', color: '#34d399' },
  { id: 7, name: 'Nudo', geometry: 'torusKnot', color: '#f87171' },
  {
    id: 8,
    name: 'Gato Naranja',
    icon: '🐱',
    geometry: 'cat',
    color: '#f97316',
    modelPath: '/orange_cat.glb',
    modelSourceUrl:
      'https://sketchfab.com/3d-models/orange-cat-2b722183b60e4fcfbe3c2263536d2fa6',
    // Faces away from the camera as exported, so we spin it to face forward
    // and nudge it down slightly so it sits centered in the viewport.
    modelRotationY: Math.PI,
    modelOffsetY: -0.35,
  },
  {
    id: 9,
    name: 'Mago',
    icon: '🧙',
    geometry: 'cat',
    color: '#a78bfa',
    modelPath: '/mage.glb',
  },
  {
    id: 10,
    name: 'Mago Ancestral',
    icon: '🧙‍♂️',
    geometry: 'cat',
    color: '#818cf8',
    modelPath: '/mage_elder.glb',
  },
  {
    id: 11,
    name: 'Zorro Mago',
    icon: '🦊',
    geometry: 'cat',
    color: '#fb923c',
    modelPath: '/mage_fox.glb',
  },
  {
    id: 12,
    name: 'Lagarto Mago',
    icon: '🦎',
    geometry: 'cat',
    color: '#34d399',
    modelPath: '/lizard_mage.glb',
  },
  {
    id: 13,
    name: 'Perro Globo',
    icon: '🐶',
    geometry: 'cat',
    color: '#f472b6',
    modelPath: '/balloon_dog.glb',
  },
]

export function getMascotById(id) {
  return MASCOTS.find((m) => m.id === id) ?? MASCOTS[0]
}
