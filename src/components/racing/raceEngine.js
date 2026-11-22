import { RACE, FORKS, ROUTE, MAX_TIER, trackLength, tierSpeed, lvlOfTier, flyAlt, forkLanes, laneBounds, laneOf, shuffle, POWER_KEYS, MAX_POWERS, routeLength, stationPos } from './racingData.js'
import { slopeAt } from './trackMath.js'

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
export function createRace(world, { rng = Math.random, auto = false, startTier = 0 } = {}) {
  const L = trackLength(), len = RACE.forkLen
  const forks = Array.from({ length: FORKS }, (_, i) => ({ id: i, start: RACE.firstFork + i * RACE.spacing, n: forkLanes(i), mission: Math.floor(i / RACE.forksPerMission), q: null, asked: false, revealed: false, jumped: false }))
  const missionStarts = Array.from({ length: RACE.missions }, (_, m) => (m === 0 ? 0 : forks[m * RACE.forksPerMission - 1].start + len + 30))
  const used = new Set()
  const t0 = Math.max(0, Math.min(MAX_TIER, startTier))
  const g = {
    L, forks, missionStarts, world, auto, paused: false, startTier: t0,
    s: 0, u: 0, uv: 0, v: 0, alt: flyAlt(t0), tier: t0, maxTier: t0, correct: 0, wrong: 0, score: 0, time: 0,
    lock: -1, idx: 0, evald: false, crash: 0, boost: 0, jumpT: 0, jumpLane: 0, drifting: false, driftT: 0, holding: false,
    msg: null, msgT: 0, finished: false, finishT: 0, mission: 0, events: [], results: [],
    powers: [], hintFor: -1, detour: null, detours: 0, choosing: null,
  }
  const say = (kind, tier = null) => { g.msg = { kind, tier }; g.msgT = 3.2 } // la interfaz lo traduce
  const emit = (e) => g.events.push(e)
  emit({ type: 'mission', index: 0 })

  // Elige la pregunta de la bifurcación `f`: del tema de la misión, sin repetir, con n−1 trampas y la dificultad más cercana al nivel actual
  function pick(f) {
    const topics = world.missions[f.mission].topics, want = lvlOfTier(g.tier)
    const pool = (strict, reuse) => world.questions.filter((q) => (reuse || !used.has(q)) && q.bad.length >= f.n - 1 && (!strict || topics.includes(q.t)))
    let c = pool(true, false); if (!c.length) c = pool(false, false); if (!c.length) c = pool(false, true)
    const best = Math.min(...c.map((q) => Math.abs(q.lvl - want)))
    const near = c.filter((q) => Math.abs(q.lvl - want) === best), q = near[Math.floor(rng() * near.length)]
    used.add(q)
    const opts = shuffle([{ t: q.ok, ok: true, src: -1 }, ...shuffle(q.bad.map((t, i) => ({ t, ok: false, src: i })), rng).slice(0, f.n - 1)], rng) // la correcta cambia de lugar
    f.q = { src: q, q: q.q, opts: opts.map((o) => o.t), correct: opts.findIndex((o) => o.ok), optSrc: opts.map((o) => o.src), ok: q.ok, fact: q.fact, img: q.img, lvl: q.lvl }
  }

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
  function stepDetour(dt, input) {
    const d = g.detour, n = d.stations.length, throttle = g.auto ? 1 : input.throttle || 0, brake = input.brake || 0, steer = input.steer || 0
    d.holding = d.si < n && d.rs >= stationPos(d.si) - ROUTE.stop && !d.revealed[d.si]
    if (d.si < n && !d.announced[d.si] && d.rs >= stationPos(d.si) - 100) { d.announced[d.si] = true; emit({ type: 'station', index: d.si }) }
    let a = throttle * 15 * Math.max(0, 1 - d.v / 30) - 0.05 * d.v - 26 * brake
    if (d.holding) a -= 40
    d.v = Math.max(0, d.v + a * dt); d.rs += d.v * dt
    d.uv += (steer * 11 - d.uv) * (1 - Math.exp(-9 * dt)); d.ru = Math.max(-6, Math.min(6, d.ru + d.uv * dt))
    if (d.si < n && d.rs > stationPos(d.si) + 14) d.si++
    if (d.rs >= routeLength(n)) g.endDetour()
  }

  // input: { steer: -1..1, throttle: 0..1, brake: 0..1, drift: bool }
  g.step = (dt, input = {}) => {
    g.msgT = Math.max(0, g.msgT - dt); if (!g.msgT) g.msg = null
    if (g.detour) { stepDetour(dt, input); return }
    if (g.paused) return
    if (g.finished) { g.finishT += dt; g.v *= Math.exp(-1.6 * dt); g.s += g.v * dt; return }
    const steer = input.steer || 0, throttle = g.auto ? 1 : input.throttle || 0, brake = input.brake || 0
    g.time += dt; g.crash = Math.max(0, g.crash - dt); g.boost = Math.max(0, g.boost - dt)
    g.alt += (flyAlt(g.tier) + (g.tier >= 10 ? Math.sin(g.time * 2) * 0.25 : 0) - g.alt) * (1 - Math.exp(-2.2 * dt)) // los niveles 10+ vuelan

    let m = 0; while (m + 1 < missionStarts.length && g.s >= missionStarts[m + 1]) m++
    if (m !== g.mission) {
      g.mission = m; emit({ type: 'mission', index: m })
      g.choosing = shuffle(POWER_KEYS, rng).slice(0, 3); g.paused = true; emit({ type: 'powerChoice', options: g.choosing }) // 1 poder por misión nueva
      return
    }

    const f = forks[g.idx]
    if (f && !f.q && g.s >= f.start - RACE.armDist) pick(f)
    if (f && f.q && !f.asked && g.s >= f.start - RACE.askDist) { f.asked = true; emit({ type: 'ask', fork: f }) }
    g.holding = !!(f && f.asked && !f.revealed && g.s >= f.start - RACE.holdDist) // espera en el pórtico a que termine de leerse la pregunta

    const vMax = tierSpeed(g.tier) * (g.boost > 0 ? 1.3 : 1) * (g.crash > 0 ? 0.4 : 1)
    let a = throttle * 15 * Math.max(0, 1 - g.v / vMax) - 0.03 * g.v - slopeAt(g.s) * 9.8 * 0.7 // pendiente: bajar (slope < 0) acelera, subir frena
    if (g.v > vMax) a -= (g.v - vMax) * 1.5 // pasarse del máximo (turbo, bajada) se va disipando
    if (brake > 0) a -= 26 * brake
    if (g.holding) a -= 40
    if (g.crash > 0) a -= 8
    g.v = Math.max(0, g.v + a * dt)

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
    g.s += g.v * dt

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
          g.correct++; g.score += 100 * (g.tier + 1); g.boost = 1.4; g.v *= 1.1
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
    if (g.s >= L - 40) { g.finished = true; say('finish'); emit({ type: 'finish' }) }
  }
  return g
}
