// Prueba mínima del motor: node src/components/racing/raceEngine.test.mjs
import assert from 'node:assert/strict'
import { createRace } from './raceEngine.js'
import { WORLDS, FORKS, MAX_TIER, laneBounds, routeLength } from './racingData.js'

const seeded = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296)

// Corre una carrera con un "jugador" que acelera siempre, "lee" cada pregunta al instante (reveal) y va al carril `pick(fork)`
function run(world, pick, { rng = seeded(7), maxMin = 30 } = {}) {
  const g = createRace(world, { rng }), log = []
  for (let i = 0; i < 60 * 60 * maxMin && !g.finished; i++) {
    const f = g.forks[g.idx]
    if (f && f.asked) g.reveal(f.id)
    if (g.choosing) g.addPower(g.choosing[0])
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
  assert.equal(best.g.tier, FORKS, `${world.id}: sube un nivel por acierto (de 0 a ${FORKS})`)
  assert.ok(best.g.forks.some((f) => f.n === 3 && f.q.opts.length === 3), `${world.id}: hay forks de 3 opciones`)
  assert.equal(best.log.filter((e) => e.type === 'answer').length, FORKS)
  assert.equal(best.log.filter((e) => e.type === 'mission').length, 3, `${world.id}: 3 misiones`)
  const worst = run(world, (f) => (f.q.correct + 1) % f.n)
  assert.ok(worst.g.finished); assert.equal(worst.g.correct, 0); assert.equal(worst.g.tier, 0, 'fallar mantiene el nivel en 0')
  assert.equal(best.g.alt > 5, true, `${world.id}: el vehículo final vuela`)
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
    if (g.choosing) g.addPower(g.choosing[0])
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

// 14 vehículos: empezar en un nivel alto da vehículo y preguntas más difíciles
{
  const g = createRace(WORLDS.medicina, { rng: seeded(2), startTier: 9 })
  assert.equal(g.tier, 9); assert.equal(g.startTier, 9)
  assert.equal(createRace(WORLDS.medicina, { startTier: 99 }).tier, MAX_TIER, 'tope en el último vehículo')
  assert.equal(WORLDS.medicina.tiers.length, 14); assert.equal(WORLDS.medicina.tiers[13].kind, 'spaceship'); assert.equal(WORLDS.medicina.tiers[12].kind, 'plane')
}

// Poderes: el escudo absorbe una trampa (sin bajar de nivel), el nitro da turbo, la pista solo con la pregunta revelada
{
  const g = createRace(WORLDS.medicina, { rng: seeded(21), startTier: 4 })
  g.addPower('shield'); g.addPower('nitro'); g.addPower('hint')
  assert.equal(g.powers.length, 3)
  assert.equal(g.usePower(2), false, 'la pista no se puede usar antes de que haya pregunta revelada')
  assert.equal(g.usePower(1), true); assert.ok(g.boost >= 3, 'el nitro da turbo')
  g.addPower('jump'); g.addPower('hint'); assert.equal(g.powers.length, 3, 'máximo 3 poderes (sale el más viejo)'); g.addPower('shield')
  let ans = null
  for (let i = 0; i < 60 * 900 && !ans; i++) {
    const f = g.forks[g.idx]; if (f && f.asked) g.reveal(f.id)
    if (g.choosing) g.addPower('shield')
    const want = f && f.q && g.s > f.start - 70 ? laneBounds(f.n, (f.q.correct + 1) % f.n).center : 0 // va al carril equivocado
    g.step(1 / 60, { throttle: 1, steer: Math.abs(want - g.u) > 0.4 ? Math.sign(want - g.u) : 0 })
    ans = g.drain().find((e) => e.type === 'answer')
  }
  assert.ok(ans && !ans.ok && ans.shielded, 'el escudo absorbe la trampa'); assert.equal(ans.tier, 4, 'sin bajar de nivel'); assert.equal(g.crash, 0)
}

// Ruta de repaso: espera en cada estación hasta que se lea, y al terminar vuelve a la carrera donde estaba
{
  const g = createRace(WORLDS.medicina, { rng: seeded(8) })
  for (let i = 0; i < 60 * 40; i++) { g.step(1 / 60, { throttle: 1 }); if (g.choosing) g.addPower('nitro'); const f = g.forks[0]; if (f.q && f.asked) { g.reveal(0); break } }
  const q = g.forks[0].q, s0 = g.s, u0 = g.u
  assert.ok(g.startDetour(q), 'abre la ruta'); assert.equal(g.startDetour(q), false, 'no se abre otra encima')
  const stations = g.detour.stations; assert.equal(stations.length, 5, 'respuesta + 2 párrafos + otras opciones + dato')
  let last = -1, ends = false
  for (let i = 0; i < 60 * 900 && g.detour; i++) {
    g.step(1 / 60, { throttle: 1 })
    for (const e of g.drain()) { if (e.type === 'station') last = e.index; if (e.type === 'detourEnd') ends = true }
    if (g.detour && g.detour.holding) { assert.ok(g.detour.v < 1 || g.detour.rs < 1e9); g.revealStation(g.detour.si) }
  }
  assert.ok(ends && !g.detour, 'termina la ruta'); assert.equal(last, stations.length - 1, 'pasó por todas las estaciones')
  assert.equal(g.s, s0, 'la carrera quedó donde estaba'); assert.equal(g.u, u0)
  // sin revelar, el vehículo se queda esperando en la estación
  g.startDetour(q)
  for (let i = 0; i < 60 * 120; i++) g.step(1 / 60, { throttle: 1 })
  assert.ok(g.detour && g.detour.holding && g.detour.rs < routeLength(stations.length), 'espera la lectura en la estación')
}
console.log('ok · 14 vehículos, poderes y ruta de repaso')
