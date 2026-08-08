import Phaser from 'phaser'

// Mapa del Hospital Central — mismo motor que campusScene.js (Mundo 2D):
// gráficos generados en código, sin tilemaps ni assets externos. Doce
// departamentos en una cuadrícula 4×3 con pasillos entre ellos (el hueco
// entre rects, ya lo cubre la grilla de piso de _drawMap) — solo dos
// importan para el juego (una zona por rol); el resto son decorativas,
// para que se sienta un hospital real y no cuatro cuartos sueltos. Fases
// futuras (Red/Blue Team, NPCs-paciente) se apoyan en este mismo layout.
const W = 2300
const H = 1450
const SPEED = 260
const OBJECTIVE_RADIUS = 110
const PATIENT_RADIUS = 90

// Pacientes-NPC dentro de Recepción — posiciones relativas al centro de la
// zona del Doctor (ver _makePatients). Por ahora son solo un punto de
// interacción visual (el contenido del diagnóstico sigue siendo el mismo
// banco compartido de HOSPITAL_PATIENT_CASES vía DoctorPanel) — vestir
// cada paciente con SU caso fijo es la siguiente vuelta de esta fase.
const PATIENT_NPCS = [
  { id: 'p1', dx: -130, dy: 30, emoji: '🧑', line: '🗨️ Doctor, ¿me revisa?' },
  { id: 'p2', dx: 0, dy: 100, emoji: '👵', line: '🗨️ No me siento bien...' },
  { id: 'p3', dx: 130, dy: 30, emoji: '👦', line: '🗨️ Llevo un rato esperando' },
]

// Cuadrícula 4 columnas × 3 filas — cuartos de 460×360, pasillos de 90px
// entre ellos y de margen. Centro exacto del mapa (W/2, H/2) cae justo en
// el cruce de pasillos entre columnas 2-3 y filas 1-2, así que sirve como
// punto de aparición sin pisar ningún cuarto (ver _makePlayer).
// `roles` (en vez de un `role` único) — la sala de servidores sirve tanto
// al Hacker "de siempre" (multijugador real, todavía 1v1) como a los
// sub-equipos Red/Blue de la práctica solo (fase Red vs Blue Team); ambos
// trabajan desde el mismo cuarto, solo cambian sus acciones ahí dentro.
const ZONES = [
  // Fila 0 — ala de ingreso
  { x: 90,   y: 90,  w: 460, h: 360, label: '🚑 Urgencias',            fill: 0x1a0d0d, glow: 0x88301e, text: '#fb7185' },
  { x: 640,  y: 90,  w: 460, h: 360, label: '🪑 Sala de Espera',       fill: 0x14140d, glow: 0x6a6a1e, text: '#facc15' },
  { x: 1190, y: 90,  w: 460, h: 360, label: '🏥 Recepción',            fill: 0x0d1a3d, glow: 0x1e5888, text: '#60a5fa', roles: ['doctor'] },
  { x: 1740, y: 90,  w: 460, h: 360, label: '📋 Administración',       fill: 0x14141a, glow: 0x4a4a6a, text: '#a5b4fc' },
  // Fila 1 — servicios
  { x: 90,   y: 540, w: 460, h: 360, label: '💊 Farmacia',             fill: 0x1a1200, glow: 0x7a5a00, text: '#fbbf24' },
  { x: 640,  y: 540, w: 460, h: 360, label: '🧪 Laboratorio',          fill: 0x0d1a17, glow: 0x1e6850, text: '#5eead4' },
  { x: 1190, y: 540, w: 460, h: 360, label: '🩺 Consultorios',         fill: 0x141a0d, glow: 0x4a6a1e, text: '#a3e635' },
  { x: 1740, y: 540, w: 460, h: 360, label: '🖥️ Cuarto de Servidores', fill: 0x0d1e0d, glow: 0x1e8848, text: '#4ade80', roles: ['hacker', 'hacker_red', 'hacker_blue'] },
  // Fila 2 — hospitalización
  { x: 90,   y: 990, w: 460, h: 360, label: '🩹 Quirófano',            fill: 0x1a0d1a, glow: 0x881a68, text: '#f472b6' },
  { x: 640,  y: 990, w: 460, h: 360, label: '🫀 Terapia Intensiva',    fill: 0x1a0d10, glow: 0x8a1e3e, text: '#fb7185' },
  { x: 1190, y: 990, w: 460, h: 360, label: '🛏️ Hospitalización',      fill: 0x0d1420, glow: 0x2a4a7a, text: '#93c5fd' },
  { x: 1740, y: 990, w: 460, h: 360, label: '☕ Personal / Cafetería',  fill: 0x1a150d, glow: 0x7a5a2e, text: '#fdba74' },
]

