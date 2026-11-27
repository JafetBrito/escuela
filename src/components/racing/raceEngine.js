import { RACE, FORKS, ROUTE, MAX_TIER, trackLength, tierSpeed, lvlOfTier, flyAlt, forkLanes, laneBounds, laneOf, shuffle, POWER_KEYS, MAX_POWERS, routeLength, stationPos } from './racingData.js'
import { slopeAt, setTrack } from './trackMath.js'

// Motor de la carrera, SIN React ni three: avanza el estado (distancia s, lado u, velocidad, nivel del vehículo, puntos, poderes) y
// resuelve las bifurcaciones. La escena, el HUD, la voz y la música solo lo leen (y consumen `drain()`, la cola de eventos). Se prueba
// solo con `node` (raceEngine.test.mjs).
//
// CONTROL: acelerar (`throttle`), frenar (`brake`), girar (`steer`) y derrapar (`drift`); sin acelerar el vehículo se detiene (en modo
// `auto` acelera solo). La pendiente cuenta. Derrapar da agarre lateral y, al soltar, un mini-turbo.
// VEHÍCULOS: 14 niveles (0–13). Los 10+ vuelan (altura `alt`). Empiezas en `startTier` (el vehículo que elegiste en el garaje).
// PREGUNTAS: 12 bifurcaciones con 2 o 3 carriles en 3 misiones. La pregunta se elige al acercarse (dificultad según el nivel) y se anuncia a
// 460 m; el vehículo espera en el pórtico hasta que la interfaz avise (`reveal`) que ya se leyó completa. Al entrar a la zona dividida el
// carril queda fijado; 28 m antes de que se junten se evalúa: correcto = turbo y +1 nivel (SIN pausar); trampa = choque y −1 nivel (o la
// absorbe un escudo). Una vez por pregunta se puede "saltar" al carril de una opción.
// PODERES: al empezar cada misión nueva se elige 1 de 3 (`powerChoice` → `addPower`); `usePower(i)` activa los que no son pasivos.
// RUTA DE REPASO: `startDetour(q)` lleva el vehículo a una pista aparte con una estación por cada tramo de la explicación; en cada una
// espera hasta que la interfaz avise (`revealStation`); al final `endDetour` devuelve a la carrera donde la dejaste.
// Opciones de la fase 4: `free` = modo libre (sin preguntas ni bifurcaciones, solo conducir); `fixed` = las 12 preguntas se eligen al empezar
// con dificultad por número de bifurcación (todos los jugadores de una misma `seed` reciben lo mismo); `bots` = rivales de IA [{ name, skill, color,
// char }]; `rivals` = rivales controlados desde fuera (en línea) [{ id, name, color, char }]; `countdown` = segundos de cuenta atrás.
export function mulberry(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
export function createRace(world, { rng = Math.random, auto = false, startTier = 0, free = false, fixed = false, bots = [], rivals = [], countdown = 0, track = 'classic', bonus = true } = {}) {
  setTrack(track) // la forma de la pista (curvas y alturas) se fija antes de crear nada
  const L = trackLength(), len = RACE.forkLen
  const forks = free ? [] : Array.from({ length: FORKS }, (_, i) => ({ id: i, start: RACE.firstFork + i * RACE.spacing, n: forkLanes(i), mission: Math.floor(i / RACE.forksPerMission), q: null, asked: false, revealed: false, jumped: false }))
  const missionStarts = Array.from({ length: RACE.missions }, (_, m) => (m === 0 ? 0 : free ? Math.round((L / RACE.missions) * m) : forks[m * RACE.forksPerMission - 1].start + len + 30))
  const used = new Set()
  const t0 = Math.max(0, Math.min(MAX_TIER, startTier))
  const g = {
    L, forks, missionStarts, world, auto, paused: false, startTier: t0,
    s: 0, u: 0, uv: 0, v: 0, alt: flyAlt(t0), tier: t0, maxTier: t0, correct: 0, wrong: 0, score: 0, time: 0,
    lock: -1, idx: 0, evald: false, crash: 0, boost: 0, jumpT: 0, jumpLane: 0, drifting: false, driftT: 0, holding: false,
    msg: null, msgT: 0, finished: false, finishT: 0, mission: 0, events: [], results: [],
    powers: [], hintFor: -1, detour: null, detours: 0, choosing: null, storyIdx: 0, fxOk: 0,
    free, startIn: countdown, finishTime: null, rivals: [],
  }
  const botRng = mulberry(Math.floor(rng() * 4294967296))
  // CAJAS DE BONUS (?) y PLATAFORMAS DE IMPULSO repartidas al azar (con la misma semilla salen en los mismos sitios): una caja da turbo, un poder,
  // un escudo o puntos; la plataforma da un turbo corto. No hay nada dentro de las zonas de bifurcación.
  const pkRng = mulberry(Math.floor(rng() * 4294967296))
  g.pickups = []
  for (let s = 380, id = 0; s < L - 260; id++) {
    s += 150 + pkRng() * 260
    if (forks.some((f) => s > f.start - 90 && s < f.start + len + 30)) continue
    if (pkRng() < 0.3) g.pickups.push({ id, kind: 'pad', s, u: (pkRng() - 0.5) * 9, taken: false })
    else { const row = pkRng() < 0.45 ? [-4.6, 0, 4.6] : [(pkRng() - 0.5) * 11]; for (const u of row) g.pickups.push({ id: `${id}.${u}`, kind: 'box', s, u, taken: false, reward: ['boost', 'power', 'shield', 'coins'][Math.floor(pkRng() * 4)] }) }
  }
  if (!bonus) g.pickups = []
  g.pk = 0; g.fxBox = 0; g.boxAt = null // índice de la siguiente por recoger, contador de efectos y dónde se recogió la última
  const mk = (r, i, bot) => ({ id: r.id || `bot${i}`, name: r.name || `Bot ${i + 1}`, color: r.color || '#94a3b8', char: r.char || null, bot, skill: r.skill ?? 0.7, tier: t0, s: 0, u: ((i % 3) - 1) * 3, uv: 0, v: 0, alt: flyAlt(t0), idx: 0, ok: null, evald: false, crash: 0, boost: 0, finished: false, finishT: null })
  g.rivals = [...bots.map((b, i) => mk(b, i, true)), ...rivals.map((r, i) => mk(r, bots.length + i, false))]
  const say = (kind, tier = null) => { g.msg = { kind, tier }; g.msgT = 3.2 } // la interfaz lo traduce
  const emit = (e) => g.events.push(e)
  emit({ type: 'mission', index: 0 })

  // Elige la pregunta de la bifurcación `f`: del tema de la misión, sin repetir, con n−1 trampas y la dificultad más cercana al nivel actual
  function pick(f) {
    const topics = world.missions[f.mission].topics, want = fixed ? Math.min(4, Math.floor(f.id / 3)) : lvlOfTier(g.tier)
    const pool = (strict, reuse) => world.questions.filter((q) => (reuse || !used.has(q)) && q.bad.length >= f.n - 1 && (!strict || topics.includes(q.t)))
    let c = pool(true, false); if (!c.length) c = pool(false, false); if (!c.length) c = pool(false, true)
    const best = Math.min(...c.map((q) => Math.abs(q.lvl - want)))
    const near = c.filter((q) => Math.abs(q.lvl - want) === best), q = near[Math.floor(rng() * near.length)]
    used.add(q)
    const opts = shuffle([{ t: q.ok, ok: true, src: -1 }, ...shuffle(q.bad.map((t, i) => ({ t, ok: false, src: i })), rng).slice(0, f.n - 1)], rng) // la correcta cambia de lugar
    f.q = { src: q, q: q.q, opts: opts.map((o) => o.t), correct: opts.findIndex((o) => o.ok), optSrc: opts.map((o) => o.src), ok: q.ok, fact: q.fact, img: q.img, lvl: q.lvl }
  }

  if (fixed) forks.forEach(pick) // las mismas 12 preguntas para todos los que usen la misma semilla
  g.resume = () => { g.paused = false }
  g.drain = () => g.events.splice(0)
  g.question = () => { const f = forks[g.idx]; return f && f.q && f.asked && g.s < f.start + len - 10 ? f : null }
  g.forkDistance = () => { const f = forks[g.idx]; return f ? f.start - g.s : null }
  g.reveal = (id) => { const f = forks[id]; if (f) f.revealed = true }
  g.jump = (i) => {
    const f = forks[g.idx]
    if (!f || !f.q || !f.revealed || f.jumped || g.finished || g.detour || i < 0 || i >= f.n || g.s > f.start + len - 34) return false
    f.jumped = true; g.jumpT = 0.5; g.jumpLane = i
    if (g.s >= f.start + 2) g.lock = i
    emit({ type: 'jump', lane: i })
    return true
  }

  // ── Poderes ──
  g.addPower = (key) => {
    if (POWER_KEYS.includes(key)) { g.powers.push(key); if (g.powers.length > MAX_POWERS) g.powers.shift() }
    g.choosing = null; g.paused = false
  }
  g.usePower = (i) => {
    const key = g.powers[i], f = forks[g.idx]
    if (!key || g.finished || g.detour) return false
    if (key === 'nitro') { g.boost = Math.max(g.boost, 3); g.v *= 1.08 }
    else if (key === 'hint') { if (!f || !f.q || !f.revealed) return false; g.hintFor = f.id }
    else if (key === 'jump') { if (!f || !f.jumped || g.s > f.start + len - 34) return false; f.jumped = false }
    else return false // el escudo es pasivo
    g.powers.splice(i, 1); emit({ type: 'power', key }); return true
  }

  // ── Ruta de repaso ──
  g.startDetour = (q) => {
    if (g.detour || g.finished || !q) return false
    const deep = q.src.deep || []
    g.detour = { id: ++g.detours, q, stations: ['answer', ...deep.map((_, i) => `deep${i}`), 'others', 'fact'], si: 0, rs: 0, ru: 0, uv: 0, v: 0, holding: false, announced: [], revealed: [] }
    emit({ type: 'detour', id: g.detour.id, stations: g.detour.stations }); return true
  }
  g.revealStation = (i) => { if (g.detour) g.detour.revealed[i] = true }
  g.endDetour = () => { if (!g.detour) return; g.detour = null; emit({ type: 'detourEnd' }) }
  // La ruta NO se detiene en las estaciones: el vehículo avanza solo hasta el límite de 255 km/h (`ROUTE.vmax`; se puede frenar y girar) mientras el locutor
  // cuenta cada estación al irte acercando. Solo espera al final del recorrido si la última aún no terminó de contarse.
  function stepDetour(dt, input) {
    const d = g.detour, n = d.stations.length, brake = input.brake || 0, steer = input.steer || 0, end = routeLength(n)
    if (d.si < n && !d.announced[d.si] && d.rs >= stationPos(d.si) - ROUTE.announce) { d.announced[d.si] = true; emit({ type: 'station', index: d.si }) }
    d.holding = d.rs >= end - 10 && !d.revealed[n - 1]
    const a = (ROUTE.vmax - d.v) * 0.9 - 40 * brake
    d.v = Math.max(0, d.v + a * dt)
    if (!d.revealed[n - 1]) d.v = Math.min(d.v, Math.sqrt(2 * 30 * Math.max(0, end - d.rs))) // frena suave para esperar en la meta a que termine la última estación
    d.rs += d.v * dt
    d.uv += (steer * 11 - d.uv) * (1 - Math.exp(-9 * dt)); d.ru = Math.max(-6, Math.min(6, d.ru + d.uv * dt))
    if (d.si < n && d.rs > stationPos(d.si) + 14) d.si++
    if (d.rs >= end && d.revealed[n - 1]) g.endDetour()
  }

  // ── Rivales de IA: corren la misma pista; aciertan cada bifurcación con probabilidad `skill` y suben o bajan de vehículo como tú ──
  function stepBot(r, dt) {
    if (r.finished) { r.v *= Math.exp(-1.6 * dt); r.s += r.v * dt; return }
    r.crash = Math.max(0, r.crash - dt); r.boost = Math.max(0, r.boost - dt)
    const vMax = tierSpeed(r.tier) * (r.boost > 0 ? 1.42 : 1) * (r.crash > 0 ? 0.4 : 1) * 0.97
    r.v += (vMax - r.v) * Math.min(1, 1.1 * dt); r.s += r.v * dt
    r.alt += (flyAlt(r.tier) - r.alt) * (1 - Math.exp(-2.2 * dt))
    const f = forks[r.idx]; let target = 0
    if (f) {
      if (r.ok === null && r.s >= f.start - 60) r.ok = botRng() < r.skill
      if (r.ok !== null) {
        const c = f.q ? f.q.correct : 0, lane = r.ok ? c : (c + 1) % f.n
        if (r.s >= f.start - 30) target = laneBounds(f.n, lane).center
        if (!r.evald && r.s > f.start + len - 28) {
          r.evald = true
          if (r.ok) { r.boost = 2.6; r.v *= 1.2; r.tier = Math.min(MAX_TIER, r.tier + 1) } else { r.crash = 1.8; r.v *= 0.4; r.tier = Math.max(0, r.tier - 1) }
        }
        if (r.s > f.start + len + 5) { r.idx++; r.ok = null; r.evald = false }
      }
    } else target = Math.sin(r.s * 0.01 + r.v) * 3
    r.uv = (target - r.u) * 2.2; r.u += r.uv * dt
    if (r.s >= L - 40) { r.finished = true; r.finishT = g.time }
  }
  // Puesto: los que ya terminaron antes que tú o, mientras corres, los que van más adelante
  g.rank = () => 1 + g.rivals.filter((r) => (r.finished && (g.finishTime == null || r.finishT < g.finishTime)) || (!r.finished && g.finishTime == null && r.s > g.s)).length
  g.board = () => [{ id: 'me', me: true, s: g.s, finished: g.finished, t: g.finishTime }, ...g.rivals.map((r) => ({ id: r.id, name: r.name, color: r.color, s: r.s, finished: r.finished, t: r.finishT }))]
    .sort((a, b) => (a.finished && b.finished ? a.t - b.t : a.finished ? -1 : b.finished ? 1 : b.s - a.s))

  // input: { steer: -1..1, throttle: 0..1, brake: 0..1, drift: bool }
  g.step = (dt, input = {}) => {
    g.msgT = Math.max(0, g.msgT - dt); if (!g.msgT) g.msg = null
    if (g.startIn > 0) { g.startIn = Math.max(0, g.startIn - dt); return } // cuenta atrás: nadie arranca todavía
    if (g.detour) { stepDetour(dt, input); return }
    if (g.paused) return
    for (const r of g.rivals) if (r.bot) stepBot(r, dt)
    if (g.finished) { g.finishT += dt; g.v *= Math.exp(-1.6 * dt); g.s += g.v * dt; return }
    const steer = input.steer || 0, throttle = g.auto ? 1 : input.throttle || 0, brake = input.brake || 0
    g.time += dt; g.crash = Math.max(0, g.crash - dt); g.boost = Math.max(0, g.boost - dt)
    g.alt += (flyAlt(g.tier) + (g.tier >= 10 ? Math.sin(g.time * 2) * 0.25 : 0) - g.alt) * (1 - Math.exp(-2.2 * dt)) // los niveles 10+ vuelan

    let m = 0; while (m + 1 < missionStarts.length && g.s >= missionStarts[m + 1]) m++
    if (m !== g.mission) {
      g.mission = m; emit({ type: 'mission', index: m })
      if (free) return
      if (g.rivals.length) { g.addPower(shuffle(POWER_KEYS, rng)[0]); return } // con rivales no se pausa: te toca un poder al azar
      g.choosing = shuffle(POWER_KEYS, rng).slice(0, 3); g.paused = true; emit({ type: 'powerChoice', options: g.choosing }) // 1 poder por misión nueva
      return
    }

    const sf = forks[g.storyIdx] // episodio de la historia de la misión: 160 m después de resolver cada bifurcación
    if (sf && g.s >= sf.start + len + 160) { emit({ type: 'story', mission: sf.mission, beat: sf.id % RACE.forksPerMission }); g.storyIdx++ }

    const f = forks[g.idx]
    const askD = RACE.askDist + g.v * 5 // a más velocidad, más metros de aviso (≈ 5 s extra)
    if (f && !f.q && g.s >= f.start - Math.max(RACE.armDist, askD + 100)) pick(f)
    if (f && f.q && !f.asked && g.s >= f.start - askD) { f.asked = true; if (g.rivals.length) f.revealed = true; emit({ type: 'ask', fork: f }) } // con rivales NO se espera: la pregunta se lee mientras corres
    g.holding = !!(f && f.asked && !f.revealed && g.s >= f.start - RACE.holdDist) // espera en el pórtico a que termine de leerse la pregunta

    const vMax = tierSpeed(g.tier) * (g.boost > 0 ? 1.42 : 1) * (g.crash > 0 ? 0.4 : 1)
    let a = throttle * (21 + vMax * 0.3) * Math.max(0, 1 - g.v / vMax) - 0.03 * g.v - slopeAt(g.s) * 9.8 * 0.7 // pendiente: bajar (slope < 0) acelera, subir frena
    if (g.v > vMax) a -= (g.v - vMax) * 1.5 // pasarse del máximo (turbo, bajada) se va disipando
    if (brake > 0) a -= (26 + vMax * 0.4) * brake
    if (g.holding) a -= 40
    if (g.crash > 0) a -= 8
    g.v = Math.max(0, g.v + a * dt)
    if (f && f.asked && !f.revealed && g.s < f.start) g.v = Math.min(g.v, Math.sqrt(2 * 110 * Math.max(0, f.start - 6 - g.s))) // sin leer aún: frena a tiempo para esperar en el pórtico, sin pasarte

    g.drifting = !!input.drift && Math.abs(steer) > 0.2 && g.v > 14 && g.crash <= 0
    if (g.drifting) g.driftT += dt
    else { if (g.driftT > 0.7) { g.boost = Math.max(g.boost, Math.min(2.2, g.driftT * 0.55)); emit({ type: 'driftboost', t: g.driftT }) } g.driftT = 0 }
    if (g.drifting) g.v = Math.max(0, g.v - 1.6 * dt)

    if (g.jumpT > 0 && f) {
      g.jumpT -= dt; g.uv = 0
      g.u += (laneBounds(f.n, g.jumpLane).center - g.u) * (1 - Math.exp(-14 * dt))
    } else {
      const target = steer * 13 * (g.drifting ? 1.75 : 1) * Math.min(1.25, Math.max(0.55, g.v / 22))
      g.uv += (target - g.uv) * (1 - Math.exp(-(g.drifting ? 12 : 9) * dt)); g.u += g.uv * dt
    }
    const s0 = g.s
    g.s += g.v * dt
    while (g.pk < g.pickups.length && g.pickups[g.pk].s < g.s + 1.5) { // barre lo que cruzaste este cuadro
      const p = g.pickups[g.pk++]
      if (p.taken || p.s < s0 - 1.5 || Math.abs(p.u - g.u) > (p.kind === 'pad' ? 3.2 : 2.7) || g.alt > 4) continue // las naves en vuelo alto pasan por encima
      p.taken = true; g.fxBox++; g.boxAt = { s: p.s, u: p.u, kind: p.kind }
      if (p.kind === 'pad') { g.boost = Math.max(g.boost, 1.6); g.v *= 1.1; say('box', 'pad'); emit({ type: 'pickup', kind: 'pad' }) }
      else {
        let r = p.reward
        if (r === 'power' && g.powers.length >= MAX_POWERS) r = 'boost'
        if (r === 'shield' && g.powers.includes('shield')) r = 'coins'
        if (r === 'boost') { g.boost = Math.max(g.boost, 2.2); g.v *= 1.12 }
        else if (r === 'power') { g.powers.push(POWER_KEYS[Math.floor(pkRng() * POWER_KEYS.length)]) }
        else if (r === 'shield') g.powers.push('shield')
        else g.score += 60 * (g.tier + 1)
        say('box', r); emit({ type: 'pickup', kind: 'box', reward: r })
      }
    }

    let lo = -RACE.roadHalf + 0.7, hi = RACE.roadHalf - 0.7
    if (f) {
      const a0 = f.start, b = a0 + len
      if (g.s >= a0 + 2 && g.s <= b) {
        if (g.lock < 0) g.lock = laneOf(f.n, g.u)
        if (!(g.jumpT > 0)) { const lb = laneBounds(f.n, g.lock); lo = lb.lo; hi = lb.hi } else { lo = -RACE.roadHalf; hi = RACE.roadHalf }
      }
      if (g.s > b - 28 && !g.evald && f.q) {
        g.evald = true
        const ok = g.lock === f.q.correct, from = g.tier
        let shielded = false
        if (ok) {
          g.correct++; g.score += 100 * (g.tier + 1); g.boost = 2.6; g.v *= 1.2; g.fxOk++
          if (g.tier < MAX_TIER) { g.tier++; g.maxTier = Math.max(g.maxTier, g.tier); say('up', g.tier) } else say('ok')
        } else if (g.powers.includes('shield')) { // el escudo absorbe la trampa: sin choque ni pérdida de nivel
          g.powers.splice(g.powers.indexOf('shield'), 1); shielded = true; g.wrong++; say('shield')
        } else {
          g.wrong++; g.crash = 1.8; g.v *= 0.4
          if (g.tier > 0) { g.tier--; say('bad', g.tier) } else say('bad')
        }
        g.results[f.id] = ok
        emit({ type: 'answer', ok, shielded, q: f.q, chosen: g.lock, fromTier: from, tier: g.tier })
      }
      if (g.s > b + 5) { g.idx++; g.lock = -1; g.evald = false; g.hintFor = -1 }
    }
    if (g.u < lo) { g.u = lo; if (g.uv < 0) g.uv = 0 }
    if (g.u > hi) { g.u = hi; if (g.uv > 0) g.uv = 0 }
    if (g.s >= L - 40) { g.finished = true; g.finishTime = g.time; say('finish'); emit({ type: 'finish' }) }
  }
  return g
}
