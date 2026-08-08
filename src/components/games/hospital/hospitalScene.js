import Phaser from 'phaser'

// Mapa chico del Hospital Central — mismo motor que campusScene.js (Mundo
// 2D): gráficos generados en código, sin tilemaps ni assets externos. Solo
// dos zonas importan para el juego (una por rol); las otras dos son
// decorativas, para que se sienta un hospital de verdad y no solo dos
// cuartos vacíos.
const W = 1300
const H = 950
const SPEED = 220
const OBJECTIVE_RADIUS = 110

const ZONES = [
  { x: 80,  y: 80,  w: 380, h: 280, label: '🖥️ Cuarto de Servidores', fill: 0x0d1e0d, glow: 0x1e8848, text: '#4ade80', role: 'hacker' },
  { x: 840, y: 580, w: 380, h: 280, label: '🏥 Recepción',             fill: 0x0d1a3d, glow: 0x1e5888, text: '#60a5fa', role: 'doctor' },
  { x: 840, y: 80,  w: 300, h: 200, label: '💊 Farmacia',              fill: 0x1a1200, glow: 0x7a5a00, text: '#fbbf24', role: null },
  { x: 80,  y: 600, w: 300, h: 220, label: '🩹 Quirófano',             fill: 0x1a0d1a, glow: 0x881a68, text: '#f472b6', role: null },
]

// Puente React ↔ Phaser, mismo patrón que campusScene.js's `bridge`.
export const bridge = {
  dir: { current: { x: 0, y: 0 } },
  meta: { name: 'Jugador', color: '#98ca3f', role: 'hacker' },
  onObjectiveNear: null, // (bool) — entra/sale del radio de TU zona de objetivo
  onPosition: null,      // (x, y)
  scene: null,
}

export default class HospitalScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HospitalScene' })
    this._others = {}
    this._near = false
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
    this._myObjective = ZONES.find((z) => z.role === bridge.meta.role) ?? null

    this._drawMap()
    this._makePlayer()

    this._cursors = this.input.keyboard.createCursorKeys()
    this._wasd = this.input.keyboard.addKeys('W,A,S,D')

    this.cameras.main.setBounds(0, 0, W, H)
    this.cameras.main.startFollow(this._player, true, 0.08, 0.08)
    this.cameras.main.setZoom(1.1)
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
      if (z.role) {
        this.add.text(z.x + z.w / 2, z.y + z.h / 2 + 26, z.role === 'hacker' ? 'objetivo del Hacker' : 'objetivo del Doctor', {
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

    this._pRole = this.add.text(cx, cy + 22, bridge.meta.role === 'hacker' ? '🕶️ Hacker' : '🩺 Doctor', {
      fontFamily: 'system-ui, sans-serif', fontSize: '10px', color: '#000',
      backgroundColor: bridge.meta.role === 'hacker' ? '#4ade80' : '#60a5fa', padding: { x: 3, y: 1 },
    }).setOrigin(0.5).setDepth(12)
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
