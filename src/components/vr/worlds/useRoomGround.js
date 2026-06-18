import { useMemo } from 'react'
import * as THREE from 'three'

export const ROOM_SIZE = 28
export const ROOM_HEIGHT = 5.5

export function useRoomGround() {
  return useMemo(() => {
    const group = new THREE.Group()
    const hw = ROOM_SIZE / 2  // 14

    // ── Materials ─────────────────────────────────────────────────────────
    const matFloor   = new THREE.MeshStandardMaterial({ color: '#b8863a' })
    const matFloorDk = new THREE.MeshStandardMaterial({ color: '#9a6c28' })
    const matWall    = new THREE.MeshStandardMaterial({ color: '#f0ece0' })
    const matWains   = new THREE.MeshStandardMaterial({ color: '#8b6234' })
    const matCeiling = new THREE.MeshStandardMaterial({ color: '#f5f2ea', side: THREE.BackSide })
    const matBeam    = new THREE.MeshStandardMaterial({ color: '#7a5228' })
    const matRedCA   = new THREE.MeshStandardMaterial({ color: '#d52b1e' })
    const matWhiteCA = new THREE.MeshStandardMaterial({ color: '#f8f4ec' })
    const matStone   = new THREE.MeshStandardMaterial({ color: '#8a8278' })
    const matFireGlw = new THREE.MeshStandardMaterial({ color: '#ff6a00', emissive: '#ff4400', emissiveIntensity: 0.85 })
    const matGlass   = new THREE.MeshStandardMaterial({ color: '#88d8a0', transparent: true, opacity: 0.45, emissive: '#44a860', emissiveIntensity: 0.12 })
    const matWFrame  = new THREE.MeshStandardMaterial({ color: '#f0ece0' })
    const matShelf   = new THREE.MeshStandardMaterial({ color: '#7a5228' })
    const matBook    = [
      new THREE.MeshStandardMaterial({ color: '#1a3a6a' }),
      new THREE.MeshStandardMaterial({ color: '#6a1a1a' }),
      new THREE.MeshStandardMaterial({ color: '#1a5a2a' }),
      new THREE.MeshStandardMaterial({ color: '#4a3a1a' }),
      new THREE.MeshStandardMaterial({ color: '#5a2a5a' }),
      new THREE.MeshStandardMaterial({ color: '#1a5a5a' }),
    ]
    const matDesk    = new THREE.MeshStandardMaterial({ color: '#9a7a4a' })
    const matMetal   = new THREE.MeshStandardMaterial({ color: '#3a3030' })
    const matMonScr  = new THREE.MeshStandardMaterial({ color: '#2a4a8a', emissive: '#1a3a6a', emissiveIntensity: 0.55 })
    const matLmpBase = new THREE.MeshStandardMaterial({ color: '#3a3030' })
    const matLmpGlow = new THREE.MeshStandardMaterial({ color: '#fff8e0', emissive: '#ffcc50', emissiveIntensity: 1.2 })
    const matRug     = new THREE.MeshStandardMaterial({ color: '#8a3a28' })
    const matRugPat  = new THREE.MeshStandardMaterial({ color: '#d49a28' })
    const matBed     = new THREE.MeshStandardMaterial({ color: '#2a3a5a' })
    const matPillow  = new THREE.MeshStandardMaterial({ color: '#f0eae0' })
    const matCouch   = new THREE.MeshStandardMaterial({ color: '#4a3a28' })
    const matCoffee  = new THREE.MeshStandardMaterial({ color: '#6a4a1a' })
    const matCurtain = new THREE.MeshStandardMaterial({ color: '#c04428', transparent: true, opacity: 0.88 })
    const matWard    = new THREE.MeshStandardMaterial({ color: '#7a5228' })
    const matMirror  = new THREE.MeshStandardMaterial({ color: '#8ac8e8', transparent: true, opacity: 0.5, emissive: '#4088a0', emissiveIntensity: 0.12 })
    const matPlant   = new THREE.MeshStandardMaterial({ color: '#2d6b1a' })
    const matPlantRd = new THREE.MeshStandardMaterial({ color: '#d42020' })
    const matNexus   = new THREE.MeshStandardMaterial({ color: '#2a2840' })

    // ── Floor (honey-oak planks) ───────────────────────────────────────────
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE), matFloor)
    floor.rotation.x = -Math.PI / 2; floor.userData.isFloor = true; group.add(floor)
    for (let p = -hw + 0.65; p < hw; p += 1.3) {
      const plank = new THREE.Mesh(new THREE.PlaneGeometry(0.7, ROOM_SIZE), matFloorDk)
      plank.rotation.x = -Math.PI / 2; plank.position.set(p, 0.002, 0)
      plank.userData.isFloor = true; group.add(plank)
    }

    // ── Walls ──────────────────────────────────────────────────────────────
    const wallT = 1.4
    const wallDefs = [
      { pos: [0, ROOM_HEIGHT / 2, -hw - wallT / 2], size: [ROOM_SIZE + wallT * 2, ROOM_HEIGHT, wallT] },
      { pos: [0, ROOM_HEIGHT / 2,  hw + wallT / 2], size: [ROOM_SIZE + wallT * 2, ROOM_HEIGHT, wallT] },
      { pos: [-hw - wallT / 2, ROOM_HEIGHT / 2, 0], size: [wallT, ROOM_HEIGHT, ROOM_SIZE] },
      { pos: [ hw + wallT / 2, ROOM_HEIGHT / 2, 0], size: [wallT, ROOM_HEIGHT, ROOM_SIZE] },
    ]
    wallDefs.forEach(({ pos, size }) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(...size), matWall)
      wall.position.set(...pos); group.add(wall)
      const wains = new THREE.Mesh(new THREE.BoxGeometry(size[0] + 0.02, 1.0, size[2] + 0.02), matWains)
      wains.position.set(pos[0], 0.5, pos[2]); group.add(wains)
    })

    // ── Ceiling + maple beams ──────────────────────────────────────────────
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE), matCeiling)
    ceiling.rotation.x = Math.PI / 2; ceiling.position.y = ROOM_HEIGHT
    group.add(ceiling)
    for (let bx = -hw + 3.5; bx < hw; bx += 5) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.3, ROOM_SIZE), matBeam)
      beam.position.set(bx, ROOM_HEIGHT - 0.16, 0); group.add(beam)
    }
    for (let bz = -hw + 4; bz < hw; bz += 8) {
      const cb = new THREE.Mesh(new THREE.BoxGeometry(ROOM_SIZE, 0.2, 0.25), matBeam)
      cb.position.set(0, ROOM_HEIGHT - 0.12, bz); group.add(cb)
    }

    // ── SOUTH WALL — Fireplace ─────────────────────────────────────────────
    const fpBase = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.45, 1.5), matStone)
    fpBase.position.set(0, 0.225, hw - 1.2); group.add(fpBase)
    ;[-1.9, 1.9].forEach((ox) => {
      const fp = new THREE.Mesh(new THREE.BoxGeometry(0.7, 3.2, 1.5), matStone)
      fp.position.set(ox, 1.6, hw - 1.2); group.add(fp)
    })
    const fpLintel = new THREE.Mesh(new THREE.BoxGeometry(4.7, 0.5, 1.5), matStone)
    fpLintel.position.set(0, 3.45, hw - 1.2); group.add(fpLintel)
    const fpMantel = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.35, 0.65), matWard)
    fpMantel.position.set(0, 3.85, hw - 1.0); group.add(fpMantel)
    const fpChim = new THREE.Mesh(new THREE.BoxGeometry(2.0, ROOM_HEIGHT - 3.8, 1.1), matStone)
    fpChim.position.set(0, (ROOM_HEIGHT + 3.8) / 2, hw - 0.9); group.add(fpChim)
    const fpFire = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 0.4), matFireGlw)
    fpFire.position.set(0, 0.9, hw - 0.75); group.add(fpFire)
    ;[-1.8, 1.8].forEach((ox) => {
      const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.45, 8), matRedCA)
      vase.position.set(ox, 4.15, hw - 1.05); group.add(vase)
    })
    const artBase = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 3.5), matWhiteCA)
    artBase.position.set(0, 6.0, hw - 0.72); group.add(artBase)
    const artLeaf = new THREE.Mesh(new THREE.SphereGeometry(0.85, 10, 8), matRedCA)
    artLeaf.position.set(0, 6.0, hw - 0.78); artLeaf.scale.set(1.0, 0.7, 0.18); group.add(artLeaf)

    // ── NORTH WALL — Portal arch + two windows ─────────────────────────────
    ;[-2.5, 2.5].forEach((ox) => {
      const archP = new THREE.Mesh(new THREE.BoxGeometry(0.8, 5.5, 0.9), matNexus)
      archP.position.set(ox, 2.75, -hw + 0.85); group.add(archP)
    })
    const archTop = new THREE.Mesh(new THREE.BoxGeometry(6.5, 1.0, 0.9), matNexus)
    archTop.position.set(0, 5.75, -hw + 0.85); group.add(archTop)
    const archCurve = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.38, 6, 12, Math.PI), matNexus)
    archCurve.position.set(0, 5.5, -hw + 0.85); archCurve.rotation.z = Math.PI; group.add(archCurve)
    ;[-7, 7].forEach((wx) => {
      const nWin = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 2.8), matGlass)
      nWin.position.set(wx, 3.2, -hw + 0.72); group.add(nWin)
      ;[wx - 1.55, wx + 1.55].forEach((fx) => {
        const fr = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.1, 0.18), matWFrame)
        fr.position.set(fx, 3.2, -hw + 0.64); group.add(fr)
      })
      ;[wx - 1.7, wx + 1.7].forEach((cx) => {
        const curt = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.8, 0.12), matCurtain)
        curt.position.set(cx, 3.2, -hw + 0.88); group.add(curt)
      })
    })

    // ── EAST WALL — Desk + bookshelves + window ────────────────────────────
    ;[-4.5, 4.5].forEach((bz) => {
      const shCase = new THREE.Mesh(new THREE.BoxGeometry(0.45, ROOM_HEIGHT - 0.2, 5.5), matShelf)
      shCase.position.set(hw - 0.9, (ROOM_HEIGHT - 0.2) / 2, bz); group.add(shCase)
      for (let sy = 0.9; sy < ROOM_HEIGHT - 1.0; sy += 1.4) {
        const sh = new THREE.Mesh(new THREE.BoxGeometry(0.47, 0.1, 5.5), matShelf)
        sh.position.set(hw - 0.9, sy, bz); group.add(sh)
        let bp = bz - 2.4
        for (let bi = 0; bi < 8; bi++) {
          const bW = 0.28 + (bi % 3) * 0.1
          const book = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.7 + (bi % 2) * 0.12, bW), matBook[bi % 6])
          book.position.set(hw - 0.88, sy + 0.44, bp + bW / 2); group.add(book)
          bp += bW + 0.05
        }
      }
    })
    const eWin = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 4.0), matGlass)
    eWin.rotation.y = -Math.PI / 2; eWin.position.set(hw - 0.72, 3.2, -0.5); group.add(eWin)
    ;[-0.5 - 1.9, -0.5 + 1.9].forEach((cz) => {
      const curt = new THREE.Mesh(new THREE.BoxGeometry(0.12, 4.0, 0.4), matCurtain)
      curt.position.set(hw - 0.88, 3.2, cz); group.add(curt)
    })
    const dTop = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.12, 5.5), matDesk)
    dTop.position.set(hw - 2.0, 1.8, -7.5); group.add(dTop)
    ;[-2.2, 2.2].forEach((dz) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.8, 0.08), matMetal)
      leg.position.set(hw - 2.0, 0.9, -7.5 + dz); group.add(leg)
    })
    const monBase = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.35), matMetal)
    monBase.position.set(hw - 2.0, 1.93, -7.2); group.add(monBase)
    const monScr = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.5, 2.2), matMetal)
    monScr.position.set(hw - 2.08, 2.82, -7.2); group.add(monScr)
    const monGlow = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.3), matMonScr)
    monGlow.rotation.y = Math.PI / 2; monGlow.position.set(hw - 1.99, 2.82, -7.2); group.add(monGlow)
    const dLBase = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 0.12, 8), matLmpBase)
    dLBase.position.set(hw - 2.0, 1.92, -9.5); group.add(dLBase)
    const dLPole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 6), matLmpBase)
    dLPole.position.set(hw - 2.0, 2.43, -9.5); group.add(dLPole)
    const dLShade = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.32, 8, 1, true), matLmpBase)
    dLShade.position.set(hw - 2.0, 2.97, -9.5); group.add(dLShade)
    const dLBulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 4), matLmpGlow)
    dLBulb.position.set(hw - 2.0, 2.97, -9.5); group.add(dLBulb)

    // ── WEST WALL — Bed + Wardrobe + window ───────────────────────────────
    const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.55, 6.0), matBed)
    bedFrame.position.set(-hw + 3.0, 0.275, -5); group.add(bedFrame)
    const mattress = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.4, 5.7), new THREE.MeshStandardMaterial({ color: '#e8ddd0' }))
    mattress.position.set(-hw + 3.0, 0.75, -5); group.add(mattress)
    const blanket = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.22, 3.8), matRedCA)
    blanket.position.set(-hw + 3.0, 0.98, -3.8); group.add(blanket)
    const quilPat = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.23, 1.5), matWhiteCA)
    quilPat.position.set(-hw + 3.0, 0.99, -3.8); group.add(quilPat)
    ;[-1.4, 1.4].forEach((ox) => {
      const pil = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.28, 0.85), matPillow)
      pil.position.set(-hw + 3.0 + ox, 1.03, -7.4); group.add(pil)
    })
    const headboard = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.6, 0.22), matWard)
    headboard.position.set(-hw + 3.0, 1.5, -8.0); group.add(headboard)
    const hbLeaf = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 6), matRedCA)
    hbLeaf.position.set(-hw + 3.0, 1.5, -7.89); hbLeaf.scale.set(1.0, 0.7, 0.2); group.add(hbLeaf)
    const bLBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.55, 8), matLmpBase)
    bLBase.position.set(-hw + 1.0, 0.92, -7.0); group.add(bLBase)
    const bLShade = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.3, 8, 1, true), matLmpBase)
    bLShade.position.set(-hw + 1.0, 1.45, -7.0); group.add(bLShade)
    const bLBulb = new THREE.Mesh(new THREE.SphereGeometry(0.11, 6, 4), matLmpGlow)
    bLBulb.position.set(-hw + 1.0, 1.43, -7.0); group.add(bLBulb)
    const wCab = new THREE.Mesh(new THREE.BoxGeometry(0.65, ROOM_HEIGHT - 1.0, 5.0), matWard)
    wCab.position.set(-hw + 0.95, (ROOM_HEIGHT - 1.0) / 2, 5.5); group.add(wCab)
    ;[4.1, 6.8].forEach((dz) => {
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.68, ROOM_HEIGHT - 1.5, 2.2), matWall)
      door.position.set(-hw + 1.0, (ROOM_HEIGHT - 1.5) / 2, dz); group.add(door)
    })
    const mirror = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.8), matMirror)
    mirror.rotation.y = Math.PI / 2; mirror.position.set(-hw + 1.36, 2.2, 5.5); group.add(mirror)
    const wWin = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 2.5), matGlass)
    wWin.rotation.y = Math.PI / 2; wWin.position.set(-hw + 0.72, 3.8, -5); group.add(wWin)

    // ── CENTER — Rug + Couch + Coffee table ──────────────────────────────
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(10, 8), matRug)
    rug.rotation.x = -Math.PI / 2; rug.position.set(2, 0.004, 3); rug.userData.isFloor = true; group.add(rug)
    const rugBorder = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 6.5), matRugPat)
    rugBorder.rotation.x = -Math.PI / 2; rugBorder.position.set(2, 0.006, 3); group.add(rugBorder)
    const rugCtr = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 5.0), matRug)
    rugCtr.rotation.x = -Math.PI / 2; rugCtr.position.set(2, 0.008, 3); group.add(rugCtr)
    const cBase1 = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.7, 2.2), matCouch)
    cBase1.position.set(1.5, 0.35, 0); group.add(cBase1)
    const cBack1 = new THREE.Mesh(new THREE.BoxGeometry(6.5, 1.2, 0.55), matCouch)
    cBack1.position.set(1.5, 1.05, -1.2); group.add(cBack1)
    ;[-2, 0, 2].forEach((ox) => {
      const cush = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 1.8), matRedCA)
      cush.position.set(1.5 + ox, 0.88, 0); group.add(cush)
    })
    const ctTop = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.14, 2.5), matCoffee)
    ctTop.position.set(2, 0.72, 3.5); group.add(ctTop)
    ;[[-1.5, 2.5], [1.5, 2.5], [-1.5, 4.5], [1.5, 4.5]].forEach(([cx, cz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.72, 6), matMetal)
      leg.position.set(cx, 0.36, cz); group.add(leg)
    })

    // ── NE CORNER — Decorative maple tree ─────────────────────────────────
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 0.75, 10), matStone)
    pot.position.set(hw - 2, 0.375, -hw + 2); group.add(pot)
    const tTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 1.8, 7), matWard)
    tTrunk.position.set(hw - 2, 1.65, -hw + 2); group.add(tTrunk)
    const tGreen = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 6), matPlant)
    tGreen.position.set(hw - 2, 3.2, -hw + 2); group.add(tGreen)
    const tRed = new THREE.Mesh(new THREE.SphereGeometry(0.6, 6, 4), matPlantRd)
    tRed.position.set(hw - 2, 4.15, -hw + 2); group.add(tRed)

    // ── SOUTH WINDOWS + Canadian flag ─────────────────────────────────────
    ;[matRedCA, matWhiteCA, matRedCA].forEach((mat, i) => {
      const seg = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.2), mat)
      seg.position.set(-5.0 + i * 1.3, 4.5, hw - 0.72); group.add(seg)
    })
    const fMaple = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), matRedCA)
    fMaple.position.set(-3.7, 4.5, hw - 0.70); fMaple.scale.set(1.0, 0.7, 0.18); group.add(fMaple)
    const fRod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 4.5, 6), matMetal)
    fRod.position.set(-6.2, 4.5, hw - 0.7); fRod.rotation.z = Math.PI / 2; group.add(fRod)
    ;[-6, 6].forEach((wx) => {
      const sWin = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 3.5), matGlass)
      sWin.position.set(wx, 3.0, hw - 0.72); group.add(sWin)
      ;[wx - 1.9, wx + 1.9].forEach((cx) => {
        const curt = new THREE.Mesh(new THREE.BoxGeometry(0.35, 3.5, 0.12), matCurtain)
        curt.position.set(cx, 3.0, hw - 0.88); group.add(curt)
      })
    })

    return { model: group, groundRayHeight: ROOM_HEIGHT + 2 }
  }, [])
}
