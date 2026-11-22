// Prueba mínima del motor: node src/components/racing/raceEngine.test.mjs
import assert from 'node:assert/strict'
import { createRace } from './raceEngine.js'
import { WORLDS, FORKS, laneBounds } from './racingData.js'

const seeded = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296)

// Corre una carrera con un "jugador" que acelera siempre, "lee" cada pregunta al instante (reveal) y va al carril `pick(fork)`
function run(world, pick, { rng = seeded(7), maxMin = 30 } = {}) {
  const g = createRace(world, { rng }), log = []
  for (let i = 0; i < 60 * 60 * maxMin && !g.finished; i++) {
    const f = g.forks[g.idx]
    if (f && f.asked) g.reveal(f.id)
    const want = f && f.q && g.s > f.start - 70 ? laneBounds(f.n, pick(f)).center : 0
    g.step(1 / 60, { throttle: 1, steer: Math.abs(want - g.u) > 0.4 ? Math.sign(want - g.u) : 0 })
    for (const e of g.drain()) log.push(e)
  }
  return { g, log }
}

for (const world of Object.values(WORLDS)) {
  const best = run(world, (f) => f.q.correct)
  assert.ok(best.g.finished, `${world.id}: termina`)
  assert.equal(best.g.correct, FORKS, `${world.id}: acierta todas`)
  assert.equal(best.g.tier, 4, `${world.id}: vehículo al máximo`)
  assert.ok(best.g.forks.some((f) => f.n === 3 && f.q.opts.length === 3), `${world.id}: hay forks de 3 opciones`)
  assert.equal(best.log.filter((e) => e.type === 'answer').length, FORKS)
  assert.equal(best.log.filter((e) => e.type === 'mission').length, 3, `${world.id}: 3 misiones`)
  const worst = run(world, (f) => (f.q.correct + 1) % f.n)
  assert.ok(worst.g.finished); assert.equal(worst.g.correct, 0); assert.equal(worst.g.tier, 0, 'fallar mantiene el nivel en 0')
  assert.ok(best.g.time < worst.g.time, 'acertar es más rápido')
  const lvls = best.g.forks.map((f) => f.q.lvl)
  assert.ok(lvls[lvls.length - 1] > lvls[0], `${world.id}: la dificultad sube (${lvls.join(',')})`)
  console.log(`ok ${world.id} · pista ${(best.g.L / 1000).toFixed(1)} km · perfecta ${(best.g.time / 60).toFixed(1)} min · todo mal ${(worst.g.time / 60).toFixed(1)} min`)
}

// Fallar baja un nivel y acertar lo vuelve a subir
{
  const { log } = run(WORLDS.medicina, (f) => (f.id === 3 ? (f.q.correct + 1) % f.n : f.q.correct), { rng: seeded(3) })
  const a = log.filter((e) => e.type === 'answer')
  assert.equal(a[3].ok, false); assert.equal(a[3].fromTier, 3); assert.equal(a[3].tier, 2, 'bajó un nivel')
  assert.equal(a[4].ok, true); assert.equal(a[4].tier, 3)
}

// Salto: una vez por pregunta, solo cuando ya se reveló, y lleva al carril correcto
{
  const g = createRace(WORLDS.programacion, { rng: seeded(11) })
  let jumps = 0
  for (let i = 0; i < 60 * 600 && g.idx === 0; i++) {
    g.step(1 / 60, { throttle: 1 })
    const f = g.forks[0]
    if (f.q && f.asked && jumps === 0) {
      assert.equal(g.jump(f.q.correct), false, 'no se puede saltar antes de leer la pregunta')
      g.reveal(0); assert.ok(g.jump(f.q.correct)); jumps++; assert.equal(g.jump(0), false, 'un solo salto por pregunta')
    }
    g.drain()
  }
  assert.equal(g.correct, 1, 'el salto al carril correcto cuenta como acierto')
}

// Sin acelerar el vehículo se detiene; en el pórtico espera a que se lea la pregunta; el derrape da mini-turbo
{
  const g = createRace(WORLDS.filosofia, { rng: seeded(5) })
  for (let i = 0; i < 60 * 8; i++) g.step(1 / 60, { throttle: 1 })
  assert.ok(g.v > 10, 'acelerando avanza')
  const s0 = g.s
  for (let i = 0; i < 60 * 60; i++) g.step(1 / 60, { throttle: 0, brake: 1 })
  assert.ok(g.v < 0.5 && g.s - s0 < 400, 'sin acelerar se detiene')
  const h = createRace(WORLDS.filosofia, { rng: seeded(5) })
  for (let i = 0; i < 60 * 120 && h.s < h.forks[0].start - 20; i++) h.step(1 / 60, { throttle: 1 })
  for (let i = 0; i < 60 * 20; i++) h.step(1 / 60, { throttle: 1 })
  assert.ok(h.holding && h.v < 0.5 && h.s < h.forks[0].start, 'espera en el pórtico sin revelar')
  h.reveal(0); h.step(1 / 60, { throttle: 1 }); assert.equal(h.holding, false)
  const d = createRace(WORLDS.medicina, { rng: seeded(9) })
  for (let i = 0; i < 60 * 8; i++) d.step(1 / 60, { throttle: 1 })
  for (let i = 0; i < 60 * 1.5; i++) d.step(1 / 60, { throttle: 1, steer: 1, drift: true })
  assert.ok(d.drifting); d.step(1 / 60, { throttle: 1, steer: 0, drift: false }); assert.ok(d.boost > 0, 'soltar el derrape da mini-turbo')
}
console.log('ok · salto, parada, espera en el pórtico y derrape')
