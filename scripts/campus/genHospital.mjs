// Genera el layout INICIAL del Hospital Escuela "El Sagrado Corazón" (src/data/hospitalLayout.json).
// Es un plano por módulos: una "calle" central (pasillo E-O), dos alas y un bloque de servicios hacia el norte,
// 5 niveles + azotea con helipuerto. Después se afina a mano en /vr/editor?map=hospital.
// Uso: node scripts/campus/genHospital.mjs   (OJO: sobrescribe lo que hayas editado)
import { writeFileSync } from 'node:fs'

const FH = 4.4
let seed = 777
const R = () => { seed = (seed + 0x6d2b79f5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
const items = []
let n = 0
const add = (o) => { const it = { id: `${o.type[0]}${++n}`, ...o }; items.push(it); return it }
const rooms = []
const room = (level, kind, x0, x1, z0, z1, extra = {}) => { const r = add({ type: 'room', x: (x0 + x1) / 2, z: (z0 + z1) / 2, w: x1 - x0, d: z1 - z0, level, kind, ...extra }); rooms.push(r); return r }

// ── Relleno de filas ─────────────────────────────────────────────────────────
// fillX: cuartos consecutivos a lo largo de X ([kind, ancho, nombre?]); fillZ: lo mismo a lo largo de Z (hacia el norte, z decreciente).
const fillX = (level, x0, z0, z1, list) => { let x = x0; for (const [kind, w, name] of list) { room(level, kind, x, x + w, z0, z1, name ? { name } : {}); x += w } }
const fillZ = (level, x0, x1, zStart, list) => { let z = zStart; for (const [kind, name] of list) { room(level, kind, x0, x1, z - 14, z, name ? { name } : {}); z -= 14 } }
const nums = (level, base, kind, count, prefix = 'Hab.') => Array.from({ length: count }, (_, i) => [kind, `${prefix} ${level}${String(base + i).padStart(2, '0')}`])

// ── NIVEL 0 · Planta baja: admisión, urgencias, diagnóstico y servicios ─────
const L0 = () => {
  fillX(0, -84, 3, 17, [['cafeteria', 24]])
  fillX(0, -54, 3, 17, [['reception', 12], ['pharmacy', 12], ['chapel', 12]])
  fillX(0, 18, 3, 17, [['blood', 12], ['lab', 24]])
  fillX(0, 60, 3, 17, [['waiting', 12, 'Sala de espera general'], ['security', 12]])
  fillX(0, -84, -17, -3, [['triage', 12], ['resus', 12]])
  fillX(0, -54, -17, -3, [['erbay', 12], ['observ', 12], ['trauma', 12]])
  fillX(0, 18, -17, -3, [['consult', 12, 'Consultorio 1'], ['consult', 12, 'Consultorio 2'], ['consult', 12, 'Consultorio 3']])
  fillX(0, 60, -17, -3, [['xray', 12], ['us', 12]])
  fillZ(0, -74, -60, -17, [['peds_er'], ['decon'], ['observ', 'Observación pediátrica'], ['erbay', 'Boxes pediátricos'], ['supply', 'Almacén de urgencias']])
  fillZ(0, -54, -40, -17, [['cast'], ['trauma', 'Trauma 2'], ['xray', 'Rayos X urgencias'], ['us', 'Ultrasonido urgencias'], ['closet']])
  fillZ(0, 40, 54, -17, [['ct'], ['mri'], ['cath'], ['endo'], ['nuclear']])
  fillZ(0, 60, 74, -17, [['office', 'Sala de lectura de estudios'], ['waiting', 'Espera de imagenología'], ['ecg'], ['consult', 'Consultorio de cardiología'], ['consult', 'Consultorio de neurología']])
  fillZ(0, -18, -4, -17, [['kitchen'], ['laundry'], ['supply'], ['cssd'], ['plant']])
  fillZ(0, 4, 18, -17, [['path'], ['morgue'], ['boiler'], ['gases'], ['waste']])
}
// ── NIVEL 1 · Quirófanos, cuidados críticos, materno y oncología ────────────
const L1 = () => {
  fillX(1, -84, 3, 17, [['waiting', 12, 'Espera quirúrgica'], ['ambsurg', 12]])
  fillX(1, -54, 3, 17, [['nicu', 24], ['labor', 12]])
  fillX(1, 18, 3, 17, [['dialysis', 24], ['infusion', 12]])
  fillX(1, 60, 3, 17, [['linac', 24]])
  fillX(1, -84, -17, -3, [['pacu', 24]])
  fillX(1, -54, -17, -3, [['or', 12, 'Quirófano 1'], ['or', 12, 'Quirófano 2'], ['or', 12, 'Quirófano 3']])
  fillX(1, 18, -17, -3, [['or', 12, 'Quirófano 4'], ['or', 12, 'Quirófano 5'], ['or', 12, 'Quirófano 6']])
  fillX(1, 60, -17, -3, [['or', 12, 'Quirófano híbrido'], ['scrub', 12]])
  fillZ(1, -74, -60, -17, [['icu', 'UCI adulto A'], ['icu', 'UCI adulto B'], ['ccu'], ['isolation'], ['isolation']])
  fillZ(1, -54, -40, -17, [['ccu', 'Unidad coronaria 2'], ['icu', 'UCI quirúrgica'], ['isolation', 'Aislamiento 3'], ['nurse'], ['supply', 'Almacén de UCI']])
  fillZ(1, 40, 54, -17, [['labor', 'Trabajo de parto 1'], ['labor', 'Trabajo de parto 2'], ['labor', 'Trabajo de parto 3'], ['nursery'], ['labor', 'Sala de partos']])
  fillZ(1, 60, 74, -17, [['or', 'Quirófano de cesáreas'], ['scrub'], ['pacu', 'Recuperación obstétrica'], ['nursery', 'Neonatos sanos'], ['office', 'Lactancia']])
  fillZ(1, -18, -4, -17, [['or', 'Quirófano 7'], ['or', 'Quirófano 8'], ['or', 'Quirófano 9'], ['or', 'Quirófano 10'], ['or', 'Quirófano 11']])
  fillZ(1, 4, 18, -17, [['or', 'Quirófano 12'], ['scrub'], ['supply', 'Almacén estéril'], ['office', 'Estación de anestesia'], ['residents', 'Sala de cirujanos']])
}
// ── NIVEL 2 · Hospitalización A (medicina interna y cirugía) ────────────────
const L2 = () => {
  fillX(2, -84, 3, 17, [['ward', 12, 'Hab. 201'], ['ward', 12, 'Hab. 202']])
  fillX(2, -54, 3, 17, [['ward', 12, 'Hab. 203'], ['nurse', 12], ['ward', 12, 'Hab. 204']])
  fillX(2, 18, 3, 17, [['ward', 12, 'Hab. 205'], ['nurse', 12], ['ward', 12, 'Hab. 206']])
  fillX(2, 60, 3, 17, [['ward', 12, 'Hab. 207'], ['ward', 12, 'Hab. 208']])
  fillX(2, -84, -17, -3, [['ward', 12, 'Hab. 209'], ['ward', 12, 'Hab. 210']])
  fillX(2, -54, -17, -3, [['ward', 12, 'Hab. 211'], ['nurse', 12], ['ward', 12, 'Hab. 212']])
  fillX(2, 18, -17, -3, [['ward', 12, 'Hab. 213'], ['nurse', 12], ['ward', 12, 'Hab. 214']])
  fillX(2, 60, -17, -3, [['ward', 12, 'Hab. 215'], ['ward', 12, 'Hab. 216']])
  fillZ(2, -74, -60, -17, nums(2, 20, 'ward', 5))
  fillZ(2, -54, -40, -17, [['ward', 'Hab. 230'], ['ward', 'Hab. 231'], ['nurse', 'Enfermería ala oeste'], ['ward', 'Hab. 232'], ['ward', 'Hab. 233']])
  fillZ(2, 40, 54, -17, nums(2, 40, 'ward', 5))
  fillZ(2, 60, 74, -17, nums(2, 50, 'single', 5, 'Ind.'))
}
// ── NIVEL 3 · Hospitalización B (pediatría, materno y oncología) ────────────
const L3 = () => {
  fillX(3, -84, 3, 17, [['peds_ward', 12, 'Pediatría 301'], ['peds_ward', 12, 'Pediatría 302']])
  fillX(3, -54, 3, 17, [['peds_ward', 12, 'Pediatría 303'], ['nurse', 12, 'Enfermería pediátrica'], ['peds_ward', 12, 'Pediatría 304']])
  fillX(3, 18, 3, 17, [['single', 12, 'Oncología 301'], ['nurse', 12, 'Enfermería oncología'], ['single', 12, 'Oncología 302']])
  fillX(3, 60, 3, 17, [['single', 12, 'Oncología 303'], ['single', 12, 'Oncología 304']])
  fillX(3, -84, -17, -3, [['ward', 12, 'Hab. 309'], ['ward', 12, 'Hab. 310']])
  fillX(3, -54, -17, -3, [['labor', 12, 'Posparto 1'], ['nursery', 12], ['labor', 12, 'Posparto 2']])
  fillX(3, 18, -17, -3, [['single', 12, 'Ind. 313'], ['nurse', 12], ['single', 12, 'Ind. 314']])
  fillX(3, 60, -17, -3, [['ward', 12, 'Hab. 315'], ['ward', 12, 'Hab. 316']])
  fillZ(3, -74, -60, -17, nums(3, 20, 'peds_ward', 5, 'Pediatría'))
  fillZ(3, -54, -40, -17, [['peds_ward', 'Pediatría 330'], ['peds_ward', 'Pediatría 331'], ['nurse'], ['peds_ward', 'Pediatría 332'], ['labor', 'Posparto 3']])
  fillZ(3, 40, 54, -17, nums(3, 40, 'ward', 5))
  fillZ(3, 60, 74, -17, [['single', 'Ind. 350'], ['single', 'Ind. 351'], ['nurse'], ['single', 'Ind. 352'], ['single', 'Ind. 353']])
}
// ── NIVEL 4 · Enseñanza e investigación ─────────────────────────────────────
const L4 = () => {
  fillX(4, -84, 3, 17, [['classroom', 12, 'Aula 401'], ['classroom', 12, 'Aula 402']])
  fillX(4, -54, 3, 17, [['aula', 36]])
  fillX(4, 18, 3, 17, [['library', 36]])
  fillX(4, 60, 3, 17, [['conference', 12], ['conference', 12, 'Sala de sesiones 2']])
  fillX(4, -84, -17, -3, [['residents', 12], ['office', 12, 'Coordinación de internado']])
  fillX(4, -54, -17, -3, [['director', 12], ['conference', 12, 'Comité de ética'], ['classroom', 12, 'Aula 403']])
  fillX(4, 18, -17, -3, [['sim', 24], ['telemed', 12]])
  fillX(4, 60, -17, -3, [['anatomy', 24]])
  fillZ(4, -74, -60, -17, [['sim', 'Simulación: urgencias'], ['sim', 'Simulación: UCI'], ['sim', 'Simulación: quirófano'], ['classroom', 'Aula de habilidades'], ['classroom', 'Aula 404']])
  fillZ(4, -54, -40, -17, [['classroom', 'Aula 405'], ['conference'], ['classroom', 'Aula 406'], ['residents', 'Guardia de residentes 2'], ['office']])
  fillZ(4, 40, 54, -17, [['research'], ['research', 'Laboratorio de genómica'], ['research', 'Laboratorio de microbiología'], ['anatomy', 'Anatomía 2'], ['research', 'Bioterio']])
  fillZ(4, 60, 74, -17, [['library', 'Hemeroteca'], ['classroom', 'Aula 407'], ['conference', 'Sala de tumores'], ['telemed', 'Telemedicina 2'], ['office', 'Oficina de investigación']])
}
;[L0, L1, L2, L3, L4].forEach((f) => f())

// ── Circulaciones: pasillos y núcleos (escaleras, ascensores) en cada nivel ──
const stairsAt = [[-18, -12, -17, -3], [12, 18, -17, -3], [-60, -54, 3, 17], [54, 60, 3, 17]]
for (let L = 0; L <= 4; L++) {
  room(L, 'corridor', -84, -18, -3, 3, { name: 'Calle central oeste' }); room(L, 'corridor', -18, 18, -3, 3, { name: 'Calle central' }); room(L, 'corridor', 18, 84, -3, 3, { name: 'Calle central este' })
  room(L, 'corridor', -60, -54, -87, -3, { name: 'Ala oeste' }); room(L, 'corridor', 54, 60, -87, -3, { name: 'Ala este' }); room(L, 'corridor', -4, 4, -87, -3, { name: 'Bloque central' })
  for (const [x0, x1, z0, z1] of stairsAt) room(L, 'stairs', x0, x1, z0, z1, { up: true })
  room(L, 'elevator', -12, -8, -9, -3); room(L, 'elevator', -8, -4, -9, -3); room(L, 'elevator', 4, 8, -9, -3); room(L, 'elevator', 8, 12, -9, -3)
  for (const x of [-12, -8, 4, 8]) room(L, 'closet', x, x + 4, -17, -9)
}
// vestíbulo (doble altura) y pasillos de acceso (vía del lobby a la calle central)
room(0, 'lobby', -18, 18, 3, 25, { hh: 2, door: 'S', extraDoor: 'N', name: 'Vestíbulo principal' })
// huecos entre las casas de los 4 cuartos de corredor sur (estar de visitas)
rooms.filter((r) => r.kind === 'stairs' && r.level === 4).forEach((r) => { r.up = true })

// ── Análisis del plano: puertas, ventanas, azoteas, escaleras que suben ─────
const top = (r) => r.level + (r.hh || 1)
const at = (level, x, z) => rooms.find((r) => r.level <= level && level < top(r) && Math.abs(x - r.x) < r.w / 2 - 0.05 && Math.abs(z - r.z) < r.d / 2 - 0.05)
const probe = (r, side, off = 1.0) => {
  const dx = side === 'E' ? r.w / 2 + off : side === 'W' ? -r.w / 2 - off : 0, dz = side === 'S' ? r.d / 2 + off : side === 'N' ? -r.d / 2 - off : 0
  return [r.x + dx, r.z + dz]
}
for (const r of rooms) {
  if (r.kind === 'lobby') { r.ext = 'S'; r.top = !at(r.level + 2, r.x, r.z); continue }
  const sideRooms = {}
  for (const s of 'SNEW') {
    const pts = (s === 'S' || s === 'N') ? [-r.w / 4, 0, r.w / 4].map((o) => [r.x + o, probe(r, s)[1]]) : [-r.d / 4, 0, r.d / 4].map((o) => [probe(r, s)[0], r.z + o])
    sideRooms[s] = pts.map(([x, z]) => at(r.level, x, z))
  }
  if (r.kind === 'corridor') {
    r.walls = ''; r.ext = ''; r.rail = ''
    for (const s of 'SNEW') {
      const hit = sideRooms[s].filter(Boolean)
      if (!hit.length) { r.walls += s; r.ext += s } // abierto al exterior → pared con ventanas
      else if (hit.every((h) => h.kind === 'lobby')) r.rail += s // sobre el atrio → barandal
    }
    r.door = ''
  } else {
    r.ext = ''
    const corrSide = ['S', 'N', 'E', 'W'].find((s) => sideRooms[s].some((h) => h && (h.kind === 'corridor' || h.kind === 'lobby')))
    for (const s of 'SNEW') if (!sideRooms[s].some(Boolean)) r.ext += s
    if (!r.door) r.door = corrSide || 'S'
    if (r.kind === 'stairs') r.door = corrSide || 'S'
  }
  r.top = !at(top(r), r.x, r.z)
  if (r.kind === 'stairs') r.up = r.level < 4 ? true : r.top // el último nivel sube a la azotea
  if (r.kind === 'triage') r.extraDoor = 'W' // entrada de ambulancias
  if (r.top === false) delete r.top
  if (r.ext === '') delete r.ext
  if (!r.up) delete r.up
  if (r.extraDoor === undefined) delete r.extraDoor
  if (r.kind === 'corridor') { if (r.rail === '') delete r.rail; if (r.walls === '') delete r.walls }
  if (!r.hh || r.hh === 1) delete r.hh
}
for (const r of rooms) if (r.kind === 'corridor' && r.walls === undefined) r.walls = ''

// ── Letreros colgantes en las intersecciones (señalización de orientación) ──
const sign = (level, x, z, text, sub, color, rot = 0) => add({ type: 'sign', x, z, level, text, sub, color, rot, w: 3.6, h: 0.9 })
const DC = { urg: '#e5484d', img: '#8b5cf6', lab: '#14b8a6', cir: '#16a34a', uci: '#f97316', hos: '#0ea5e9', mat: '#ec4899', onc: '#a855f7', ens: '#eab308', srv: '#64748b', farm: '#84cc16', adm: '#475569', cons: '#3b82f6' }
const dir = { 0: [['← Urgencias', 'Emergency · Ala oeste', DC.urg], ['Imagenología →', 'Imaging · Ala este', DC.img], ['↑ Servicios · Morgue', 'Bloque central', DC.srv]], 1: [['← Cuidados críticos', 'ICU · Ala oeste', DC.uci], ['Maternidad →', 'Maternal · Ala este', DC.mat], ['↑ Quirófanos', 'Surgery · Bloque central', DC.cir]], 2: [['← Hospitalización A', 'Inpatient · Ala oeste', DC.hos], ['Hospitalización A →', 'Inpatient · Ala este', DC.hos], ['', '', DC.hos]], 3: [['← Pediatría', 'Paediatrics · Ala oeste', DC.mat], ['Oncología →', 'Oncology · Ala este', DC.onc], ['', '', DC.hos]], 4: [['← Simulación', 'Simulation · Ala oeste', DC.ens], ['Investigación →', 'Research · Ala este', DC.ens], ['', '', DC.ens]] }
for (let L = 0; L <= 4; L++) {
  const [a, b, c] = dir[L]
  sign(L, -57, -1, a[0], a[1], a[2], 0); sign(L, 57, -1, b[0], b[1], b[2], 0)
  if (c[0]) sign(L, 0, -1, c[0], c[1], c[2], 0)
  if (L === 0) { sign(0, -30, 0, '← Urgencias · Farmacia · Capilla', 'Planta baja', DC.urg); sign(0, 30, 0, 'Laboratorio · Consulta externa →', 'Planta baja', DC.cons) }
  sign(L, 0, 0, `NIVEL ${L}`, ['Admisión, urgencias, imagenología y servicios', 'Quirófanos, cuidados críticos y materno-infantil', 'Hospitalización A · Medicina y cirugía', 'Hospitalización B · Pediatría y oncología', 'Enseñanza e investigación'][L], '#334155')
}

// ── Exteriores ───────────────────────────────────────────────────────────────
add({ type: 'pave', x: 0, z: 40, w: 90, d: 22, mat: 'asphalt', rot: 0 }) // acceso y descenso de pacientes
add({ type: 'pave', x: 0, z: 28, w: 64, d: 6, mat: 'stone', rot: 0 })
add({ type: 'pave', x: 0, z: 62, w: 16, d: 24, mat: 'stone', rot: 0 })
add({ type: 'pave', x: -62, z: 85, w: 80, d: 56, mat: 'asphalt', rot: 0 }); add({ type: 'pave', x: 62, z: 85, w: 80, d: 56, mat: 'asphalt', rot: 0 }) // estacionamientos
add({ type: 'pave', x: -92, z: -8, w: 22, d: 30, mat: 'asphalt', rot: 0 }) // bahía de ambulancias
add({ type: 'canopy', x: 0, z: 34, rot: 0, w: 30, d: 10, h: 5 })
add({ type: 'canopy', x: -93, z: -8, rot: 0, w: 14, d: 22, h: 4.6 })
add({ type: 'ambulance', x: -94, z: -2, rot: 90 }); add({ type: 'ambulance', x: -94, z: -13, rot: 90 })
add({ type: 'sign', x: -93, z: 3, level: 0, text: 'Urgencias · Entrada de ambulancias', sub: 'Emergency · Ambulance entrance', color: DC.urg, rot: 0, w: 7, h: 1.4, y0: 3.3, flat: true })
add({ type: 'sign', x: 0, z: 25.5, level: 0, text: 'Hospital Escuela El Sagrado Corazón', sub: 'Teaching hospital · Urgencias 24 h', color: '#dc2626', rot: 0, w: 24, h: 3, y0: 6.2, flat: true })
add({ type: 'emblem', x: 0, z: 25.4, rot: 0, s: 0.55, y: 9.4 })
add({ type: 'helipad', x: 36, z: -10, rot: 0, r: 6.2, y: 5 * FH + 0.4 })
add({ type: 'statue', x: 0, z: 50, s: 1 })
// estacionamientos: autos
const carCols = ['#c0392b', '#2980b9', '#27ae60', '#f1c40f', '#ecf0f1', '#34495e', '#8e44ad', '#e67e22']
for (const cx of [-62, 62]) for (let row = 0; row < 4; row++) for (let i = 0; i < 12; i++) if (R() < 0.62) add({ type: 'car', x: cx - 36 + i * 6.2, z: 68 + row * 11, rot: 0, color: carCols[Math.floor(R() * carCols.length)] })
// jardines: patios interiores, perímetro y bosque lejano
const tree = (x, z, kind) => add({ type: 'tree', x: +x.toFixed(1), z: +z.toFixed(1), rot: Math.round(R() * 360), kind, s: +(0.85 + R() * 0.5).toFixed(2) })
const rectsAll = rooms.map((r) => [r.x - r.w / 2 - 3, r.x + r.w / 2 + 3, r.z - r.d / 2 - 3, r.z + r.d / 2 + 3])
const free = (x, z) => !rectsAll.some(([a, b, c, d]) => x > a && x < b && z > c && z < d) && !items.some((i) => (i.type === 'pave' || i.type === 'canopy') && Math.abs(x - i.x) < (i.w || 0) / 2 + 2 && Math.abs(z - i.z) < (i.d || 0) / 2 + 2)
for (const [x0, x1, z0, z1, kinds] of [[-38, -20, -86, -20, ['birch', 'elm', 'maple']], [20, 38, -86, -20, ['birch', 'elm', 'maple']], [-82, -62, -86, -20, ['pine', 'oak']], [62, 84, -86, -20, ['pine', 'oak']], [-120, 120, 120, 150, ['elm', 'oak', 'maple']]]) {
  for (let x = x0; x <= x1; x += 6) for (let z = z0; z <= z1; z += 6) { const px = x + (R() - 0.5) * 4, pz = z + (R() - 0.5) * 4; if (R() < 0.5 && free(px, pz)) tree(px, pz, kinds[Math.floor(R() * kinds.length)]) }
}
for (let x = -230; x <= 230; x += 12) for (let z = -230; z <= 230; z += 12) { const px = x + (R() - 0.5) * 8, pz = z + (R() - 0.5) * 8, d = Math.hypot(px / 1.2, pz + 20); if (d > 150 && R() < 0.55 && free(px, pz)) tree(px, pz, ['pine', 'oak', 'elm', 'pine'][Math.floor(R() * 4)]) }
for (const sx of [-1, 1]) for (let z = 30; z <= 50; z += 10) add({ type: 'lamp', x: sx * 36, z })
for (let x = -30; x <= 30; x += 10) add({ type: 'lamp', x, z: 49 })
for (const [x, z, rot] of [[-30, 32, 0], [30, 32, 0], [-38, -50, 90], [38, -50, -90]]) add({ type: 'bench', x, z, rot })
// jardines de los patios (andadores)
add({ type: 'pave', x: -29, z: -53, w: 14, d: 60, mat: 'gravel', rot: 0 }); add({ type: 'pave', x: 29, z: -53, w: 14, d: 60, mat: 'gravel', rot: 0 })

// ── NPC (guías y personal) ───────────────────────────────────────────────────
const npcIn = (kind, name) => { const r = rooms.find((q) => q.kind === kind && (!name || q.name === name)); if (r) add({ type: 'npc', x: r.x, z: r.z + 1.5, y: r.level * FH + 0.3 }) }
add({ type: 'npc', x: 0, z: 14, y: 0.3 })
;['triage', 'resus', 'or', 'icu', 'lab', 'pharmacy', 'aula', 'anatomy', 'chapel', 'sim'].forEach((k) => npcIn(k))

add({ type: 'portal', x: -14, z: 70, rot: 0, to: '/vr/plaza', label: 'Plaza de las Academias', color: '#ffb347' })
const data = { version: 1, map: 'hospital', terrain: 'flat', ambient: 0.26, lamp: 2.6, spawn: [0, 78], items }
writeFileSync(new URL('../../src/data/hospitalLayout.json', import.meta.url), JSON.stringify(data).replace(/\},\{/g, '},\n{'))
const byKind = rooms.reduce((a, r) => ((a[r.kind] = (a[r.kind] || 0) + 1), a), {})
console.log('items', items.length, 'rooms', rooms.length, byKind)
