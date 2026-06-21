import { useMemo } from 'react'
import * as THREE from 'three'
import { VR_NPCS } from '../../../data/vrNpcRegistry'

export const GROUND_RADIUS = 130
export const NPC_BUILDING_OFFSET = 1.8

// NPCs that now stand next to a real, purpose-built structure (library,
// academic quad, innovation plaza, market) instead of the generic round
// gazebo every other VR_NPC gets — building one there too would look
// redundant/wrong next to real architecture. Shared with VRPage's minimap,
// which skips the same NPCs' "log cabin" marker for the same reason.
export const NPC_PAVILION_EXEMPT = new Set(['director', 'bibliotecaria', 'explorador', 'zafir', 'sastre'])

// Dormitories — two clear 2x2 clusters flanking the south approach to the
// Portal Nexus, instead of scattered individually around the ring roads.
export const CAMPUS_DORMS = [
  { pos: [50, 0, 55],  color: '#8a7a6a' },
  { pos: [50, 0, 72],  color: '#7a8a6a' },
  { pos: [70, 0, 55],  color: '#6a7a8a' },
  { pos: [70, 0, 72],  color: '#8a6a7a' },
  { pos: [-50, 0, 55], color: '#7a6a8a' },
  { pos: [-50, 0, 72], color: '#6a8a7a' },
  { pos: [-70, 0, 55], color: '#8a8a6a' },
  { pos: [-70, 0, 72], color: '#6a8a8a' },
]