export function roleLabel(role) {
  if (role === 'doctor') return '🩺 Doctor'
  if (role === 'hacker_red') return '🔴 Red Team'
  if (role === 'hacker_blue') return '🔵 Blue Team'
  return '🕶️ Hacker'
}

// Puente React ↔ Phaser, mismo patrón que campusScene.js's `bridge`.
export const bridge = {
  dir: { current: { x: 0, y: 0 } },
  meta: { name: 'Jugador', color: '#98ca3f', role: 'hacker' },
  doorLocked: false,     // Red Team la bloquea, Blue Team la abre — el Doctor no puede entrar a Recepción mientras esté true
  onObjectiveNear: null, // (bool) — entra/sale del radio de TU zona de objetivo
  onObjectiveVector: null, // (dx, dy, dist, near) — brújula
  onPatientNear: null,   // (bool) — Doctor entra/sale del radio de CUALQUIER paciente-NPC
  onPosition: null,      // (x, y)
  scene: null,
}

export default class HospitalScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HospitalScene' })
    this._others = {}
    this._near = false
    this._nearPatient = false
    this._posT = 0
  }

  preload() {
    const g = this.make.graphics({ add: false })
    g.fillStyle(0xffffff); g.fillCircle(20, 20, 18)
    g.lineStyle(3, 0x000000, 0.35); g.strokeCircle(20, 20, 18)
    g.generateTexture('h_dot_player', 40, 40)
    g.clear()
    g.fillStyle(0xffffff, 0.78); g.fillCircle(13, 13, 11)
    g.generateTexture('h_dot_other', 26, 26)
    g.destroy()
  }

  create() {
    bridge.scene = this
    this._myObjective = ZONES.find((z) => z.roles?.includes(bridge.meta.role)) ?? null

    this._drawMap()
    this._makePlayer()
    this._makeDoorBadge()
    this._makePatients()

    this._cursors = this.input.keyboard.createCursorKeys()
    this._wasd = this.input.keyboard.addKeys('W,A,S,D')

    this.cameras.main.setBounds(0, 0, W, H)
    this.cameras.main.startFollow(this._player, true, 0.08, 0.08)
    this.cameras.main.setZoom(0.9)
    this.physics.world.setBounds(0, 0, W, H)
  }

  _drawMap() {
    const g = this.add.graphics()
    g.fillStyle(0x0a1420); g.fillRect(0, 0, W, H)
    g.lineStyle(1, 0x14243a, 0.5)
    for (let x = 0; x < W; x += 80) g.strokeLineShape(new Phaser.Geom.Line(x, 0, x, H))
    for (let y = 0; y < H; y += 80) g.strokeLineShape(new Phaser.Geom.Line(0, y, W, y))

    for (const z of ZONES) {
      g.fillStyle(0x000000, 0.45)
      g.fillRoundedRect(z.x + 6, z.y + 6, z.w, z.h, 14)
      g.fillStyle(z.fill, 1)
      g.fillRoundedRect(z.x, z.y, z.w, z.h, 14)
      g.lineStyle(2, z.glow, 0.9)
      g.strokeRoundedRect(z.x, z.y, z.w, z.h, 14)
      // Zona de objetivo de ESTE jugador: aro exterior pulsante (dibujado
      // como varios círculos concéntricos, ya que Phaser Graphics no anima
      // stroke-width solo con un tween trivial).
      if (this._myObjective === z) {
        g.lineStyle(1, z.glow, 0.35)
        g.strokeRoundedRect(z.x - 10, z.y - 10, z.w + 20, z.h + 20, 20)
      }
    }
    for (const z of ZONES) {
      this.add.text(z.x + z.w / 2, z.y + z.h / 2, z.label, {
        fontFamily: '"Segoe UI Emoji", system-ui, sans-serif', fontSize: '20px', color: z.text, align: 'center',
        stroke: '#000000', strokeThickness: 4,
      }).setOrigin(0.5)
      if (z.roles) {
        this.add.text(z.x + z.w / 2, z.y + z.h / 2 + 26, z.roles.includes('doctor') ? 'objetivo del Doctor' : 'objetivo del Hacker', {
          fontFamily: 'system-ui, sans-serif', fontSize: '10px', color: '#ffffff99',
        }).setOrigin(0.5)
      }
    }

    const cx = W / 2, cy = H / 2
    const sp = this.add.graphics()
    sp.lineStyle(2, 0x98ca3f, 0.4)
    for (let r = 30; r <= 70; r += 20) sp.strokeCircle(cx, cy, r)
    this.add.text(cx, cy + 40, 'SPAWN', {
      fontFamily: 'system-ui, sans-serif', fontSize: '11px', color: '#98ca3f', alpha: 0.5, letterSpacing: 4,
    }).setOrigin(0.5)
  }

  _makePlayer() {
    const tint = parseInt(bridge.meta.color.replace('#', ''), 16)
    const cx = W / 2, cy = H / 2
    this._player = this.physics.add.image(cx, cy, 'h_dot_player').setTint(tint).setDepth(10).setCollideWorldBounds(true)

    this._pName = this.add.text(cx, cy - 28, bridge.meta.name, {
      fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: '#fff', stroke: '#000', strokeThickness: 3,
      backgroundColor: '#00000055', padding: { x: 4, y: 2 },
    }).setOrigin(0.5).setDepth(11)

    this._pRole = this.add.text(cx, cy + 22, roleLabel(bridge.meta.role), {
      fontFamily: 'system-ui, sans-serif', fontSize: '10px', color: '#fff', stroke: '#000', strokeThickness: 2,
      backgroundColor: bridge.meta.color, padding: { x: 3, y: 1 },
    }).setOrigin(0.5).setDepth(12)
  }

  // Aviso sobre Recepción cuando Red Team bloquea la puerta — visible para
  // todos (no solo el Doctor), así Red/Blue Team también ven el estado
  // actual sin tener que preguntarlo por chat.
  _makeDoorBadge() {
    const doctorZone = ZONES.find((z) => z.roles?.includes('doctor'))
    if (!doctorZone) return
    this._doorBadge = this.add.text(doctorZone.x + doctorZone.w / 2, doctorZone.y - 22, '🔒 Puerta bloqueada', {
      fontFamily: 'system-ui, sans-serif', fontSize: '13px', color: '#fff',
      backgroundColor: '#dc2626', padding: { x: 6, y: 3 },
    }).setOrigin(0.5).setDepth(20).setVisible(false)
  }

  // Pacientes-NPC dentro de Recepción — sprites estáticos con una línea de
  // diálogo flotante siempre visible, para que se sienta gente esperando
  // y no un cuarto vacío. Guarda sus coordenadas absolutas en this._patients
  // para el chequeo de proximidad de update().
  _makePatients() {
    const doctorZone = ZONES.find((z) => z.roles?.includes('doctor'))
    if (!doctorZone) return
    const cx = doctorZone.x + doctorZone.w / 2, cy = doctorZone.y + doctorZone.h / 2
    this._patients = PATIENT_NPCS.map((p) => {
      const x = cx + p.dx, y = cy + p.dy
      this.add.image(x, y, 'h_dot_other').setTint(0xfbbf24).setScale(1.3).setDepth(6)
      this.add.text(x, y, p.emoji, { fontSize: '18px' }).setOrigin(0.5).setDepth(7)
      this.add.text(x, y - 26, p.line, {
        fontFamily: 'system-ui, sans-serif', fontSize: '10px', color: '#fff',
        backgroundColor: '#00000077', padding: { x: 4, y: 2 },
      }).setOrigin(0.5).setDepth(7)
      return { id: p.id, x, y }
    })
  }

  // ── Multiplayer API (llamado desde React) ──────────────────────────────────
  addOther(id, x, y, name, color) {
    if (this._others[id]) return
    const tint = parseInt((color ?? '#888').replace('#', ''), 16)
    const img = this.add.image(x, y, 'h_dot_other').setTint(tint).setAlpha(0.8).setDepth(7)
    const lbl = this.add.text(x, y - 19, name, {
      fontFamily: 'system-ui, sans-serif', fontSize: '11px', color: '#ccc', stroke: '#000', strokeThickness: 2,
      backgroundColor: '#00000033', padding: { x: 3, y: 1 },
    }).setOrigin(0.5).setDepth(8)
    this._others[id] = { img, lbl }
  }

  moveOther(id, x, y) {
    const o = this._others[id]; if (!o) return
    o.img.setPosition(x, y); o.lbl.setPosition(x, y - 19)
  }

  removeOther(id) {
    const o = this._others[id]; if (!o) return
    o.img.destroy(); o.lbl.destroy()
    delete this._others[id]
  }

  update(_, delta) {
    const dir = bridge.dir?.current ?? { x: 0, y: 0 }
    const { left, right, up, down } = this._cursors
    const { A, D, W: wKey, S } = this._wasd ?? {}

    let vx = dir.x * SPEED
    let vy = dir.y * SPEED
    if (left.isDown || A?.isDown) vx = -SPEED
    if (right.isDown || D?.isDown) vx = SPEED
    if (up.isDown || wKey?.isDown) vy = -SPEED
    if (down.isDown || S?.isDown) vy = SPEED
    if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707 }
    this._player.setVelocity(vx, vy)

    const px = this._player.x, py = this._player.y
    this._pName.setPosition(px, py - 28)
    this._pRole.setPosition(px, py + 22)
    this._doorBadge?.setVisible(!!bridge.doorLocked)

    let nearNow = false
    if (this._myObjective) {
      const z = this._myObjective
      const zx = z.x + z.w / 2, zy = z.y + z.h / 2
      const dist = Phaser.Math.Distance.Between(px, py, zx, zy)
      nearNow = dist < OBJECTIVE_RADIUS
      // Brújula — sin esto no hay ninguna pista en pantalla de hacia dónde
      // caminar, y el mapa es lo bastante grande como para perderse (sobre
      // todo la Recepción del Doctor, que queda lejos del punto de spawn).
      bridge.onObjectiveVector?.(zx - px, zy - py, dist, nearNow)
    }
    if (nearNow !== this._near) {
      this._near = nearNow
      bridge.onObjectiveNear?.(nearNow)
    }

    // El Doctor solo puede diagnosticar parado junto a un paciente
    // concreto, no en cualquier punto de Recepción — entrar a la zona
    // sigue mostrando el aviso de puerta bloqueada si aplica, pero el
    // panel de diagnóstico en sí espera a que camines hasta alguien.
    if (bridge.meta.role === 'doctor' && this._patients?.length) {
      const nearestDist = Math.min(...this._patients.map((p) => Phaser.Math.Distance.Between(px, py, p.x, p.y)))
      const nearPatientNow = nearestDist < PATIENT_RADIUS
      if (nearPatientNow !== this._nearPatient) {
        this._nearPatient = nearPatientNow
        bridge.onPatientNear?.(nearPatientNow)
      }
    }

    // Broadcast más frecuente que el Mundo 2D general (400ms vs 2000ms) —
    // aquí el movimiento del rival importa más, es un 1v1 en tensión, no
    // un mundo ambiente con muchos jugadores a la vez.
    this._posT += delta
    if (this._posT > 400) {
      this._posT = 0
      bridge.onPosition?.(px, py)
    }
  }
}
