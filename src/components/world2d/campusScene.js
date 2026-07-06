import Phaser from 'phaser'

// ── World dimensions ──────────────────────────────────────────────────────────
const W = 2400
const H = 1800
const SPEED = 230
const NPC_RADIUS = 90

// ── Campus zones ──────────────────────────────────────────────────────────────
const ZONES = [
  { x: 820,  y: 500,  w: 640, h: 420, label: '🏛️ Gran Aula',      fill: 0x0d1e3d, glow: 0x1e4888, text: '#60a5fa' },
  { x: 160,  y: 620,  w: 380, h: 300, label: '🎭 Anfiteatro',       fill: 0x1a0d2e, glow: 0x4d1a80, text: '#c084fc' },
  { x: 1700, y: 560,  w: 440, h: 360, label: '📚 Biblioteca',        fill: 0x0a1f0a, glow: 0x1a5a20, text: '#4ade80' },
  { x: 680,  y: 1180, w: 480, h: 280, label: '🎨 Arte & Graffiti',  fill: 0x2a1600, glow: 0x7a4a00, text: '#fb923c' },
  { x: 1380, y: 1180, w: 380, h: 280, label: '🔮 Cueva de Platón',  fill: 0x140030, glow: 0x4400bb, text: '#e879f9' },
  { x: 1050, y: 1560, w: 320, h: 180, label: '🏟️ Arena',            fill: 0x280000, glow: 0x880000, text: '#f87171' },
]

// ── NPCs ──────────────────────────────────────────────────────────────────────
const NPCS = [
  { id: 'oliver',   x: 1100, y: 680, name: 'Oliver',  color: 0x98ca3f, emoji: '🐱',
    dialogue: '¡Bienvenido al campus móvil de Oliver Academy! Explora todos los edificios.' },
  { id: 'einstein', x: 970,  y: 700, name: 'Einstein', color: 0xfbbf24, emoji: '🧑‍🔬',
    dialogue: 'La imaginación es más importante que el conocimiento. — A.E.' },
  { id: 'jafet',   x: 1230, y: 690, name: 'Jafet',    color: 0x60a5fa, emoji: '🛠️',
    dialogue: 'Soy el dev. Si ves algún bug, avísame en el chat.' },
]

// ── Decoration positions ──────────────────────────────────────────────────────
const TREES = [
  [100,100],[300,80],[700,80],[1200,60],[1800,80],[2200,100],[2350,80],
  [80,500],[2360,500],[80,900],[2360,900],[80,1400],[2360,1400],
  [300,1720],[800,1760],[1400,1760],[1900,1760],[2200,1720],
  [550,120],[1550,110],[550,1700],[1550,1700],
]

// ── Module-level bridge (React ↔ Phaser) ──────────────────────────────────────
// React writes to these fields; Phaser reads them every frame.
export const bridge = {
  dir:          { current: { x: 0, y: 0 } },
  meta:         { name: 'Jugador', color: '#98ca3f', level: 1, mascotEmoji: '🐱' },
  onNpcNear:    null,
  onPosition:   null,
  scene:        null,
}

