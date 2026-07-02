import { useMemo } from 'react'
import * as THREE from 'three'

// 9 WoC classes arranged in a ring + hacker at the canopy top (admin-only).
export const WT_CLASS_NODES = {
  warrior:  { pos: [0,    2.5, -12],    color: '#c79c6e' },
  paladin:  { pos: [7.6,  2.5, -9.6],  color: '#f58cba' },
  hunter:   { pos: [12,   2.5, -2],    color: '#abd473' },
  rogue:    { pos: [11.4, 2.5,  7.0],  color: '#fff569' },
  priest:   { pos: [3.7,  2.5,  11.4], color: '#fffff0' },
  shaman:   { pos: [-3.7, 2.5,  11.4], color: '#0070de' },
  mage:     { pos: [-11.4,2.5,  7.0],  color: '#69ccf0' },
  warlock:  { pos: [-12,  2.5, -2],    color: '#9482c9' },
  druid:    { pos: [-7.6, 2.5, -9.6],  color: '#ff7d0a' },
  hacker:   { pos: [0,    15.5, 4.5],  color: '#39ff14' },
}

export function useWorldTreeGround() {
  return useMemo(() => {
    const g = new THREE.Group()

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(50, 72),
      new THREE.MeshStandardMaterial({ color: '#1a3a0c', roughness: 0.85, emissive: '#0a1e06', emissiveIntensity: 0.4 })
    )
    ground.rotation.x = -Math.PI / 2
    ground.userData.isFloor = true
    g.add(ground)

    const ringPath = new THREE.Mesh(
      new THREE.RingGeometry(10, 14, 72),
      new THREE.MeshStandardMaterial({ color: '#2a4a12', roughness: 0.9, emissive: '#142408', emissiveIntensity: 0.3 })
    )
    ringPath.rotation.x = -Math.PI / 2
    ringPath.position.y = 0.01
    g.add(ringPath)

    // ─── Trunk ───────────────────────────────────────────────────────────
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#4a2010', roughness: 0.85, emissive: '#1a0a04', emissiveIntensity: 0.2 })
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 2.4, 16, 14), trunkMat)
    trunk.position.set(0, 8, 0)
    g.add(trunk)

    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2
      const root = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.8, 4, 6), trunkMat)
      root.position.set(Math.sin(a) * 2.5, 1.8, Math.cos(a) * 2.5)
      root.rotation.z = -a * 0.4
      root.rotation.x = 0.4
      g.add(root)
    }

    // ─── Main branches (one per class) ───────────────────────────────────
    const classIds = Object.keys(WT_CLASS_NODES)

    classIds.forEach((cid) => {
      const node = WT_CLASS_NODES[cid]
      const [nx, , nz] = node.pos
      const dist = Math.sqrt(nx * nx + nz * nz)
      const angle = Math.atan2(nx, nz)
      const branchMat = new THREE.MeshStandardMaterial({ color: '#1e0a02', roughness: 0.85 })

      const length = Math.sqrt(dist * dist + (node.pos[1] + 12) ** 2) * 0.7
      const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.4, length, 6), branchMat)
      const midX = nx * 0.55
      const midY = 13 + node.pos[1] * 0.3
      const midZ = nz * 0.55
      branch.position.set(midX, midY, midZ)
      branch.rotation.z = -angle
      branch.rotation.x = Math.atan2(Math.sqrt(nx * nx + nz * nz), 12) * 0.5
      branch.rotation.y = angle
      g.add(branch)

      const leafMat = new THREE.MeshStandardMaterial({
        color: node.color,
        emissive: node.color,
        emissiveIntensity: 0.25,
        transparent: true,
        opacity: 0.7,
        roughness: 0.8,
      })
      const leafCluster = new THREE.Mesh(new THREE.SphereGeometry(1.8, 10, 8), leafMat)
      leafCluster.position.set(nx * 0.9, node.pos[1] + 15, nz * 0.9)
      g.add(leafCluster)

      const nodeMat = new THREE.MeshStandardMaterial({
        color: node.color,
        emissive: node.color,
        emissiveIntensity: 0.9,
        roughness: 0.1,
        metalness: 0.2,
      })
      const nodeSphere = new THREE.Mesh(new THREE.SphereGeometry(1.0, 20, 16), nodeMat)
      nodeSphere.position.set(nx, node.pos[1], nz)
      nodeSphere.name = `wt-node-${cid}`
      g.add(nodeSphere)

      const runeMat = new THREE.MeshStandardMaterial({
        color: node.color,
        emissive: node.color,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.5,
        roughness: 0.2,
      })
      const rune = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.08, 8, 40), runeMat)
      rune.position.set(nx, 0.08, nz)
      rune.rotation.x = -Math.PI / 2
      g.add(rune)

      const light = new THREE.PointLight(node.color, 1.2, 14)
      light.position.set(nx, node.pos[1] + 1, nz)
      g.add(light)
    })

    const canopyMat = new THREE.MeshStandardMaterial({
      color: '#0f2a06',
      emissive: '#1a4a0a',
      emissiveIntensity: 0.15,
      roughness: 0.85,
    })
    const canopy = new THREE.Mesh(new THREE.SphereGeometry(5, 14, 10), canopyMat)
    canopy.position.set(0, 18, 0)
    g.add(canopy)

    const glowMat = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      emissive: '#88ffaa',
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.25,
    })
    const glowRing = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.12, 8, 48), glowMat)
    glowRing.rotation.x = -Math.PI / 2
    glowRing.position.y = 0.05
    g.add(glowRing)

    return { model: g, groundRayHeight: 6 }
  }, [])
}
