import * as THREE from 'three'
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh'

// three-mesh-bvh: los rayos del Player (suelo, paredes, cámara) contra mallas grandes pasan de recorrer todos los
// triángulos a un árbol de cajas. Solo se activa en las mallas a las que se les llama `withBvh`; las demás usan el raycast normal.
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree
THREE.Mesh.prototype.raycast = acceleratedRaycast

export const withBvh = (g) => { try { g.computeBoundsTree() } catch { /* sin BVH: raycast normal */ } return g }
