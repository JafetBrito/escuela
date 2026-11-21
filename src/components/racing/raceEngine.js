import { RACE, trackLength, tierSpeed } from './racingData.js'

// Motor de la carrera, SIN React ni three: avanza el estado (distancia s, lado u, velocidad, nivel del vehículo, aciertos)
// y resuelve las bifurcaciones. La escena y el HUD solo lo leen. Se prueba solo con `node` (ver raceEngine.test.mjs).
//
// Reglas: el vehículo baja la colina solo; el jugador gira a izquierda/derecha. En cada bifurcación la pista se parte
// en dos carriles separados por un muro: al entrar (start + 2 m) queda fijado el carril según el lado en que vas.
// 28 m antes de que se junten otra vez se evalúa: carril correcto = turbo + vehículo mejor; trampa = choque (pierdes
// velocidad). El nivel del vehículo = aciertos (máx. 4) y fija la velocidad máxima.
export function createRace(cls, forks) {
  const L = trackLength(), half = RACE.roadHalf, med = RACE.median
  const g = {
    L, forks, s: 0, u: 0, uv: 0, v: 10, tier: 0, correct: 0, wrong: 0, time: 0,
    lock: 0, idx: 0, evald: false, crash: 0, boost: 0, msg: null, msgT: 0, finished: false, finishT: 0,
  }
  const say = (kind, text) => { g.msg = { kind, text }; g.msgT = 3.2 }

  // Pregunta visible: desde 160 m antes de la bifurcación hasta que se resuelve
  g.question = () => { const f = forks[g.idx]; return f && g.s > f.start - 160 && g.s < f.start + RACE.forkLen - 10 ? f : null }
  g.forkDistance = () => { const f = forks[g.idx]; return f ? f.start - g.s : null }

  g.step = (dt, steer) => {
    g.msgT = Math.max(0, g.msgT - dt); if (!g.msgT) g.msg = null
    if (g.finished) { g.finishT += dt; g.v *= Math.exp(-1.6 * dt); g.s += g.v * dt; return }
    g.time += dt; g.crash = Math.max(0, g.crash - dt); g.boost = Math.max(0, g.boost - dt)

    const vMax = tierSpeed(g.tier) * (g.boost > 0 ? 1.25 : 1) * (g.crash > 0 ? 0.4 : 1)
    g.v += (vMax - g.v) * (1 - Math.exp(-(g.crash > 0 ? 3 : 0.7) * dt))
    const target = steer * 13 * Math.min(1.25, Math.max(0.65, g.v / 22))
    g.uv += (target - g.uv) * (1 - Math.exp(-9 * dt))
    g.u += g.uv * dt; g.s += g.v * dt

    let lo = -half + 0.7, hi = half - 0.7
    const f = forks[g.idx]
    if (f) {
      const a = f.start, b = f.start + RACE.forkLen
      if (g.s >= a + 2 && g.s <= b) { // dentro de la zona dividida: carril fijo
        if (!g.lock) g.lock = g.u < 0 ? -1 : 1
        if (g.lock < 0) hi = -(med + 0.8); else lo = med + 0.8
      }
      if (g.s > b - 28 && !g.evald) {
        g.evald = true
        if (g.lock === (f.side === 'L' ? -1 : 1)) {
          g.correct++; g.boost = 1.4; g.v *= 1.12
          const t = Math.min(4, g.correct)
          if (t > g.tier) { g.tier = t; say('up', `¡Mejora! Ahora: ${cls.tiers[t].name}`) } else say('ok', '¡Correcto! Turbo')
        } else {
          g.wrong++; g.crash = 1.8; g.v *= 0.4
          say('bad', `¡Trampa! La respuesta era: ${f.ok}`)
        }
      }
      if (g.s > b + 5) { g.idx++; g.lock = 0; g.evald = false }
    }
    if (g.u < lo) { g.u = lo; if (g.uv < 0) g.uv = 0 }
    if (g.u > hi) { g.u = hi; if (g.uv > 0) g.uv = 0 }
    if (g.s >= L - 40) { g.finished = true; say('up', '¡Meta!') }
  }
  return g
}
