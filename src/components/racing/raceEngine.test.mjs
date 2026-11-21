// Prueba mínima del motor: node src/components/racing/raceEngine.test.mjs
import assert from 'node:assert/strict'
import { createRace } from './raceEngine.js'
import { CLASSES, RACE, buildForks } from './racingData.js'

const cls = CLASSES.medicina
const forks = buildForks(cls)
assert.equal(forks.length, RACE.forks)

// Corre una carrera eligiendo siempre el carril `pick(fork)` (-1 izquierda, +1 derecha)
function run(pick) {
  const g = createRace(cls, forks)
  for (let i = 0; i < 60 * 600 && !g.finished; i++) {
    const f = forks[g.idx]
    // se acerca al carril elegido unos metros antes de la zona dividida
    const want = f && g.s > f.start - 60 ? pick(f) * 5 : 0
    g.step(1 / 60, Math.sign(want - g.u) * (Math.abs(want - g.u) > 0.5 ? 1 : 0))
  }
  return g
}

const best = run((f) => (f.side === 'L' ? -1 : 1))
assert.ok(best.finished, 'termina la carrera')
assert.equal(best.correct, RACE.forks, 'acierta todas')
assert.equal(best.tier, 4, 'vehículo al máximo')

const worst = run((f) => (f.side === 'L' ? 1 : -1))
assert.ok(worst.finished)
assert.equal(worst.correct, 0, 'fallar todas = 0 aciertos')
assert.equal(worst.wrong, RACE.forks)
assert.ok(best.time < worst.time, 'acertar es más rápido que fallar')
console.log(`ok · perfecta ${best.time.toFixed(1)} s · todo mal ${worst.time.toFixed(1)} s`)
