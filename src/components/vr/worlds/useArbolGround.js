import { useMemo } from 'react'
import * as THREE from 'three'

// Where Jafet stands and waits for the player to walk up — shared by the
// ground hook (visual tree position) and VrArbol's proximity check.
export const ARBOL_JAFET_POS = [2.5, 0, -4]
export const ARBOL_SPAWN = [0, 0, 4]

export function useArbolGround() {
  return useMemo(() => {
    const g = new THREE.Group()

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.MeshStandardMaterial({ color: '#0a1a0a', roughness: 1 }),
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.01
    ground.userData.isFloor = true
    g.add(ground)

    // ── Magic tree backdrop ────────────────────────────────────────────────
    const tree = new THREE.Group()
    tree.position.set(0, 0, -7)

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.4, 2.5, 8),
      new THREE.MeshStandardMaterial({ color: '#3d2b1a', roughness: 0.9 }),
    )
    trunk.position.set(0, 1, 0)
    tree.add(trunk)

    const canopy = new THREE.Mesh(
      new THREE.SphereGeometry(2, 12, 12),
      new THREE.MeshStandardMaterial({ color: '#1a4a2e', emissive: '#0d3a20', emissiveIntensity: 0.4, roughness: 0.7 }),
    )
    canopy.position.set(0, 3, 0)
    canopy.name = 'arbol-canopy'
    tree.add(canopy)

    const innerGlow = new THREE.Mesh(
      new THREE.SphereGeometry(1.3, 8, 8),
      new THREE.MeshStandardMaterial({ color: '#98ca3f', emissive: '#98ca3f', emissiveIntensity: 0.6, transparent: true, opacity: 0.18 }),
    )
    innerGlow.position.set(0, 3, 0)
    tree.add(innerGlow)

    for (let i = 0; i < 4; i++) {
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 6, 6),
        new THREE.MeshStandardMaterial({ color: '#98ca3f', emissive: '#98ca3f', emissiveIntensity: 2 }),
      )
      orb.name = `arbol-orb-${i}`
      tree.add(orb)
    }

    const glowRing = new THREE.Mesh(
      new THREE.RingGeometry(1.5, 3, 32),
      new THREE.MeshStandardMaterial({ color: '#98ca3f', emissive: '#98ca3f', emissiveIntensity: 0.3, transparent: true, opacity: 0.25 }),
    )
    glowRing.rotation.x = -Math.PI / 2
    glowRing.position.y = 0.02
    tree.add(glowRing)

    g.add(tree)

    return { model: g, groundRayHeight: 4 }
  }, [])
}
