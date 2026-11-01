import * as THREE from 'three'

// ─────────────────────────────────────────────────────────────────────────────
// Oliver, el gato naranja — modelo 100 % PROCEDURAL (sin .glb), reconstruido con el pipeline img2threejs a partir de la
// foto de un gato atigrado naranja de ojos enormes. Estilo low-poly (flat shading + color por vértice).
// createOrangeCatModel() devuelve { group, parts, update(t, mood) }:
//   parts.head / earL / earR / eyeL / eyeR / whiskersL / whiskersR / tail[] (cadena de pivotes) / body
// son pivotes listos para animar; update() hace parpadeo, oreja, bigotes, cola y balanceo de cabeza.
// Orientación: el gato mira hacia +Z, Y arriba; altura ≈ 3.7 unidades (mismo orden de magnitud que MascotMesh).
// ─────────────────────────────────────────────────────────────────────────────
const C = { base: '#e98a3c', light: '#f2a75e', dark: '#bf571a', cream: '#f6dfb8', pink: '#e58a8f', earIn: '#f0b6a0', amber: '#a8641f', black: '#120a06', white: '#fbf8f0', whisker: '#f7f3ea' }

const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s) }
const MAT = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.92 })
const GLOW_MAT = new THREE.MeshBasicMaterial({ vertexColors: true })

// Color por vértice con un poco de variación determinista (da textura de pelaje sin texturas).
function tint(geo, hex, jitter = 0.05) {
  const c = new THREE.Color(hex), n = geo.attributes.position.count, a = new Float32Array(n * 3), p = geo.attributes.position
  for (let i = 0; i < n; i++) {
    const k = 1 + (hash(p.getX(i) * 9 + i, p.getY(i) * 7 + p.getZ(i) * 3) - 0.5) * 2 * jitter
    a[i * 3] = Math.min(1, c.r * k); a[i * 3 + 1] = Math.min(1, c.g * k); a[i * 3 + 2] = Math.min(1, c.b * k)
  }
  geo.setAttribute('color', new THREE.BufferAttribute(a, 3))
  return geo
}
const mesh = (geo, hex, { pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1], jitter = 0.05, glow = false } = {}) => {
  const m = new THREE.Mesh(tint(geo, hex, jitter), glow ? GLOW_MAT : MAT)
  m.position.set(...pos); m.rotation.set(...rot); m.scale.set(...scale)
  m.castShadow = true
  return m
}
const ball = (r, hex, o = {}, detail = 1) => mesh(new THREE.IcosahedronGeometry(r, detail), hex, o)
const pivot = (name, pos = [0, 0, 0], rot = [0, 0, 0]) => { const g = new THREE.Group(); g.name = name; g.position.set(...pos); g.rotation.set(...rot); return g }

