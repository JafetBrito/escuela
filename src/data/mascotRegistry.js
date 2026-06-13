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
    geometry: 'cat',
    color: '#f97316',
    // To use a real 3D model: download a .glb (respecting its license),
    // place it at public/models/orange-cat.glb, and set modelPath below to
    // '/models/orange-cat.glb'. MascotMesh will load it automatically.
    modelPath: null,
    modelSourceUrl:
      'https://sketchfab.com/3d-models/orange-cat-2b722183b60e4fcfbe3c2263536d2fa6',
  },
]

export function getMascotById(id) {
  return MASCOTS.find((m) => m.id === id) ?? MASCOTS[0]
}
