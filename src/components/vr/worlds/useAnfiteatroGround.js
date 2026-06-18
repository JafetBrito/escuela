import { useMemo } from 'react'
import * as THREE from 'three'

export const ANFI_W  = 56
export const ANFI_D  = 80
export const ANFI_H  = 18
export const ANFI_HW = ANFI_W / 2   // 28
export const ANFI_HD = ANFI_D / 2   // 40
export const ANFI_STAGE_Z = -12
export const ANFI_SCREEN_Z = -ANFI_HD + 1.5
export const ANFI_STAGE_NPC_POS = [0, 0, ANFI_STAGE_Z - 7]
export const ANFI_SPAWN = [0, 0, ANFI_HD - 12]
export const ANFI_EXIT_PORTAL = [0, 0, ANFI_HD - 3]

export function useAnfiteatroGround() {
  return useMemo(() => {
    const group = new THREE.Group()
    const hw = ANFI_HW   // 28
    const hd = ANFI_HD   // 40
    const wallT = 1.6

    // ── Materials ─────────────────────────────────────────────────────────
    const matFloorAud = new THREE.MeshStandardMaterial({ color: '#1e1510' })
    const matStage    = new THREE.MeshStandardMaterial({ color: '#3d2a1a' })
    const matWall     = new THREE.MeshStandardMaterial({ color: '#1a1020' })
    const matWallRed  = new THREE.MeshStandardMaterial({ color: '#4a0a0a' })
    const matCeiling  = new THREE.MeshStandardMaterial({ color: '#111018', side: THREE.BackSide })
    const matScreen   = new THREE.MeshStandardMaterial({ color: '#0a0a14', emissive: '#1a1a3a', emissiveIntensity: 0.5 })
    const matBeam     = new THREE.MeshStandardMaterial({ color: '#2d1a0a' })
    const matGold     = new THREE.MeshStandardMaterial({ color: '#b8880e', emissive: '#704400', emissiveIntensity: 0.3 })
    const matSeatBody = new THREE.MeshStandardMaterial({ color: '#6a0a14' })
    const matSeatBack = new THREE.MeshStandardMaterial({ color: '#820f18' })
    const matSeatLeg  = new THREE.MeshStandardMaterial({ color: '#1a1010' })
    const matCurtain  = new THREE.MeshStandardMaterial({ color: '#7a0020', side: THREE.DoubleSide })
    const matLight    = new THREE.MeshStandardMaterial({ color: '#fff8e0', emissive: '#fff0b0', emissiveIntensity: 2.0 })
    const matLobbyFlr = new THREE.MeshStandardMaterial({ color: '#c8b890' })
    const matBackstage= new THREE.MeshStandardMaterial({ color: '#181210' })
    const matProp     = new THREE.MeshStandardMaterial({ color: '#554433' })
    const matPosterBg = new THREE.MeshStandardMaterial({ color: '#1a0822' })
    const matPosterAcc= new THREE.MeshStandardMaterial({ color: '#d4a820', emissive: '#704400', emissiveIntensity: 0.5 })

    // ── Floor ─────────────────────────────────────────────────────────────
    const lobbyFloor = new THREE.Mesh(new THREE.PlaneGeometry(hw * 2, 16), matLobbyFlr)
    lobbyFloor.rotation.x = -Math.PI / 2; lobbyFloor.position.set(0, 0, hd - 8)
    lobbyFloor.userData.isFloor = true; group.add(lobbyFloor)
    const audFloor = new THREE.Mesh(new THREE.PlaneGeometry(hw * 2, hd - ANFI_STAGE_Z - 16), matFloorAud)
    audFloor.rotation.x = -Math.PI / 2
    audFloor.position.set(0, 0, (ANFI_STAGE_Z + hd - 16) / 2)
    audFloor.userData.isFloor = true; group.add(audFloor)
    const stagePlatform = new THREE.Mesh(new THREE.BoxGeometry(hw * 2, 1.4, 28), matStage)
    stagePlatform.position.set(0, 0.7, ANFI_STAGE_Z - 14)
    group.add(stagePlatform)
    const bsFloor = new THREE.Mesh(new THREE.PlaneGeometry(hw * 2 - 8, 16), matBackstage)
    bsFloor.rotation.x = -Math.PI / 2; bsFloor.position.set(0, 0, -hd + 8)
    bsFloor.userData.isFloor = true; group.add(bsFloor)

    // ── Walls ─────────────────────────────────────────────────────────────
    const addWall = (x, y, z, w, h, d, mat = matWall) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
      m.position.set(x, y, z); group.add(m)
    }
    addWall(hw + wallT / 2, ANFI_H / 2, 0, wallT, ANFI_H, ANFI_D + wallT * 2)
    addWall(-hw - wallT / 2, ANFI_H / 2, 0, wallT, ANFI_H, ANFI_D + wallT * 2)
    const screenW = 36; const screenH = 22
    ;[-1, 1].forEach((side) => {
      const xOff = side * (hw / 2 + screenW / 4)
      addWall(xOff, ANFI_H / 2, -hd - wallT / 2, hw - screenW / 2, ANFI_H, wallT)
    })
    addWall(0, ANFI_H - (ANFI_H - screenH) / 2, -hd - wallT / 2, screenW, ANFI_H - screenH, wallT)
    addWall(0, (1.5) / 2, -hd - wallT / 2, screenW, 1.5, wallT)
    ;[-1, 1].forEach((side) => {
      const xOff = side * (hw / 2 + 3)
      addWall(xOff, ANFI_H / 2, hd + wallT / 2, hw - 6, ANFI_H, wallT)
    })
    addWall(0, ANFI_H - (ANFI_H - 9) / 2, hd + wallT / 2, 12, ANFI_H - 9, wallT)
    ;[-hw, hw].forEach((x) => {
      for (let z = -30; z <= 30; z += 12) {
        const strip = new THREE.Mesh(new THREE.BoxGeometry(0.18, 5, 0.6), matWallRed)
        strip.position.set(x + (x > 0 ? -0.9 : 0.9), 4.5, z); group.add(strip)
      }
    })

    // ── Ceiling ───────────────────────────────────────────────────────────
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(hw * 2, ANFI_D), matCeiling)
    ceiling.rotation.x = Math.PI / 2; ceiling.position.set(0, ANFI_H, 0); group.add(ceiling)
    for (let z = -30; z <= 30; z += 10) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(hw * 2, 0.5, 0.6), matBeam)
      beam.position.set(0, ANFI_H - 0.25, z); group.add(beam)
    }
    const cenBeam = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, ANFI_D), matBeam)
    cenBeam.position.set(0, ANFI_H - 0.3, 0); group.add(cenBeam)

    // ── Stage proscenium arch ─────────────────────────────────────────────
    const archH = 16; const archW = screenW + 4
    ;[-1, 1].forEach((side) => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(2.5, archH, wallT + 1), matGold)
      pillar.position.set(side * (archW / 2 + 1.25), archH / 2, ANFI_STAGE_Z)
      group.add(pillar)
    })
    const archTop = new THREE.Mesh(new THREE.BoxGeometry(archW + 7, 2.2, wallT + 1), matGold)
    archTop.position.set(0, archH + 1.1, ANFI_STAGE_Z); group.add(archTop)

    // ── Audience seating — 8 rows of 12 seats ────────────────────────────
    const rowZ0 = ANFI_STAGE_Z - 4
    for (let row = 0; row < 8; row++) {
      const rz = rowZ0 + row * 4.8 + 3
      const rise = row * 0.28
      for (let col = -5; col <= 5; col++) {
        const sx = col * 4.2
        const cushion = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.2, 2.2), matSeatBody)
        cushion.position.set(sx, rise + 0.9, rz); group.add(cushion)
        const back = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.0, 0.28), matSeatBack)
        back.position.set(sx, rise + 1.9, rz - 1.0); group.add(back)
        ;[-1.2, 1.2].forEach((legX) => {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.85, 0.18), matSeatLeg)
          leg.position.set(sx + legX, rise + 0.42, rz); group.add(leg)
        })
      }
      const lightL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.5), matLight)
      lightL.position.set(-hw + 0.2, rise + 0.3, rz)
      const lightR = lightL.clone()
      lightR.position.set(hw - 0.2, rise + 0.3, rz)
      group.add(lightL); group.add(lightR)
    }

    // ── Stage-level spotlights ────────────────────────────────────────────
    ;[-16, -8, 0, 8, 16].forEach((x) => {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.35, 0.4), matLight)
      bar.position.set(x, ANFI_H - 0.5, ANFI_STAGE_Z + 2); group.add(bar)
    })

    // ── Stage curtains ────────────────────────────────────────────────────
    ;[-1, 1].forEach((side) => {
      const cx = side * (hw - 4)
      const curtFront = new THREE.Mesh(new THREE.PlaneGeometry(6, archH), matCurtain)
      curtFront.position.set(cx, archH / 2, ANFI_STAGE_Z + 0.5)
      curtFront.rotation.y = side * Math.PI / 8; group.add(curtFront)
      const wing = new THREE.Mesh(new THREE.BoxGeometry(wallT, ANFI_H, 18), matBackstage)
      wing.position.set(side * (screenW / 2 + 1.5), ANFI_H / 2, -hd + 10)
      group.add(wing)
      for (let bz = -hd + 4; bz < -hd + 18; bz += 5) {
        const box = new THREE.Mesh(new THREE.BoxGeometry(4, 2.5, 3.5), matProp)
        box.position.set(side * (hw - 5), 1.25, bz); group.add(box)
      }
    })

    // ── Video screen frame ────────────────────────────────────────────────
    const screenFrame = new THREE.Mesh(new THREE.BoxGeometry(screenW + 1.5, screenH + 1.5, 0.3), matBeam)
    screenFrame.position.set(0, screenH / 2 + 1.5, -hd + 0.2)
    group.add(screenFrame)
    const screenSurf = new THREE.Mesh(new THREE.PlaneGeometry(screenW, screenH), matScreen)
    screenSurf.position.set(0, screenH / 2 + 1.5, -hd + 0.36)
    group.add(screenSurf)

    // ── Exterior announcement posters ─────────────────────────────────────
    ;[-18, -6, 6, 18].forEach((px) => {
      const board = new THREE.Mesh(new THREE.BoxGeometry(8, 12, 0.25), matPosterBg)
      board.position.set(px, 7, hd + wallT + 0.12); group.add(board)
      const frame = new THREE.Mesh(new THREE.BoxGeometry(8.6, 12.6, 0.18), matPosterAcc)
      frame.position.set(px, 7, hd + wallT + 0.05); group.add(frame)
      const star = new THREE.Mesh(new THREE.SphereGeometry(1.0, 6, 4), matPosterAcc)
      star.position.set(px, 7, hd + wallT + 0.38); group.add(star)
    })
    const marquee = new THREE.Mesh(new THREE.BoxGeometry(hw * 2, 3.5, 0.5), matGold)
    marquee.position.set(0, ANFI_H - 1.5, hd + wallT + 0.25); group.add(marquee)
    ;[-20, -12, 12, 20].forEach((cx) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.85, ANFI_H, 10), matGold)
      col.position.set(cx, ANFI_H / 2, hd + wallT + 1.5); group.add(col)
    })

    // ── Ceiling accent lights ─────────────────────────────────────────────
    for (let z = -20; z <= 20; z += 10) {
      for (let x = -20; x <= 20; x += 10) {
        const spot = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 4), matLight)
        spot.position.set(x, ANFI_H - 0.4, z); group.add(spot)
      }
    }

    return { model: group, groundRayHeight: ANFI_H + 4 }
  }, [])
}
