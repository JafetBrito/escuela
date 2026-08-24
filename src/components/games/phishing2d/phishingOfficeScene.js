import Phaser from 'phaser'
import { PHISHING_OFFICE_QUESTIONS } from '../../../data/phishingOfficeQuestions'

// Curso 2D "Protégete del Phishing" — mismo motor que hospitalScene.js
// (zonas de proximidad → panel de React), pero con dos simplificaciones
// porque este juego es SIEMPRE de un solo jugador: sin nada de multijugador
// (_others/addOther/onPosition no existen aquí, a diferencia del Hospital)
// y con assets reales de Kenney (CC0, ver public/games/phishing-office/
// CREDITS.txt) en vez de Graphics/emoji — primera vez que se usa un
// tileset/spritesheet real en el proyecto en lugar del estilo procedural
// de campusScene.js/hospitalScene.js.
const W = 900
const H = 700
const SPEED = 220
const ZONE_RADIUS = 70

// Un escritorio por pregunta (mismo orden que PHISHING_OFFICE_QUESTIONS),
// repartidos en 2 filas de 3 — suficiente para un piloto chico sin necesitar
// varios cuartos con puertas (eso queda para si el formato se valida).
const DESK_POSITIONS = [
  { x: 180, y: 220 }, { x: 450, y: 220 }, { x: 720, y: 220 },
  { x: 180, y: 480 }, { x: 450, y: 480 }, { x: 720, y: 480 },
]

// Decoración fija sin interacción — solo para que la oficina no se sienta
// vacía. Coordenadas de tile elegidas a mano inspeccionando el spritesheet
// (ver memoria del proyecto para el detalle de cómo se ubicaron).
const DECOR = [
  { x: 60, y: 60, key: 'cabinet' }, { x: 840, y: 60, key: 'cabinet' },
  { x: 60, y: 640, key: 'cabinet' }, { x: 840, y: 640, key: 'plant' },
  { x: 450, y: 40, key: 'picture' }, { x: 450, y: 660, key: 'plant' },
  { x: 60, y: 350, key: 'picture' }, { x: 840, y: 350, key: 'plant' },
]

export const bridge = {
  dir: { current: { x: 0, y: 0 } },
  onZoneNear: null, // (id, near)
  scene: null,
}

export default class PhishingOfficeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PhishingOfficeScene' })
    this._nearId = null
    this._answered = new Set()
  }

  preload() {
    this.load.image('env', '/games/phishing-office/roguelikeSheet_transparent.png')
    this.load.image('chars', '/games/phishing-office/roguelikeChar_transparent.png')
  }

  create() {
    bridge.scene = this
    this._buildTextureFrames()
    this._drawFloor()
    this._makeDesks()
    this._makeDecor()
    this._makePlayer()

    this._cursors = this.input.keyboard.createCursorKeys()
    this._wasd = this.input.keyboard.addKeys('W,A,S,D')

    this.cameras.main.setBounds(0, 0, W, H)
    this.cameras.main.startFollow(this._player, true, 0.1, 0.1)
    this.physics.world.setBounds(0, 0, W, H)
  }

  // El spritesheet no trae un atlas con nombres — son grids de 16x16 con
  // 1px de margen (ver CREDITS.txt), así que se recortan a mano los tiles
  // puntuales que hacen falta en vez de cargar la hoja entera como
  // spritesheet indexado (evita depender de que la grilla completa cuadre).
  _buildTextureFrames() {
    const pitch = 17, tile = 16
    const cut = (key, tex, col, row) => {
      if (this.textures.exists(key)) return
      this.textures.addSpriteSheetFromAtlas // no-op, mantiene lint de imports estable
      const source = this.textures.get(tex).getSourceImage()
      const canvasTex = this.textures.createCanvas(key, tile, tile)
      canvasTex.context.drawImage(source, col * pitch, row * pitch, tile, tile, 0, 0, tile, tile)
      canvasTex.refresh()
    }
    cut('t_floor', 'env', 13, 16)
    cut('t_desk', 'env', 22, 6)
    cut('t_chair', 'env', 19, 3)
    cut('t_cabinet', 'env', 28, 0)
    cut('t_plant', 'env', 18, 9)
    cut('t_picture', 'env', 29, 10)
    cut('t_player', 'chars', 0, 7)
  }

  _drawFloor() {
    // TileSprite repite una sola textura en toda el área — no hace falta
    // un Tilemap completo para un piso uniforme.
    this.add.tileSprite(0, 0, W, H, 't_floor').setOrigin(0, 0)
    const border = this.add.graphics()
    border.lineStyle(4, 0x5b4636, 0.6)
    border.strokeRect(2, 2, W - 4, H - 4)
  }

  _makeDesks() {
    this._deskZones = DESK_POSITIONS.map((pos, i) => {
      const q = PHISHING_OFFICE_QUESTIONS[i]
      this.add.image(pos.x, pos.y - 10, 't_chair').setScale(2).setDepth(4)
      this.add.image(pos.x, pos.y, 't_desk').setScale(2.4).setDepth(5)
      const label = this.add.text(pos.x, pos.y - 46, q.deskLabel, {
        fontFamily: 'system-ui, sans-serif', fontSize: '12px', color: '#fff',
        backgroundColor: '#00000077', padding: { x: 5, y: 2 },
      }).setOrigin(0.5).setDepth(6)
      const check = this.add.text(pos.x + 26, pos.y - 46, '', {
        fontFamily: 'system-ui, sans-serif', fontSize: '14px', color: '#4ade80',
      }).setOrigin(0.5).setDepth(6)
      return { id: q.id, x: pos.x, y: pos.y, label, check }
    })
  }

  _makeDecor() {
    for (const d of DECOR) {
      this.add.image(d.x, d.y, `t_${d.key}`).setScale(2).setDepth(3).setAlpha(0.92)
    }
  }

  _makePlayer() {
    this._player = this.physics.add.image(W / 2, H / 2 + 120, 't_player')
      .setScale(2.4).setCollideWorldBounds(true).setDepth(10)
  }

  // Llamado desde React cuando el jugador responde (bien o mal) una zona —
  // marca el escritorio como visitado con un check visual.
  markAnswered(id) {
    this._answered.add(id)
    const zone = this._deskZones?.find((z) => z.id === id)
    zone?.check.setText('✅')
  }

  update() {
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
    if (vx !== 0) this._player.setFlipX(vx < 0)

    const px = this._player.x, py = this._player.y
    let nearestId = null, nearestDist = Infinity
    for (const z of this._deskZones) {
      const dist = Phaser.Math.Distance.Between(px, py, z.x, z.y)
      if (dist < ZONE_RADIUS && dist < nearestDist) { nearestDist = dist; nearestId = z.id }
    }
    if (nearestId !== this._nearId) {
      this._nearId = nearestId
      bridge.onZoneNear?.(nearestId)
    }
  }
}