// ── Scene ─────────────────────────────────────────────────────────────────────
export default class CampusScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CampusScene' })
    this._npcs   = []
    this._others = {}   // { [id]: { img, lbl } }
    this._near   = null
    this._posT   = 0
  }

  // ── Asset generation (no external files needed) ────────────────────────────
  preload() {
    const g = this.make.graphics({ add: false })

    g.fillStyle(0xffffff); g.fillCircle(20, 20, 18)
    g.lineStyle(3, 0x000000, 0.35); g.strokeCircle(20, 20, 18)
    g.generateTexture('dot_player', 40, 40)

    g.clear()
    g.fillStyle(0xffffff); g.fillCircle(15, 15, 13)
    g.lineStyle(2, 0x000000, 0.25); g.strokeCircle(15, 15, 13)
    g.generateTexture('dot_npc', 30, 30)

    g.clear()
    g.fillStyle(0xffffff, 0.75); g.fillCircle(13, 13, 11)
    g.generateTexture('dot_other', 26, 26)

    g.destroy()
  }

  // ── Scene creation ─────────────────────────────────────────────────────────
  create() {
    bridge.scene = this

    this._drawMap()
    this._makePlayer()
    this._makeNpcs()

    this._cursors = this.input.keyboard.createCursorKeys()
    this._wasd    = this.input.keyboard.addKeys('W,A,S,D')

    this.cameras.main.setBounds(0, 0, W, H)
    this.cameras.main.startFollow(this._player, true, 0.08, 0.08)
    this.cameras.main.setZoom(1.3)

    this.physics.world.setBounds(0, 0, W, H)
  }

  // ── Map drawing ────────────────────────────────────────────────────────────
  _drawMap() {
    const g = this.add.graphics()

    // Ground
    g.fillStyle(0x081208); g.fillRect(0, 0, W, H)

    // Subtle grid
    g.lineStyle(1, 0x142414, 0.5)
    for (let x = 0; x < W; x += 80) g.strokeLineShape(new Phaser.Geom.Line(x, 0, x, H))
    for (let y = 0; y < H; y += 80) g.strokeLineShape(new Phaser.Geom.Line(0, y, W, y))

    // Paths (main cross + side alleys)
    g.fillStyle(0x181f28)
    g.fillRect(0, 880, W, 100)
    g.fillRect(1150, 0, 100, H)
    g.fillRect(640, 790, 80, 440)
    g.fillRect(1640, 790, 80, 440)
    g.fillRect(820, 0, 100, 540)

    // Buildings
    for (const z of ZONES) {
      g.fillStyle(0x000000, 0.45)
      g.fillRoundedRect(z.x + 7, z.y + 7, z.w, z.h, 14)
      g.fillStyle(z.fill, 1)
      g.fillRoundedRect(z.x, z.y, z.w, z.h, 14)
      g.lineStyle(2, z.glow, 0.9)
      g.strokeRoundedRect(z.x, z.y, z.w, z.h, 14)
      g.lineStyle(1, z.glow, 0.25)
      g.strokeRoundedRect(z.x + 5, z.y + 5, z.w - 10, z.h - 10, 10)
    }

    for (const z of ZONES) {
      this.add.text(z.x + z.w / 2, z.y + z.h / 2, z.label, {
        fontFamily: '"Segoe UI Emoji", system-ui, sans-serif',
        fontSize: '22px', color: z.text, align: 'center',
        stroke: '#000000', strokeThickness: 4,
      }).setOrigin(0.5)
    }

    // Trees
    for (const [tx, ty] of TREES) {
      const t = this.add.graphics()
      t.fillStyle(0x3a2008); t.fillRect(tx - 4, ty + 6, 8, 12)
      t.fillStyle(0x1a5a1a); t.fillCircle(tx, ty, 20)
      t.fillStyle(0x22781a); t.fillCircle(tx - 5, ty - 5, 13)
      t.fillStyle(0x2a8a22); t.fillCircle(tx + 3, ty - 8, 10)
    }

    // Spawn ring
    const sp = this.add.graphics()
    sp.lineStyle(2, 0x98ca3f, 0.4)
    for (let r = 30; r <= 70; r += 20) sp.strokeCircle(1200, 920, r)
    this.add.text(1200, 960, 'SPAWN', {
      fontFamily: 'system-ui, sans-serif', fontSize: '11px',
      color: '#98ca3f', alpha: 0.5, letterSpacing: 4,
    }).setOrigin(0.5)
  }

  // ── Player ─────────────────────────────────────────────────────────────────
  _makePlayer() {
    const tint = parseInt(bridge.meta.color.replace('#', ''), 16)
    this._player = this.physics.add.image(1200, 920, 'dot_player')
      .setTint(tint).setDepth(10).setCollideWorldBounds(true)

    this._pName = this.add.text(1200, 890, bridge.meta.name, {
      fontFamily: 'system-ui, sans-serif', fontSize: '13px',
      color: '#fff', stroke: '#000', strokeThickness: 3,
      backgroundColor: '#00000055', padding: { x: 4, y: 2 },
    }).setOrigin(0.5).setDepth(11)

    this._pLv = this.add.text(1200, 942, `Lv.${bridge.meta.level}`, {
      fontFamily: 'system-ui, sans-serif', fontSize: '10px',
      color: '#000', backgroundColor: '#98ca3f', padding: { x: 3, y: 1 },
    }).setOrigin(0.5).setDepth(12)

    // Mascot emoji sprite — floats just below-right of the player
    this._mascot = this.add.text(1220, 940, bridge.meta.mascotEmoji, {
      fontFamily: '"Segoe UI Emoji", system-ui, sans-serif',
      fontSize: '20px',
    }).setOrigin(0.5).setDepth(11)

    this.tweens.add({
      targets: this._mascot, y: '+=6',
      duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    })
  }

  // ── NPCs ───────────────────────────────────────────────────────────────────
  _makeNpcs() {
    for (const npc of NPCS) {
      const img = this.add.image(npc.x, npc.y, 'dot_npc')
        .setTint(npc.color).setDepth(8)

      // Interaction ring (faint)
      const ring = this.add.graphics()
      ring.lineStyle(1, npc.color, 0.18)
      ring.strokeCircle(npc.x, npc.y, NPC_RADIUS)

      this.add.text(npc.x, npc.y - 22, `${npc.emoji} ${npc.name}`, {
        fontFamily: 'system-ui, sans-serif', fontSize: '12px',
        color: '#fff', stroke: '#000', strokeThickness: 3,
        backgroundColor: '#00000066', padding: { x: 3, y: 2 },
      }).setOrigin(0.5).setDepth(9)

      // Idle float
      this.tweens.add({
        targets: img, y: npc.y - 7,
        duration: 900 + Math.random() * 400,
        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        delay: Math.random() * 600,
      })

      this._npcs.push(npc)
    }
  }

  // ── Multiplayer API (called from React) ────────────────────────────────────
  addOther(id, x, y, name, color) {
    if (this._others[id]) return
    const tint = parseInt((color ?? '#888').replace('#', ''), 16)
    const img = this.add.image(x, y, 'dot_other')
      .setTint(tint).setAlpha(0.78).setDepth(7)
    const lbl = this.add.text(x, y - 19, name, {
      fontFamily: 'system-ui, sans-serif', fontSize: '11px',
      color: '#ccc', stroke: '#000', strokeThickness: 2,
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

  // ── Game loop ──────────────────────────────────────────────────────────────
  update(_, delta) {
    const dir = bridge.dir?.current ?? { x: 0, y: 0 }
    const { left, right, up, down } = this._cursors
    const { A, D, W: wKey, S } = this._wasd ?? {}

    let vx = dir.x * SPEED
    let vy = dir.y * SPEED

    if (left.isDown  || A?.isDown) vx = -SPEED
    if (right.isDown || D?.isDown) vx =  SPEED
    if (up.isDown    || wKey?.isDown) vy = -SPEED
    if (down.isDown  || S?.isDown) vy =  SPEED

    // Normalize diagonal
    if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707 }

    this._player.setVelocity(vx, vy)

    const px = this._player.x, py = this._player.y
    this._pName.setPosition(px, py - 28)
    this._pLv.setPosition(px, py + 22)
    // Mascot trails slightly to the right of the player
    this._mascot.setPosition(px + 22, py + 8)

    // NPC proximity
    let found = null
    for (const npc of this._npcs) {
      if (Phaser.Math.Distance.Between(px, py, npc.x, npc.y) < NPC_RADIUS) {
        found = npc; break
      }
    }
    if (found?.id !== this._near?.id) {
      this._near = found
      bridge.onNpcNear?.(found)
    }

    // Throttled position broadcast
    this._posT += delta
    if (this._posT > 2000) {
      this._posT = 0
      bridge.onPosition?.(px, py)
    }
  }
}