export function createOrangeCatModel() {
  const group = new THREE.Group(); group.name = 'orange-cat'
  const body = pivot('body', [0, 0, 0]), head = pivot('head', [0, 0.1, 0.1])
  group.add(body, head)
  const parts = { body, head }

  // ── cabeza: cráneo ancho y bajo, mejillas, hocico crema (la foto: cara redonda, hocico corto)
  head.add(ball(1.0, C.base, { scale: [1.18, 0.96, 0.98] }))
  for (const s of [-1, 1]) head.add(ball(0.5, C.light, { pos: [s * 0.74, -0.32, 0.2], scale: [1, 0.75, 0.8] }))
  head.add(ball(0.33, C.cream, { pos: [0, -0.34, 0.84], scale: [1.2, 0.7, 0.78] }))      // hocico (corto, como en la foto)
  head.add(ball(0.2, C.cream, { pos: [0, -0.56, 0.74], scale: [1, 0.8, 0.9] }))          // barbilla
  head.add(mesh(new THREE.ConeGeometry(0.17, 0.15, 3).rotateX(Math.PI).rotateY(Math.PI), C.pink, { pos: [0, -0.1, 1.06], rot: [0.25, 0, 0], jitter: 0.02 })) // nariz
  for (const s of [-1, 1]) head.add(mesh(new THREE.BoxGeometry(0.2, 0.025, 0.04), C.dark, { pos: [s * 0.1, -0.4, 1.05], rot: [0, 0, s * -0.5], jitter: 0 })) // boca
  head.add(mesh(new THREE.BoxGeometry(0.025, 0.14, 0.04), C.dark, { pos: [0, -0.3, 1.06], jitter: 0 }))

  // ── marcas de tabby: "M" en la frente y rayas en las mejillas (naranja oscuro)
  for (const [x, ry] of [[-0.3, 0.18], [0, 0], [0.3, -0.18]]) head.add(mesh(new THREE.BoxGeometry(0.07, 0.3, 0.04), C.dark, { pos: [x, 0.56, 0.76 - Math.abs(x) * 0.25], rot: [-1.0, 0, ry], jitter: 0.03 }))
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) head.add(mesh(new THREE.BoxGeometry(0.3, 0.05, 0.05), C.dark, { pos: [s * (1.0 + i * 0.02), -0.12 - i * 0.16, 0.5 - i * 0.04], rot: [0, s * -0.7, s * (0.12 - i * 0.12)], jitter: 0.03 }))
  for (const s of [-1, 1]) head.add(mesh(new THREE.BoxGeometry(0.34, 0.045, 0.05), C.dark, { pos: [s * 0.62, 0.4, 0.84], rot: [0, s * -0.3, s * -0.25], jitter: 0.03 })) // arrugas sobre los ojos

  // ── ojos enormes y redondos (identidad de la foto): iris ámbar, pupila negra gigante, brillo blanco
  for (const [name, s] of [['eyeL', 1], ['eyeR', -1]]) {
    const eye = pivot(name, [s * 0.46, 0.14, 0.8])
    eye.add(ball(0.285, C.amber, { scale: [1, 1, 0.78], jitter: 0.02 }, 2))
    eye.add(ball(0.225, C.black, { pos: [0, 0, 0.065], scale: [1, 1, 0.8], jitter: 0 }, 2))
    eye.add(ball(0.05, C.white, { pos: [s * -0.08, 0.1, 0.2], jitter: 0, glow: true }, 1))
    eye.add(ball(0.025, C.white, { pos: [s * 0.08, -0.07, 0.19], jitter: 0, glow: true }, 0))
    head.add(eye); parts[name] = eye
  }

  // ── orejas puntiagudas, un poco abiertas hacia afuera
  for (const [name, s] of [['earL', 1], ['earR', -1]]) {
    const ear = pivot(name, [s * 0.66, 0.78, -0.05], [0.12, 0, s * -0.34])
    ear.add(mesh(new THREE.ConeGeometry(0.46, 1.0, 4).rotateY(Math.PI / 4).translate(0, 0.5, 0), C.base, { scale: [1, 1, 0.5] }))
    ear.add(mesh(new THREE.ConeGeometry(0.3, 0.72, 4).rotateY(Math.PI / 4).translate(0, 0.38, 0), C.earIn, { pos: [0, 0.02, 0.13], scale: [1, 1, 0.4], jitter: 0.02 }))
    head.add(ear); parts[name] = ear
  }

  // ── bigotes: 6 por lado, curvas finas que salen del hocico, abren hacia afuera y caen
  for (const [name, s] of [['whiskersL', 1], ['whiskersR', -1]]) {
    const w = pivot(name, [s * 0.36, -0.28, 0.9])
    for (let i = 0; i < 6; i++) {
      const spread = (i - 2.5) * 0.17, len = 1.5 + (i % 3) * 0.25
      const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(s * len * 0.4, spread * 0.5 + 0.05, -0.12), new THREE.Vector3(s * len * 0.8, spread * 0.9 - 0.12, -0.38), new THREE.Vector3(s * len, spread * 1.1 - 0.42 - i * 0.02, -0.7)])
      w.add(mesh(new THREE.TubeGeometry(curve, 10, 0.013, 4), C.whisker, { jitter: 0, glow: true }))
    }
    head.add(w); parts[name] = w
  }

  // ── cuerpo sentado: torso, pecho y panza cremas, ancas, patas delanteras con calcetas crema
  body.add(ball(0.98, C.base, { pos: [0, -1.95, -0.3], scale: [0.88, 1.08, 0.95] }))
  body.add(ball(0.62, C.cream, { pos: [0, -1.75, 0.38], scale: [0.85, 1.05, 0.55] }))
  for (const s of [-1, 1]) {
    body.add(ball(0.66, C.base, { pos: [s * 0.72, -2.45, -0.35], scale: [0.8, 0.9, 1] }))
    body.add(mesh(new THREE.CylinderGeometry(0.17, 0.2, 1.15, 6), C.base, { pos: [s * 0.34, -2.45, 0.45] }))
    body.add(ball(0.22, C.cream, { pos: [s * 0.34, -3.02, 0.55], scale: [1, 0.6, 1.3] }))
    for (let i = 0; i < 2; i++) body.add(mesh(new THREE.BoxGeometry(0.34, 0.05, 0.05), C.dark, { pos: [s * 0.82, -1.6 - i * 0.4, -0.05], rot: [0, 0, s * 0.15], jitter: 0.03 }))
  }

  // ── cola: cadena de 6 pivotes con anillos oscuros (se anima en update)
  const tail = []
  let parent = pivot('tail0', [0, -2.85, -1.1], [-0.9, 0, 0]); body.add(parent); tail.push(parent)
  for (let i = 0; i < 6; i++) {
    parent.add(mesh(new THREE.CylinderGeometry(0.15 - i * 0.012, 0.17 - i * 0.012, 0.52, 6).translate(0, 0.26, 0), i % 2 ? C.dark : C.base))
    const next = pivot(`tail${i + 1}`, [0, 0.5, 0], [0.22, 0, 0]); parent.add(next); tail.push(next); parent = next
  }
  parent.add(ball(0.14, C.dark, { pos: [0, 0.05, 0] }, 0))
  parts.tail = tail

  // ── animación idle: parpadeo ocasional, cola ondulante, oreja que se mueve, bigotes que respiran y cabeza que se ladea
  const state = { nextBlink: 2, blink: 0 }
  const update = (t, mood = 1) => { // mood 0 (triste, quieto) … 1 (alegre)
    if (t > state.nextBlink) { state.blink = t; state.nextBlink = t + 2.5 + hash(t, 3) * 3 }
    const b = t - state.blink, lid = b < 0.18 ? 1 - Math.sin((b / 0.18) * Math.PI) * 0.92 : 1
    parts.eyeL.scale.y = parts.eyeR.scale.y = lid
    parts.tail.forEach((p, i) => { p.rotation.x = (i === 0 ? -0.9 : 0.22) + Math.sin(t * (1.1 + mood * 1.2) - i * 0.55) * 0.12 * mood; p.rotation.z = Math.sin(t * 0.9 - i * 0.5) * 0.18 * (0.4 + mood) })
    parts.earL.rotation.z = -0.34 + Math.max(0, Math.sin(t * 0.7 + 1)) ** 8 * 0.35
    parts.earR.rotation.z = 0.34 - Math.max(0, Math.sin(t * 0.55)) ** 8 * 0.35
    parts.whiskersL.rotation.y = Math.sin(t * 1.6) * 0.04; parts.whiskersR.rotation.y = -Math.sin(t * 1.6) * 0.04
    parts.head.rotation.z = Math.sin(t * 0.6) * 0.05 * (0.5 + mood); parts.head.rotation.x = Math.sin(t * 0.8) * 0.03 - (1 - mood) * 0.12
    parts.body.scale.y = 1 + Math.sin(t * 1.8) * 0.008
  }
  return { group, parts, update }
}
