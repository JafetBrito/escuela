import { RACE, FORKS, trackLength, tierSpeed, forkLanes, laneBounds, laneOf, shuffle } from './racingData.js'
import { slopeAt } from './trackMath.js'

// Motor de la carrera, SIN React ni three: avanza el estado (distancia s, lado u, velocidad, nivel del vehículo, puntos) y resuelve
// las bifurcaciones. La escena, el HUD, la voz y la música solo lo leen (y consumen `drain()`, la cola de eventos). Se prueba solo con
// `node` (raceEngine.test.mjs).
//
// CONTROL: el jugador acelera (`throttle`), frena (`brake`), gira (`steer`) y derrapa (`drift`). Si no acelera, el vehículo se va
// deteniendo (en modo `auto` acelera solo, útil en el celular). La pendiente cuenta: cuesta abajo gana velocidad y cuesta arriba la pierde.
// Derrapar (gira + derrapa a más de 14 m/s) da más agarre lateral y, al soltar, un mini-turbo según lo que duró.
//
// PREGUNTAS: FORKS bifurcaciones con 2 o 3 carriles, repartidas en 3 misiones. La pregunta se ELIGE de lejos (su dificultad sigue al nivel
// del vehículo) y se ANUNCIA a 460 m; el vehículo se detiene en el pórtico hasta que la interfaz avise (`reveal`) que ya se leyó
// completa, y entonces aparecen las opciones. Al entrar a la zona dividida el carril queda fijado. 28 m antes de que se junten se
// evalúa: correcto = turbo + sube un nivel; trampa = choque y baja un nivel. Una vez por pregunta se puede "saltar" al carril de una opción.
export function createRace(world, { rng = Math.random, auto = false } = {}) {
  const L = trackLength(), len = RACE.forkLen
  const forks = Array.from({ length: FORKS }, (_, i) => ({ id: i, start: RACE.firstFork + i * RACE.spacing, n: forkLanes(i), mission: Math.floor(i / RACE.forksPerMission), q: null, asked: false, revealed: false, jumped: false }))
  const missionStarts = Array.from({ length: RACE.missions }, (_, m) => (m === 0 ? 0 : forks[m * RACE.forksPerMission - 1].start + len + 30))
  const used = new Set()
  const g = {
    L, forks, missionStarts, world, auto, paused: false, free: false,
    s: 0, u: 0, uv: 0, v: 0, tier: 0, correct: 0, wrong: 0, score: 0, time: 0,
    lock: -1, idx: 0, evald: false, crash: 0, boost: 0, jumpT: 0, jumpLane: 0, drifting: false, driftT: 0, holding: false,
    msg: null, msgT: 0, finished: false, finishT: 0, mission: 0, events: [], results: [],
  }
  const say = (kind, tier = null) => { g.msg = { kind, tier }; g.msgT = 3.2 } // la interfaz lo traduce
  const emit = (e) => g.events.push(e)
  emit({ type: 'mission', index: 0 })

  // Elige la pregunta de la bifurcación `f`: del tema de la misión, sin repetir, con n−1 trampas y la dificultad más cercana al nivel actual
  function pick(f) {
    const topics = world.missions[f.mission].topics
    const pool = (strict, reuse) => world.questions.filter((q) => (reuse || !used.has(q)) && q.bad.length >= f.n - 1 && (!strict || topics.includes(q.t)))
    let c = pool(true, false); if (!c.length) c = pool(false, false); if (!c.length) c = pool(false, true)
    const best = Math.min(...c.map((q) => Math.abs(q.lvl - g.tier)))
    const near = c.filter((q) => Math.abs(q.lvl - g.tier) === best), q = near[Math.floor(rng() * near.length)]
    used.add(q)
    const opts = shuffle([{ t: q.ok, ok: true, src: -1 }, ...shuffle(q.bad.map((t, i) => ({ t, ok: false, src: i })), rng).slice(0, f.n - 1)], rng) // la correcta cambia de lugar
    f.q = { src: q, q: q.q, opts: opts.map((o) => o.t), correct: opts.findIndex((o) => o.ok), optSrc: opts.map((o) => o.src), ok: q.ok, fact: q.fact, img: q.img, lvl: q.lvl }
  }

  g.drain = () => g.events.splice(0)
  // Pregunta anunciada y aún sin resolver (con `revealed` = ya se puede ver y elegir entre las opciones)
  g.question = () => { const f = forks[g.idx]; return f && f.q && f.asked && g.s < f.start + len - 10 ? f : null }
  g.forkDistance = () => { const f = forks[g.idx]; return f ? f.start - g.s : null }
  g.reveal = (id) => { const f = forks[id]; if (f) f.revealed = true }
  // Salto: al carril `i` de la pregunta actual, UNA vez por pregunta, ya revelada y mientras aún no se evalúa
  g.jump = (i) => {
    const f = forks[g.idx]
    if (!f || !f.q || !f.revealed || f.jumped || g.finished || i < 0 || i >= f.n || g.s > f.start + len - 34) return false
    f.jumped = true; g.jumpT = 0.5; g.jumpLane = i
    if (g.s >= f.start + 2) g.lock = i
    emit({ type: 'jump', lane: i })
    return true
  }

  // input: { steer: -1..1, throttle: 0..1, brake: 0..1, drift: bool }
  g.step = (dt, input = {}) => {
    g.msgT = Math.max(0, g.msgT - dt); if (!g.msgT) g.msg = null
    if (g.paused) return
    if (g.finished) { g.finishT += dt; g.v *= Math.exp(-1.6 * dt); g.s += g.v * dt; return }
    const steer = input.steer || 0, throttle = g.auto ? 1 : input.throttle || 0, brake = input.brake || 0
    g.time += dt; g.crash = Math.max(0, g.crash - dt); g.boost = Math.max(0, g.boost - dt)

    let m = 0; while (m + 1 < missionStarts.length && g.s >= missionStarts[m + 1]) m++
    if (m !== g.mission) { g.mission = m; emit({ type: 'mission', index: m }) }

    const f = forks[g.idx]
    if (f && !f.q && g.s >= f.start - RACE.armDist) pick(f)
    if (f && f.q && !f.asked && g.s >= f.start - RACE.askDist) { f.asked = true; emit({ type: 'ask', fork: f }) }
    g.holding = !!(f && f.asked && !f.revealed && g.s >= f.start - RACE.holdDist) // espera en el pórtico a que termine de leerse la pregunta

    // velocidad: acelera hacia el máximo del nivel, la pendiente suma o resta, el roce frena
    const vMax = tierSpeed(g.tier) * (g.boost > 0 ? 1.3 : 1) * (g.crash > 0 ? 0.4 : 1)
    let a = throttle * 15 * Math.max(0, 1 - g.v / vMax) - 0.03 * g.v - slopeAt(g.s) * 9.8 * 0.7 // pendiente: bajar (slope < 0) acelera, subir frena
    if (g.v > vMax) a -= (g.v - vMax) * 1.5 // pasarse del máximo (turbo, bajada) se va disipando
    if (brake > 0) a -= 26 * brake
    if (g.holding) a -= 40
    if (g.crash > 0) a -= 8
    g.v = Math.max(0, g.v + a * dt)

    // derrape: gira + derrapa a más de 14 m/s → más agarre lateral y, al soltar, mini-turbo
    g.drifting = !!input.drift && Math.abs(steer) > 0.2 && g.v > 14 && g.crash <= 0
    if (g.drifting) g.driftT += dt
    else { if (g.driftT > 0.7) { g.boost = Math.max(g.boost, Math.min(2.2, g.driftT * 0.55)); emit({ type: 'driftboost', t: g.driftT }) } g.driftT = 0 }
    if (g.drifting) g.v = Math.max(0, g.v - 1.6 * dt)

    if (g.jumpT > 0 && f) { // salto: el vehículo se desliza rápido al centro del carril elegido
      g.jumpT -= dt; g.uv = 0
      g.u += (laneBounds(f.n, g.jumpLane).center - g.u) * (1 - Math.exp(-14 * dt))
    } else {
      const grip = g.drifting ? 1.75 : 1
      const target = steer * 13 * grip * Math.min(1.25, Math.max(0.55, g.v / 22))
      g.uv += (target - g.uv) * (1 - Math.exp(-(g.drifting ? 12 : 9) * dt)); g.u += g.uv * dt
    }
    g.s += g.v * dt

    let lo = -RACE.roadHalf + 0.7, hi = RACE.roadHalf - 0.7
    if (f) {
      const a0 = f.start, b = a0 + len
      if (g.s >= a0 + 2 && g.s <= b) { // zona dividida: carril fijo
        if (g.lock < 0) g.lock = laneOf(f.n, g.u)
        if (!(g.jumpT > 0)) { const lb = laneBounds(f.n, g.lock); lo = lb.lo; hi = lb.hi } else { lo = -RACE.roadHalf; hi = RACE.roadHalf }
      }
      if (g.s > b - 28 && !g.evald && f.q) {
        g.evald = true
        const ok = g.lock === f.q.correct, from = g.tier
        if (ok) {
          g.correct++; g.score += 100 * (g.tier + 1); g.boost = 1.4; g.v *= 1.1
          if (g.tier < 4) { g.tier++; say('up', g.tier) } else say('ok')
        } else {
          g.wrong++; g.crash = 1.8; g.v *= 0.4
          if (g.tier > 0) { g.tier--; say('bad', g.tier) } else say('bad')
        }
        g.results[f.id] = ok
        emit({ type: 'answer', ok, q: f.q, chosen: g.lock, fromTier: from, tier: g.tier })
      }
      if (g.s > b + 5) { g.idx++; g.lock = -1; g.evald = false }
    }
    if (g.u < lo) { g.u = lo; if (g.uv < 0) g.uv = 0 }
    if (g.u > hi) { g.u = hi; if (g.uv > 0) g.uv = 0 }
    if (g.s >= L - 40) { g.finished = true; say('finish'); emit({ type: 'finish' }) }
  }
  return g
}
