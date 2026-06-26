import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// Shared hybrid loader for any plain imported .glb map: scales/recenters it
// so it works with the shared engine's raycasts, regardless of how big or
// small the source asset is. Used by every GLB-imported world (graffiti,
// campus, the Árbol/temple tutorial world) so the floor/scale fixes only
// live in one place.
export function useImportedGlbGround(url) {
  const { scene } = useGLTF(url)

  return useMemo(() => {
    const clone = scene.clone(true)
    // getGroundY() (Player.jsx) only counts hits on meshes flagged
    // userData.isFloor — a convention the procedural worlds set by hand on
    // their own floor meshes, but that an imported GLB never gets. Without
    // this, every ground-height raycast against an imported model (the
    // player's initial spawn snap, and the no-Rapier-collider gravity
    // fallback) silently found nothing and fell back to y=0 — which is why
    // the player could spawn floating or clipped into geometry depending on
    // what's actually at y=0 under the spawn point. Every mesh here IS the
    // walkable scenery (NPCs/props are separate siblings, not part of this
    // clone), so it's safe to flag all of them.
    clone.traverse((o) => { if (o.isMesh) o.userData.isFloor = true })
    const box = new THREE.Box3().setFromObject(clone)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)

    // Trust the GLB's own scale (glTF convention is meters, same as every
    // procedural world) across a wide sane range — only correct it if it's
    // wildly off, so the player isn't left a giant or a speck next to the
    // imported map.
    const maxDimension = Math.max(size.x, size.z) || 1
    const scale = maxDimension > 4 && maxDimension < 2000 ? 1 : 40 / maxDimension
    clone.scale.setScalar(scale)
    clone.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale)
    clone.updateMatrixWorld(true)

    // box.min.y is the lowest vertex in the WHOLE model — for an interior
    // scene that's just as likely to be a curb or basement prop as the real
    // floor. Raycast straight down through the model's own center instead
    // and use the LOWEST surface hit (the floor) — taking the first/closest
    // hit would grab a roof/ceiling instead, since the ray starts above the
    // whole model.
    const raycaster = new THREE.Raycaster()
    raycaster.set(new THREE.Vector3(0, size.y * scale + 5, 0), new THREE.Vector3(0, -1, 0))
    const hits = raycaster.intersectObject(clone, true)
    if (hits.length > 0) {
      const lowestY = Math.min(...hits.map((h) => h.point.y))
      clone.position.y -= lowestY
    }

    const groundRayHeight = size.y * scale + 5
    return { model: clone, groundRayHeight, footprintX: size.x * scale, footprintZ: size.z * scale }
  }, [scene])
}