// Draws short bold text onto an offscreen canvas and returns it as a
// THREE.Texture — cheap building signage without needing real fonts/glyphs
// baked into geometry or a GLB asset.
function makeSignTexture(text, w = 512, h = 128) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#161412'
  ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = '#d4a820'
  ctx.lineWidth = 6
  ctx.strokeRect(3, 3, w - 6, h - 6)
  ctx.fillStyle = '#f0e8d8'
  ctx.font = `bold ${Math.floor(h * 0.34)}px Georgia, serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, w / 2, h / 2)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

export function useCampusGround() {
  return useMemo(() => {
    const group = new THREE.Group()

    // ── Materials ─────────────────────────────────────────────────────────
    const matGrass     = new THREE.MeshStandardMaterial({ color: '#4a8a3a' })
    const matGrassOut  = new THREE.MeshStandardMaterial({ color: '#5ea848' })
    const matLawn      = new THREE.MeshStandardMaterial({ color: '#5aa044' })
    const matPath      = new THREE.MeshStandardMaterial({ color: '#c8bc9c' })
    const matRoad      = new THREE.MeshStandardMaterial({ color: '#a8a090' })
    const matPlaza     = new THREE.MeshStandardMaterial({ color: '#d0c8b8' })
    const matGranite   = new THREE.MeshStandardMaterial({ color: '#beb8a8' })
    const matStone     = new THREE.MeshStandardMaterial({ color: '#909090' })
    const matColumn    = new THREE.MeshStandardMaterial({ color: '#e8e4d8' })
    const matCream     = new THREE.MeshStandardMaterial({ color: '#d4c4a0' })
    const matPlinth    = new THREE.MeshStandardMaterial({ color: '#5a5048' })
    const matBrickBrn  = new THREE.MeshStandardMaterial({ color: '#7a5a3a' })
    const matBrickBlu  = new THREE.MeshStandardMaterial({ color: '#3a5a7a' })
    const matRoof      = new THREE.MeshStandardMaterial({ color: '#7a3830' })
    const matRedCA     = new THREE.MeshStandardMaterial({ color: '#d52b1e' })
    const matGold      = new THREE.MeshStandardMaterial({ color: '#d4a820', emissive: '#b08010', emissiveIntensity: 0.28 })
    const matPoolWater = new THREE.MeshStandardMaterial({ color: '#1a7abf', transparent: true, opacity: 0.88, emissive: '#0a5080', emissiveIntensity: 0.1 })
    const matGlass     = new THREE.MeshStandardMaterial({ color: '#88c8f8', transparent: true, opacity: 0.55, emissive: '#4488a8', emissiveIntensity: 0.2 })
    const matGlassTeal = new THREE.MeshStandardMaterial({ color: '#7ad8c8', transparent: true, opacity: 0.6, emissive: '#2a9888', emissiveIntensity: 0.3 })
    const matNexus     = new THREE.MeshStandardMaterial({ color: '#2a2840' })
    const matNexusDk   = new THREE.MeshStandardMaterial({ color: '#181828' })
    const matWood      = new THREE.MeshStandardMaterial({ color: '#8b6234' })
    const matKioskA     = new THREE.MeshStandardMaterial({ color: '#a8623a' })
    const matKioskB     = new THREE.MeshStandardMaterial({ color: '#3a8a6a' })
    const matKioskC     = new THREE.MeshStandardMaterial({ color: '#a87a2a' })
    const matTrunk     = new THREE.MeshStandardMaterial({ color: '#6b4520' })
    const matFolA      = new THREE.MeshStandardMaterial({ color: '#2d6b1a' })
    const matFolB      = new THREE.MeshStandardMaterial({ color: '#3d8a28' })
    const matMapleRed  = new THREE.MeshStandardMaterial({ color: '#c42020' })
    const matPole      = new THREE.MeshStandardMaterial({ color: '#2a2830' })
    const matBulb      = new THREE.MeshStandardMaterial({ color: '#ffe890', emissive: '#ffd050', emissiveIntensity: 1.8 })
    const matFount     = new THREE.MeshStandardMaterial({ color: '#b0a898' })
    const matWater     = new THREE.MeshStandardMaterial({ color: '#2888cc', transparent: true, opacity: 0.75 })
    const matBench     = new THREE.MeshStandardMaterial({ color: '#4a3a28' })
    const matAmphi     = new THREE.MeshStandardMaterial({ color: '#bcb2a0' })

    // ── Path helper ───────────────────────────────────────────────────────
    const addPath = (x1, z1, x2, z2, width, mat = matPath) => {
      const dx = x2 - x1; const dz = z2 - z1
      const len = Math.hypot(dx, dz)
      if (len < 0.01) return
      const g = new THREE.Group()
      g.position.set((x1 + x2) / 2, 0.014, (z1 + z2) / 2)
      g.rotation.y = Math.atan2(-dx, -dz)
      const p = new THREE.Mesh(new THREE.PlaneGeometry(width, len), mat)
      p.rotation.x = -Math.PI / 2
      p.userData.isFloor = true
      g.add(p)
      group.add(g)
    }

    // Plinth (base course) + signboard — reused by every named building so
    // they read as "buildings" instead of plain boxes, without modeling.
    const addPlinth = (x, z, w, d, h = 0.45) => {
      const p = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, h, d + 0.6), matPlinth)
      p.position.set(x, h / 2, z)
      group.add(p)
    }
    const addSign = (x, y, z, rotY, text, w = 4.2, h = 1.05) => {
      const tex = makeSignTexture(text)
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex }))
      mesh.position.set(x, y, z)
      mesh.rotation.y = rotY
      group.add(mesh)
    }
    const addBench = (x, z, rotY = 0) => {
      const g = new THREE.Group()
      g.position.set(x, 0, z)
      g.rotation.y = rotY
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.5), matBench)
      seat.position.y = 0.45
      g.add(seat)
      ;[-0.65, 0.65].forEach((lx) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.45, 0.5), matBench)
        leg.position.set(lx, 0.225, 0)
        g.add(leg)
      })
      group.add(g)
    }

    // ── 1. GROUND ─────────────────────────────────────────────────────────
    const ground = new THREE.Mesh(new THREE.CircleGeometry(GROUND_RADIUS, 80), matGrass)
    ground.rotation.x = -Math.PI / 2
    ground.userData.isFloor = true
    group.add(ground)
    const outerRing = new THREE.Mesh(new THREE.RingGeometry(82, GROUND_RADIUS, 80), matGrassOut)
    outerRing.rotation.x = -Math.PI / 2
    outerRing.position.y = 0.005
    outerRing.userData.isFloor = true
    group.add(outerRing)

    // ── 2. RING ROADS ─────────────────────────────────────────────────────
    ;[[21, 25], [45, 49], [72, 76], [102, 106]].forEach(([ri, ro]) => {
      const ring = new THREE.Mesh(new THREE.RingGeometry(ri, ro, 72), matRoad)
      ring.rotation.x = -Math.PI / 2
      ring.position.y = 0.012
      ring.userData.isFloor = true
      group.add(ring)
    })

    // ── 3. CARDINAL ROADS + SPOKE PATHS ──────────────────────────────────
    addPath(0, 0, 0, -(GROUND_RADIUS - 5), 7, matRoad)
    addPath(0, 0, 0,  GROUND_RADIUS - 5,   7, matRoad)
    addPath(0, 0,  GROUND_RADIUS - 5, 0,   7, matRoad)
    addPath(0, 0, -(GROUND_RADIUS - 5), 0, 7, matRoad)
    VR_NPCS.forEach((npc) => {
      const [nx, , nz] = npc.position
      const d = Math.hypot(nx, nz)
      addPath(0, 0, nx * 50 / d, nz * 50 / d, 4)
    })
    addPath(0, -22, 0, -74, 9, matPath)
    addPath(22, 0, 76, 0, 6, matPath)
    addPath(-22, 0, -76, 0, 6, matPath)

    // ── 4. CENTRAL PLAZA ──────────────────────────────────────────────────
    const plaza = new THREE.Mesh(new THREE.CircleGeometry(11, 8), matPlaza)
    plaza.rotation.x = -Math.PI / 2
    plaza.position.y = 0.018
    plaza.userData.isFloor = true
    group.add(plaza)
    const plazaRing = new THREE.Mesh(new THREE.RingGeometry(9, 11, 8), matGranite)
    plazaRing.rotation.x = -Math.PI / 2
    plazaRing.position.y = 0.022
    group.add(plazaRing)

    // ── 5. TORCH MONUMENT ────────────────────────────────────────────────────
    ;[[3.8, 0.35, 0.175], [2.6, 0.35, 0.525], [1.7, 0.35, 0.875]].forEach(([r, h, cy]) => {
      const step = new THREE.Mesh(new THREE.CylinderGeometry(r, r + 0.14, h, 12), matGranite)
      step.position.set(-7, cy, 0)
      group.add(step)
    })
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.60, 7.4, 12), matStone)
    pillar.position.set(-7, 4.85, 0)
    group.add(pillar)
    const goldCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.74, 0.26, 16), matGold)
    goldCollar.position.set(-7, 8.63, 0)
    group.add(goldCollar)
    const torchCup = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.34, 0.72, 12, 1, true), matGold)
    torchCup.position.set(-7, 9.12, 0)
    group.add(torchCup)
    const torchRim = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.08, 8, 20), matGold)
    torchRim.rotation.x = Math.PI / 2; torchRim.position.set(-7, 9.48, 0)
    group.add(torchRim)
    const torchBase = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.12, 12), matGold)
    torchBase.position.set(-7, 8.82, 0)
    group.add(torchBase)
    const matFlameOuter = new THREE.MeshStandardMaterial({ color: '#ff5500', emissive: '#ff3300', emissiveIntensity: 1.8, transparent: true, opacity: 0.92 })
    const matFlameInner = new THREE.MeshStandardMaterial({ color: '#ffcc00', emissive: '#ffaa00', emissiveIntensity: 2.8, transparent: true, opacity: 0.97 })
    const flameGlow = new THREE.Mesh(new THREE.SphereGeometry(0.48, 9, 7), matFlameOuter)
    flameGlow.scale.set(1, 1.25, 1); flameGlow.position.set(-7, 9.95, 0)
    group.add(flameGlow)
    const flameTip = new THREE.Mesh(new THREE.ConeGeometry(0.30, 1.35, 8), matFlameOuter)
    flameTip.position.set(-7, 10.85, 0)
    group.add(flameTip)
    const flameCore = new THREE.Mesh(new THREE.SphereGeometry(0.26, 8, 6), matFlameInner)
    flameCore.scale.set(1, 1.3, 1); flameCore.position.set(-7, 9.9, 0)
    group.add(flameCore)
    const flameCoreTip = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.9, 7), matFlameInner)
    flameCoreTip.position.set(-7, 10.65, 0)
    group.add(flameCoreTip)

    // ── 6. FOUNTAIN ───────────────────────────────────────────────────────
    const fBase = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.8, 0.45, 20), matFount)
    fBase.position.set(7, 0.225, 0)
    group.add(fBase)
    const fPool = new THREE.Mesh(new THREE.CircleGeometry(2.0, 20), matPoolWater)
    fPool.rotation.x = -Math.PI / 2; fPool.position.set(7, 0.46, 0); fPool.userData.isFloor = true
    group.add(fPool)
    const fRing = new THREE.Mesh(new THREE.RingGeometry(2.0, 2.6, 20), matFount)
    fRing.rotation.x = -Math.PI / 2; fRing.position.set(7, 0.47, 0)
    group.add(fRing)
    const fSpire = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.18, 2.2, 8), matFount)
    fSpire.position.set(7, 1.6, 0); group.add(fSpire)
    const fSpray = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 6), matWater)
    fSpray.position.set(7, 2.8, 0); fSpray.scale.set(1, 0.5, 1); group.add(fSpray)

    // ── 7. NPC PAVILIONS ──────────────────────────────────────────────────
    // Skipped for NPCs that now stand next to real architecture instead
    // (see NPC_PAVILION_EXEMPT) — a generic gazebo there would look stray.
    VR_NPCS.forEach((npc) => {
      if (NPC_PAVILION_EXEMPT.has(npc.id)) return
      const [nx, , nz] = npc.position
      const bx = nx * NPC_BUILDING_OFFSET, bz = nz * NPC_BUILDING_OFFSET
      const pavBase = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.8, 0.4, 6), matGranite)
      pavBase.position.set(bx, 0.2, bz); group.add(pavBase)
      ;[0, Math.PI / 2, Math.PI, Math.PI * 3 / 2].forEach((ca) => {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 3.2, 8), matColumn)
        col.position.set(bx + Math.sin(ca) * 1.8, 2.0, bz + Math.cos(ca) * 1.8)
        group.add(col)
      })
      const pavRoof = new THREE.Mesh(new THREE.ConeGeometry(2.4, 2.2, 6), matRoof)
      pavRoof.position.set(bx, 4.3, bz); group.add(pavRoof)
      const roofRing = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.14, 6, 16), matRedCA)
      roofRing.rotation.x = Math.PI / 2; roofRing.position.set(bx, 3.2, bz); group.add(roofRing)
    })

    // ── 8. GRAND LECTURE HALL (anchors the academic quad, north) ─────────
    const GX = 0, GZ = -62
    const ghBody = new THREE.Mesh(new THREE.BoxGeometry(30, 13, 18), matCream)
    ghBody.position.set(GX, 6.5, GZ); group.add(ghBody)
    addPlinth(GX, GZ, 30, 18, 0.5)
    ;[-17, 17].forEach((ox) => {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(8, 9, 12), matCream)
      wing.position.set(GX + ox, 4.5, GZ + 2); group.add(wing)
      const wr = new THREE.Mesh(new THREE.BoxGeometry(8.5, 1, 12.5), matRoof)
      wr.position.set(GX + ox, 9.5, GZ + 2); group.add(wr)
    })
    for (let ci = 0; ci < 6; ci++) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.64, 11.5, 12), matColumn)
      col.position.set(GX - 11.5 + ci * 4.6, 5.75, GZ - 7.5); group.add(col)
    }
    const ghPed = new THREE.Mesh(new THREE.BoxGeometry(28, 3.2, 1.2), matColumn)
    ghPed.position.set(GX, 14.3, GZ - 7.5); group.add(ghPed)
    const ghCornice = new THREE.Mesh(new THREE.BoxGeometry(32, 0.8, 20), matRedCA)
    ghCornice.position.set(GX, 13.4, GZ); group.add(ghCornice)
    const ghRoof = new THREE.Mesh(new THREE.BoxGeometry(32, 0.7, 20), matRoof)
    ghRoof.position.set(GX, 14.1, GZ); group.add(ghRoof)
    ;[[24, 0.5, GZ - 9.0], [20, 0.5, GZ - 11.0], [16, 0.5, GZ - 13.0]].forEach(([w, h, pz], idx) => {
      const step = new THREE.Mesh(new THREE.BoxGeometry(w, h, 2.0), matColumn)
      step.position.set(GX, h / 2 + idx * h, pz); group.add(step)
    })
    ;[4, 8].forEach((wy) => {
      for (let wi = -2; wi <= 2; wi++) {
        const win = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 3.5), matGlass)
        win.position.set(GX + wi * 5.5, wy, GZ - 9.08); group.add(win)
      }
    })
    const ghBanner = new THREE.Mesh(new THREE.BoxGeometry(14, 1.2, 0.25), matRedCA)
    ghBanner.position.set(GX, 12.1, GZ - 7.4); group.add(ghBanner)
    addSign(GX, 12.1, GZ - 7.55, 0, 'GRAN AULA', 9, 1.3)

    // ── 8b. ACADEMIC QUAD LAWN — connects Hall + Library + Ciencias ──────
    const quadLawn = new THREE.Mesh(new THREE.PlaneGeometry(70, 24), matLawn)
    quadLawn.rotation.x = -Math.PI / 2
    quadLawn.position.set(GX, 0.01, -46)
    quadLawn.userData.isFloor = true
    group.add(quadLawn)
    ;[[-14, -38], [14, -38], [-14, -54], [14, -54]].forEach(([bx, bz]) => addBench(bx, bz, bx < 0 ? Math.PI / 2 : -Math.PI / 2))

    // ── 9. LIBRARY (west wing of the academic quad, faces the lawn) ──────
    const LX = -30, LZ = -58
    const libBody = new THREE.Mesh(new THREE.BoxGeometry(18, 11, 14), matBrickBrn)
    libBody.position.set(LX, 5.5, LZ); group.add(libBody)
    addPlinth(LX, LZ, 18, 14)
    const libRoof = new THREE.Mesh(new THREE.BoxGeometry(19, 1, 15), matRoof)
    libRoof.position.set(LX, 11.5, LZ); group.add(libRoof)
    ;[-2, 2].forEach((cx) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.48, 9, 10), matColumn)
      col.position.set(LX + cx, 4.5, LZ + 7.05); group.add(col)
    })
    const libPed = new THREE.Mesh(new THREE.BoxGeometry(16, 2.5, 0.8), matColumn)
    libPed.position.set(LX, 12.25, LZ + 7.05); group.add(libPed)
    for (let wi = -3; wi <= 3; wi += 2) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(2, 3), matGlass)
      win.position.set(LX + wi * 2.5, 5.5, LZ + 7.06); group.add(win)
    }
    addSign(LX, 9.6, LZ + 7.1, 0, 'BIBLIOTECA', 7.5, 1.2)

    // ── 10. FACULTAD DE CIENCIA + IA (east wing, mirrors the library) ────
    const AX = 30, AZ = -58
    const admBody = new THREE.Mesh(new THREE.BoxGeometry(16, 10, 13), matBrickBlu)
    admBody.position.set(AX, 5, AZ); group.add(admBody)
    addPlinth(AX, AZ, 16, 13)
    const admRoof = new THREE.Mesh(new THREE.BoxGeometry(17, 0.9, 14), matRoof)
    admRoof.position.set(AX, 10.45, AZ); group.add(admRoof)
    const admCor = new THREE.Mesh(new THREE.BoxGeometry(17, 0.6, 14), matRedCA)
    admCor.position.set(AX, 10.0, AZ); group.add(admCor)
    for (let wi = -2; wi <= 2; wi++) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(2, 2.8), matGlassTeal)
      win.position.set(AX + wi * 2.8, 5, AZ + 6.51); group.add(win)
    }
    addSign(AX, 8.8, AZ + 6.6, 0, 'CIENCIA + IA', 7.5, 1.2)

    // ── 11. PLAZA DE INNOVACIÓN (east — replaces the old swimming pool) ──
    const PX = 70, PZ = 0
    const innoFloor = new THREE.Mesh(new THREE.CircleGeometry(28, 40), matPlaza)
    innoFloor.rotation.x = -Math.PI / 2
    innoFloor.position.set(PX, 0.012, PZ)
    innoFloor.userData.isFloor = true
    group.add(innoFloor)
    const innoBody = new THREE.Mesh(new THREE.BoxGeometry(14, 9, 12), matBrickBlu)
    innoBody.position.set(PX - 14, 4.5, PZ - 8); group.add(innoBody)
    addPlinth(PX - 14, PZ - 8, 14, 12)
    const innoRoof = new THREE.Mesh(new THREE.BoxGeometry(15, 0.8, 13), matRoof)
    innoRoof.position.set(PX - 14, 9.4, PZ - 8); group.add(innoRoof)
    for (let wi = -2; wi <= 2; wi++) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 4.2), matGlassTeal)
      win.position.set(PX - 14 + wi * 2.6, 4.6, PZ - 1.95); group.add(win)
    }
    addSign(PX - 14, 8.0, PZ - 1.85, 0, 'CENTRO DE INNOVACIÓN', 9, 1.1)
    // Outdoor amphitheater — concentric stepped rings (same technique as the
    // torch monument's steps), a cheap "outdoor classroom" with real function.
    ;[[8.5, 0.4, 0.2], [6.5, 0.4, 0.6], [4.5, 0.4, 1.0]].forEach(([r, h, cy]) => {
      const step = new THREE.Mesh(new THREE.CylinderGeometry(r, r + 0.5, h, 24), matAmphi)
      step.position.set(PX + 12, cy, PZ + 10)
      group.add(step)
    })
    const innoStage = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.8, 0.3, 20), matGranite)
    innoStage.position.set(PX + 12, 1.35, PZ + 10); group.add(innoStage)

    // ── 12. PLAZA DEL MERCADO (west — replaces the old forest hut) ───────
    const MX = -64, MZ = 0
    const marketFloor = new THREE.Mesh(new THREE.CircleGeometry(16, 28), matPath)
    marketFloor.rotation.x = -Math.PI / 2
    marketFloor.position.set(MX, 0.015, MZ)
    marketFloor.userData.isFloor = true
    group.add(marketFloor)
    ;[
      { x: MX - 9, z: MZ - 6, mat: matKioskA },
      { x: MX + 2, z: MZ + 7, mat: matKioskB },
      { x: MX + 9, z: MZ - 4, mat: matKioskC },
    ].forEach(({ x, z, mat }, i) => {
      const body = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.4, 3.2), matWood)
      body.position.set(x, 1.2, z); group.add(body)
      const canopy = new THREE.Mesh(new THREE.ConeGeometry(2.8, 1.6, 4), mat)
      canopy.position.set(x, 3.2, z); canopy.rotation.y = (i * Math.PI) / 4; group.add(canopy)
    })
    addSign(MX, 4.3, MZ - 11, 0, 'MERCADO', 6, 1.1)

    // ── 13. PORTAL NEXUS (south) ──────────────────────────────────────────
    const nexusPlaza = new THREE.Mesh(new THREE.CircleGeometry(30, 16), matNexus)
    nexusPlaza.rotation.x = -Math.PI / 2; nexusPlaza.position.set(0, 0.014, 70)
    nexusPlaza.userData.isFloor = true; group.add(nexusPlaza)
    const nexusRing = new THREE.Mesh(new THREE.RingGeometry(27, 30.5, 16), matNexusDk)
    nexusRing.rotation.x = -Math.PI / 2; nexusRing.position.set(0, 0.02, 70); group.add(nexusRing)
    ;[-12, 12].forEach((ox) => {
      const gp = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 11, 8), matNexus)
      gp.position.set(ox, 5.5, 46); group.add(gp)
      const gpc = new THREE.Mesh(new THREE.SphereGeometry(1.1, 8, 6), matNexusDk)
      gpc.position.set(ox, 11.55, 46); group.add(gpc)
    })
    const gateArch = new THREE.Mesh(new THREE.BoxGeometry(27, 1.5, 1.2), matNexus)
    gateArch.position.set(0, 11.25, 46); group.add(gateArch)
    const gateSign = new THREE.Mesh(new THREE.BoxGeometry(12, 1.8, 0.4), matNexusDk)
    gateSign.position.set(0, 9.5, 45.7); group.add(gateSign)
    ;[-25, 25].forEach((ox) => {
      const sw = new THREE.Mesh(new THREE.BoxGeometry(1.2, 7, 50), matNexus)
      sw.position.set(ox, 3.5, 70); group.add(sw)
    })
    const nexusBack = new THREE.Mesh(new THREE.BoxGeometry(52, 7, 1.2), matNexus)
    nexusBack.position.set(0, 3.5, 95); group.add(nexusBack)

    // ── 14. DORMITORIES (two clusters, SE + SW) ───────────────────────────
    CAMPUS_DORMS.forEach(({ pos, color }) => {
      const [bx, , bz] = pos
      const dorm = new THREE.Mesh(new THREE.BoxGeometry(12, 8.5, 10), new THREE.MeshStandardMaterial({ color }))
      dorm.position.set(bx, 4.25, bz); group.add(dorm)
      const dr = new THREE.Mesh(new THREE.BoxGeometry(13, 1.0, 11), matRoof)
      dr.position.set(bx, 8.75, bz); group.add(dr)
      for (let wr = 0; wr < 2; wr++) {
        for (let wi = -1; wi <= 1; wi++) {
          const win = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.8), matGlass)
          win.position.set(bx + wi * 3.5, 2.5 + wr * 3.5, bz + 5.06); group.add(win)
        }
      }
      const fstrip = new THREE.Mesh(new THREE.BoxGeometry(6, 0.5, 0.1), matRedCA)
      fstrip.position.set(bx, 8.2, bz + 5.08); group.add(fstrip)
    })

    // ── 15. MAPLE TREES (InstancedMesh) ──────────────────────────────────
    const rng = (seed) => { const v = Math.sin(seed * 127.1) * 43758.5453; return v - Math.floor(v) }
    const rawTrees = []
    // Forest belt, thinned out where the academic quad / market plaza sit.
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        const tx = -44 - col * 5.5 + (row % 2) * 2.5
        const tz = -32 + row * 10 + rng(row * 7 + col) * 4 - 2
        if (Math.hypot(tx, tz) > 87) continue
        if (Math.hypot(tx - MX, tz - MZ) < 20) continue
        rawTrees.push({ x: tx, z: tz, s: 0.8 + rng(row * 14 + col) * 0.25 })
      }
    }
    for (let i = 0; i < 8; i++) {
      const tz = -30 - i * 4.5; if (tz < -62) break
      rawTrees.push({ x: 9, z: tz, s: 0.88 }); rawTrees.push({ x: -9, z: tz, s: 0.88 })
    }
    // Perimeter ring of trees lines the new (bigger) fence instead of the
    // old radius, with gaps left around every functional zone.
    for (let i = 0; i < 56; i++) {
      const angle = (i / 56) * Math.PI * 2
      const tx = Math.sin(angle) * (113 + rng(i * 5.3) * 8)
      const tz = Math.cos(angle) * (113 + rng(i * 7.1) * 8)
      if (Math.hypot(tx - PX, tz - PZ) < 36) continue          // Plaza de Innovación
      if (Math.hypot(tx - MX, tz - MZ) < 22) continue          // Plaza del Mercado
      if (tz > 40 && Math.abs(tx) < 32) continue                // Nexo de Portales
      if (tz < -50 && Math.abs(tx) < 42) continue                // Cuadrángulo académico
      if ((Math.hypot(tx - 60, tz - 63) < 18) || (Math.hypot(tx + 60, tz - 63) < 18)) continue // dorm clusters
      rawTrees.push({ x: tx, z: tz, s: 1.0 + rng(i * 11.3) * 0.25 })
    }
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI / 6 + (i / 6) * Math.PI * 2
      const tx = Math.sin(angle) * 32, tz = Math.cos(angle) * 32
      if (tz < -28 || (tx > 0 && tz < 0)) continue
      rawTrees.push({ x: tx, z: tz, s: 0.85 })
    }
    ;[-20, -12, 12, 20].forEach((tx) => rawTrees.push({ x: tx, z: 42, s: 1.0 }))

    const TREE_COUNT = rawTrees.length
    const trunkGeo  = new THREE.CylinderGeometry(0.22, 0.32, 4.0, 7)
    const fol1Geo   = new THREE.SphereGeometry(2.5, 8, 6)
    const fol2Geo   = new THREE.SphereGeometry(1.8, 7, 5)
    const redTopGeo = new THREE.SphereGeometry(1.0, 6, 4)
    const dummy     = new THREE.Object3D()

    const trunkInst  = new THREE.InstancedMesh(trunkGeo, matTrunk, TREE_COUNT)
    const fol1Inst   = new THREE.InstancedMesh(fol1Geo, matFolA, TREE_COUNT)
    const fol2Inst   = new THREE.InstancedMesh(fol2Geo, matFolB, TREE_COUNT)
    const redTopInst = new THREE.InstancedMesh(redTopGeo, matMapleRed, TREE_COUNT)
    ;[trunkInst, fol1Inst, fol2Inst, redTopInst].forEach((m) => { m.raycast = () => {} })

    rawTrees.forEach(({ x, z, s }, i) => {
      dummy.rotation.y = rng(i * 3.3) * Math.PI * 2
      dummy.scale.setScalar(s)
      dummy.position.set(x, 2.0 * s, z); dummy.updateMatrix(); trunkInst.setMatrixAt(i, dummy.matrix)
      dummy.position.set(x, 4.5 * s, z); dummy.updateMatrix(); fol1Inst.setMatrixAt(i, dummy.matrix)
      dummy.position.set(x, 5.8 * s, z); dummy.updateMatrix(); fol2Inst.setMatrixAt(i, dummy.matrix)
      dummy.scale.setScalar(s * 0.65); dummy.position.set(x, 7.0 * s, z); dummy.updateMatrix(); redTopInst.setMatrixAt(i, dummy.matrix)
    })
    ;[trunkInst, fol1Inst, fol2Inst, redTopInst].forEach((m) => { m.instanceMatrix.needsUpdate = true })
    group.add(trunkInst, fol1Inst, fol2Inst, redTopInst)

    // ── 16. LAMP POSTS (InstancedMesh) ────────────────────────────────────
    const lampPos = []
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2
      lampPos.push([Math.sin(a) * 23.5, Math.cos(a) * 23.5])
    }
    ;[0, Math.PI / 2, Math.PI, Math.PI * 3 / 2].forEach((a) => {
      ;[15, 30, 44, 58, 80].forEach((r) => {
        const perp = a + Math.PI / 2
        lampPos.push(
          [Math.cos(a) * r + Math.cos(perp) * 4.2, Math.sin(a) * r + Math.sin(perp) * 4.2],
          [Math.cos(a) * r - Math.cos(perp) * 4.2, Math.sin(a) * r - Math.sin(perp) * 4.2],
        )
      })
    })
    const poleGeo  = new THREE.CylinderGeometry(0.07, 0.09, 5.5, 8)
    const bulbGeo  = new THREE.SphereGeometry(0.28, 8, 6)
    const poleInst = new THREE.InstancedMesh(poleGeo, matPole, lampPos.length)
    const bulbInst = new THREE.InstancedMesh(bulbGeo, matBulb, lampPos.length)
    lampPos.forEach(([lx, lz], i) => {
      dummy.scale.setScalar(1); dummy.rotation.set(0, 0, 0)
      dummy.position.set(lx, 2.75, lz); dummy.updateMatrix(); poleInst.setMatrixAt(i, dummy.matrix)
      dummy.position.set(lx, 5.65, lz); dummy.updateMatrix(); bulbInst.setMatrixAt(i, dummy.matrix)
    })
    ;[poleInst, bulbInst].forEach((m) => { m.instanceMatrix.needsUpdate = true; m.raycast = () => {} })
    group.add(poleInst, bulbInst)

    // ── 17. PERIMETER: STONE FENCE + GATE POSTS ───────────────────────────
    const FENCE_SEGS = 96
    const arcLen = (2 * Math.PI * GROUND_RADIUS) / FENCE_SEGS * 1.03
    const fenceGeo = new THREE.BoxGeometry(arcLen, 1.8, 0.45)
    const gateSet  = new Set()
    ;[0, 24, 48, 72].forEach((b) => { gateSet.add(b); gateSet.add((b + 1) % FENCE_SEGS) })
    const fenceSegs = Array.from({ length: FENCE_SEGS }, (_, i) => i).filter((i) => !gateSet.has(i))
    const fenceInst = new THREE.InstancedMesh(fenceGeo, matGranite, fenceSegs.length)
    fenceSegs.forEach((idx, i) => {
      const a = (idx / FENCE_SEGS) * Math.PI * 2
      dummy.position.set(Math.sin(a) * GROUND_RADIUS, 0.9, Math.cos(a) * GROUND_RADIUS)
      dummy.rotation.set(0, a, 0); dummy.scale.setScalar(1); dummy.updateMatrix()
      fenceInst.setMatrixAt(i, dummy.matrix)
    })
    fenceInst.instanceMatrix.needsUpdate = true; fenceInst.raycast = () => {}
    group.add(fenceInst)
    ;[0, Math.PI / 2, Math.PI, Math.PI * 3 / 2].forEach((a) => {
      const sx = Math.sin(a); const cz = Math.cos(a); const px = Math.cos(a); const pz = -Math.sin(a)
      ;[-5.5, 5.5].forEach((off) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.62, 5.5, 8), matGranite)
        post.position.set(sx * GROUND_RADIUS + px * off, 2.75, cz * GROUND_RADIUS + pz * off)
        group.add(post)
        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.65, 8, 6), matRedCA)
        cap.position.set(sx * GROUND_RADIUS + px * off, 5.85, cz * GROUND_RADIUS + pz * off)
        group.add(cap)
      })
      const bar = new THREE.Mesh(new THREE.BoxGeometry(13.5, 0.45, 0.45), matGranite)
      bar.position.set(sx * GROUND_RADIUS, 5.7, cz * GROUND_RADIUS); bar.rotation.y = a
      group.add(bar)
    })

    return { model: group, groundRayHeight: 22 }
  }, [])
}
