import Phaser from 'phaser'

// ── World dimensions ──────────────────────────────────────────────────────────
const W = 4800
const H = 3600
// El campus original (2400x1800) ahora vive en el centro del mundo más grande.
const OX = 1200
const OY = 900
export const SPAWN = { x: 1200 + OX, y: 920 + OY }
const TILE = 48
const SPEED = 230
const NPC_RADIUS = 90

// ── Campus zones ──────────────────────────────────────────────────────────────
const ZONES = [
  // (coordenadas del campus original; se desplazan con OX/OY al construir)
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

// ── Procedural terrain ────────────────────────────────────────────────────────
// Mismo seed para todos: cada jugador ve exactamente el mismo mundo.
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const hash = (x, y) => { let h = Math.imul(x, 374761393) + Math.imul(y, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296 }
const smooth = (t) => t * t * (3 - 2 * t)
// Value noise 0..1 con varias octavas — da lagos, arena y claros de bosque orgánicos.
function noise(x, y) {
  let amp = 1, freq = 1 / 14, sum = 0, norm = 0
  for (let o = 0; o < 3; o++) {
    const xi = Math.floor(x * freq), yi = Math.floor(y * freq)
    const xf = smooth(x * freq - xi), yf = smooth(y * freq - yi)
    const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1)
    sum += amp * (a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf)
    norm += amp; amp /= 2; freq *= 2
  }
  return sum / norm
}
// Zona protegida: el campus + sus caminos no llevan agua ni bosque encima.
const inCampus = (x, y) => x > OX - 60 && x < OX + 2460 && y > OY - 60 && y < OY + 1860
const onRoad = (x, y) => Math.abs(y - (OY + 930)) < 70 || Math.abs(x - (OX + 1200)) < 70
const terrainAt = (tx, ty) => {
  const x = tx * TILE + TILE / 2, y = ty * TILE + TILE / 2
  if (inCampus(x, y) || onRoad(x, y)) return 'grass'
  const n = noise(tx, ty)
  if (n < 0.34) return 'water'
  if (n < 0.4) return 'sand'
  return 'grass'
}
const isWaterAt = (x, y) => terrainAt(Math.floor(x / TILE), Math.floor(y / TILE)) === 'water'

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

    // Terreno procedural: pasto/arena/agua por ruido, un solo Graphics
    const GRASS = [0x0b1a0b, 0x0d1f0d, 0x0a170a, 0x102410]
    for (let ty = 0; ty < H / TILE; ty++) {
      for (let tx = 0; tx < W / TILE; tx++) {
        const t = terrainAt(tx, ty)
        const j = hash(tx + 7, ty + 13)
        const col = t === 'water' ? (j > 0.5 ? 0x0f3a66 : 0x123f6e) : t === 'sand' ? 0x3a3520 : GRASS[Math.floor(j * GRASS.length)]
        g.fillStyle(col); g.fillRect(tx * TILE, ty * TILE, TILE, TILE)
      }
    }

    // Subtle grid (solo sobre el campus)
    g.lineStyle(1, 0x142414, 0.5)
    for (let x = OX; x <= OX + 2400; x += 80) g.strokeLineShape(new Phaser.Geom.Line(x, OY, x, OY + 1800))
    for (let y = OY; y <= OY + 1800; y += 80) g.strokeLineShape(new Phaser.Geom.Line(OX, y, OX + 2400, y))

    // Caminos: la cruz principal ahora cruza todo el mundo + callejones del campus
    g.fillStyle(0x181f28)
    g.fillRect(0, OY + 880, W, 100)
    g.fillRect(OX + 1150, 0, 100, H)
    g.fillRect(OX + 640, OY + 790, 80, 440)
    g.fillRect(OX + 1640, OY + 790, 80, 440)
    g.fillRect(OX + 820, OY, 100, 540)

    // Buildings
    for (const z of ZONES) {
      g.fillStyle(0x000000, 0.45)
      g.fillRoundedRect(z.x + OX + 7, z.y + OY + 7, z.w, z.h, 14)
      g.fillStyle(z.fill, 1)
      g.fillRoundedRect(z.x + OX, z.y + OY, z.w, z.h, 14)
      g.lineStyle(2, z.glow, 0.9)
      g.strokeRoundedRect(z.x + OX, z.y + OY, z.w, z.h, 14)
      g.lineStyle(1, z.glow, 0.25)
      g.strokeRoundedRect(z.x + OX + 5, z.y + OY + 5, z.w - 10, z.h - 10, 10)
    }

    for (const z of ZONES) {
      this.add.text(z.x + OX + z.w / 2, z.y + OY + z.h / 2, z.label, {
        fontFamily: '"Segoe UI Emoji", system-ui, sans-serif',
        fontSize: '22px', color: z.text, align: 'center',
        stroke: '#000000', strokeThickness: 4,
      }).setOrigin(0.5)
    }

    // Árboles del campus (lista fija) + bosque/rocas/flores procedurales
    const decor = this.add.graphics()
    const tree = (tx, ty, r = 20) => {
      decor.fillStyle(0x3a2008); decor.fillRect(tx - 4, ty + r * 0.3, 8, r * 0.6)
      decor.fillStyle(0x1a5a1a); decor.fillCircle(tx, ty, r)
      decor.fillStyle(0x22781a); decor.fillCircle(tx - r * 0.25, ty - r * 0.25, r * 0.65)
      decor.fillStyle(0x2a8a22); decor.fillCircle(tx + r * 0.15, ty - r * 0.4, r * 0.5)
    }
    for (const [tx, ty] of TREES) tree(tx + OX, ty + OY)

    const rnd = mulberry32(20240925)
    for (let i = 0; i < 2600; i++) {
      const x = rnd() * W, y = rnd() * H
      const kind = rnd()
      if (inCampus(x, y) || onRoad(x, y) || isWaterAt(x, y)) continue
      const dense = noise(x / 3, y / 3) > 0.5 // claros y bosques densos
      if (kind < (dense ? 0.55 : 0.2)) tree(x, y, 14 + rnd() * 14)
      else if (kind < 0.7) { decor.fillStyle(0x4a4f57); decor.fillEllipse(x, y, 16 + rnd() * 16, 11 + rnd() * 8); decor.fillStyle(0x666c75); decor.fillEllipse(x - 3, y - 3, 8, 5) }
      else if (kind < 0.85) { decor.fillStyle(0x1b6a26); decor.fillCircle(x, y, 9 + rnd() * 6) }
      else { const c = [0xf472b6, 0xfacc15, 0xffffff, 0xa78bfa][Math.floor(rnd() * 4)]; decor.fillStyle(c); decor.fillCircle(x, y, 3); decor.fillCircle(x + 7, y + 3, 3); decor.fillCircle(x - 5, y + 5, 3) }
    }

    // Un Graphics con miles de trazos se vuelve a dibujar en CADA frame (pesado en
    // móvil): se hornea una sola vez a texturas de 1200x1200 (bajo el límite de
    // 4096px de GPUs móviles) y se descarta.
    const CH = 1200
    for (let cy = 0; cy < H; cy += CH) {
      for (let cx = 0; cx < W; cx += CH) {
        const rt = this.add.renderTexture(cx, cy, CH, CH).setOrigin(0, 0).setDepth(-1)
        rt.draw(g, -cx, -cy)
        rt.draw(decor, -cx, -cy)
      }
    }
    g.destroy(); decor.destroy()

    // Spawn ring
    const sp = this.add.graphics()
    sp.lineStyle(2, 0x98ca3f, 0.4)
    for (let r = 30; r <= 70; r += 20) sp.strokeCircle(SPAWN.x, SPAWN.y, r)
    this.add.text(SPAWN.x, SPAWN.y + 40, 'SPAWN', {
      fontFamily: 'system-ui, sans-serif', fontSize: '11px',
      color: '#98ca3f', alpha: 0.5, letterSpacing: 4,
    }).setOrigin(0.5)
  }

  // ── Player ─────────────────────────────────────────────────────────────────
  _makePlayer() {
    const tint = parseInt(bridge.meta.color.replace('#', ''), 16)
    this._player = this.physics.add.image(SPAWN.x, SPAWN.y, 'dot_player')
      .setTint(tint).setDepth(10).setCollideWorldBounds(true)

    this._pName = this.add.text(SPAWN.x, SPAWN.y - 30, bridge.meta.name, {
      fontFamily: 'system-ui, sans-serif', fontSize: '13px',
      color: '#fff', stroke: '#000', strokeThickness: 3,
      backgroundColor: '#00000055', padding: { x: 4, y: 2 },
    }).setOrigin(0.5).setDepth(11)

    this._pLv = this.add.text(SPAWN.x, SPAWN.y + 22, `Lv.${bridge.meta.level}`, {
      fontFamily: 'system-ui, sans-serif', fontSize: '10px',
      color: '#000', backgroundColor: '#98ca3f', padding: { x: 3, y: 1 },
    }).setOrigin(0.5).setDepth(12)

    // Mascot emoji sprite — floats just below-right of the player
    this._mascot = this.add.text(SPAWN.x + 20, SPAWN.y + 20, bridge.meta.mascotEmoji, {
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
    for (const base of NPCS) {
      const npc = { ...base, x: base.x + OX, y: base.y + OY }
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

    // Agua poco profunda: se cruza, pero a media velocidad
    const speed = isWaterAt(this._player.x, this._player.y) ? SPEED * 0.5 : SPEED
    let vx = dir.x * speed
    let vy = dir.y * speed

    if (left.isDown  || A?.isDown) vx = -speed
    if (right.isDown || D?.isDown) vx = speed
    if (up.isDown    || wKey?.isDown) vy = -speed
    if (down.isDown  || S?.isDown) vy = speed

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
