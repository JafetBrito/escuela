// Prueba mínima del motor: node src/components/racing/raceEngine.test.mjs
import assert from 'node:assert/strict'
import { createRace } from './raceEngine.js'
import { WORLDS, FORKS, MAX_TIER, ROUTE, laneBounds, routeLength, levelView, MIN_QUESTIONS } from './racingData.js'
const V = (id) => levelView(WORLDS[id], 0) // el motor trabaja con la vista de un nivel (misiones + preguntas)

const seeded = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296)

// Corre una carrera con un "jugador" que acelera siempre, "lee" cada pregunta al instante (reveal) y va al carril `pick(fork)`
function run(world, pick, { rng = seeded(7), maxMin = 30 } = {}) {
  const g = createRace(world, { rng, bonus: false }), log = []
  for (let i = 0; i < 60 * 60 * maxMin && !g.finished; i++) {
    const f = g.forks[g.idx]
    if (f && f.asked) g.reveal(f.id)
    if (g.choosing) g.addPower(g.choosing[0])
    const want = f && f.q && g.s > f.start - 70 - g.v * 1.5 ? laneBounds(f.n, pick(f)).center : 0
    g.step(1 / 60, { throttle: 1, steer: Math.abs(want - g.u) > 0.4 ? Math.sign(want - g.u) : 0 })
    for (const e of g.drain()) log.push(e)
  }
  return { g, log }
}

for (const world of Object.keys(WORLDS).map(V)) {
  assert.ok(world.questions.length >= MIN_QUESTIONS, `${world.id}: al menos ${MIN_QUESTIONS} preguntas por nivel`)
  assert.ok(world.missions.every((m) => m.story.length === 4), `${world.id}: 4 episodios de historia por misión`)
  const best = run(world, (f) => f.q.correct)
  assert.ok(best.g.finished, `${world.id}: termina`)
  assert.equal(best.g.correct, FORKS, `${world.id}: acierta todas`)
  assert.equal(best.g.tier, FORKS, `${world.id}: sube un nivel por acierto (de 0 a ${FORKS})`)
  assert.ok(best.g.forks.some((f) => f.n === 3 && f.q.opts.length === 3), `${world.id}: hay forks de 3 opciones`)
  assert.equal(best.log.filter((e) => e.type === 'answer').length, FORKS)
  assert.equal(best.log.filter((e) => e.type === 'mission').length, 3, `${world.id}: 3 misiones`)
  assert.equal(best.log.filter((e) => e.type === 'story').length, 12, `${world.id}: un episodio de historia tras cada bifurcación`)
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
  const { log } = run(V('medicina'), (f) => (f.id === 3 ? (f.q.correct + 1) % f.n : f.q.correct), { rng: seeded(3) })
  const a = log.filter((e) => e.type === 'answer')
  assert.equal(a[3].ok, false); assert.equal(a[3].fromTier, 3); assert.equal(a[3].tier, 2, 'bajó un nivel')
  assert.equal(a[4].ok, true); assert.equal(a[4].tier, 3)
}

// Salto: una vez por pregunta, solo cuando ya se reveló, y lleva al carril correcto
{
  const g = createRace(V('programacion'), { rng: seeded(11), bonus: false })
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
  const g = createRace(V('filosofia'), { rng: seeded(5), bonus: false })
  for (let i = 0; i < 60 * 8; i++) g.step(1 / 60, { throttle: 1 })
  assert.ok(g.v > 10, 'acelerando avanza')
  const s0 = g.s
  for (let i = 0; i < 60 * 60; i++) g.step(1 / 60, { throttle: 0, brake: 1 })
  assert.ok(g.v < 0.5 && g.s - s0 < 400, 'sin acelerar se detiene')
  const h = createRace(V('filosofia'), { rng: seeded(5), bonus: false })
  for (let i = 0; i < 60 * 120 && h.s < h.forks[0].start - 20; i++) h.step(1 / 60, { throttle: 1 })
  for (let i = 0; i < 60 * 20; i++) h.step(1 / 60, { throttle: 1 })
  assert.ok(h.holding && h.v < 0.5 && h.s < h.forks[0].start, 'espera en el pórtico sin revelar')
  h.reveal(0); h.step(1 / 60, { throttle: 1 }); assert.equal(h.holding, false)
  const d = createRace(V('medicina'), { rng: seeded(9), bonus: false })
  for (let i = 0; i < 60 * 8; i++) d.step(1 / 60, { throttle: 1 })
  for (let i = 0; i < 60 * 1.5; i++) d.step(1 / 60, { throttle: 1, steer: 1, drift: true })
  assert.ok(d.drifting); d.step(1 / 60, { throttle: 1, steer: 0, drift: false }); assert.ok(d.boost > 0, 'soltar el derrape da mini-turbo')
}
console.log('ok · salto, parada, espera en el pórtico y derrape')

// 14 vehículos: empezar en un nivel alto da vehículo y preguntas más difíciles
{
  const g = createRace(V('medicina'), { rng: seeded(2), startTier: 9, bonus: false })
  assert.equal(g.tier, 9); assert.equal(g.startTier, 9)
  assert.equal(createRace(V('medicina'), { startTier: 99 }).tier, MAX_TIER, 'tope en el último vehículo')
  assert.equal(V('medicina').tiers.length, 14); assert.equal(V('medicina').tiers[13].kind, 'spaceship'); assert.equal(V('medicina').tiers[12].kind, 'plane')
}

// Poderes: el escudo absorbe una trampa (sin bajar de nivel), el nitro da turbo, la pista solo con la pregunta revelada
{
  const g = createRace(V('medicina'), { rng: seeded(21), startTier: 4, bonus: false })
  g.addPower('shield'); g.addPower('nitro'); g.addPower('hint')
  assert.equal(g.powers.length, 3)
  assert.equal(g.usePower(2), false, 'la pista no se puede usar antes de que haya pregunta revelada')
  assert.equal(g.usePower(1), true); assert.ok(g.boost >= 3, 'el nitro da turbo')
  g.addPower('jump'); g.addPower('hint'); assert.equal(g.powers.length, 3, 'máximo 3 poderes (sale el más viejo)'); g.addPower('shield')
  let ans = null
  for (let i = 0; i < 60 * 900 && !ans; i++) {
    const f = g.forks[g.idx]; if (f && f.asked) g.reveal(f.id)
    if (g.choosing) g.addPower('shield')
    const want = f && f.q && g.s > f.start - 70 - g.v * 1.5 ? laneBounds(f.n, (f.q.correct + 1) % f.n).center : 0 // va al carril equivocado
    g.step(1 / 60, { throttle: 1, steer: Math.abs(want - g.u) > 0.4 ? Math.sign(want - g.u) : 0 })
    ans = g.drain().find((e) => e.type === 'answer')
  }
  assert.ok(ans && !ans.ok && ans.shielded, 'el escudo absorbe la trampa'); assert.equal(ans.tier, 4, 'sin bajar de nivel'); assert.equal(g.crash, 0)
}

// Ruta de repaso: NO se detiene en las estaciones (el narrador las cuenta mientras avanzas); al final espera solo si falta contar la última
{
  const g = createRace(V('medicina'), { rng: seeded(8), bonus: false })
  for (let i = 0; i < 60 * 40; i++) { g.step(1 / 60, { throttle: 1 }); if (g.choosing) g.addPower('nitro'); const f = g.forks[0]; if (f.q && f.asked) { g.reveal(0); break } }
  const q = g.forks[0].q, s0 = g.s, u0 = g.u
  assert.ok(g.startDetour(q), 'abre la ruta'); assert.equal(g.startDetour(q), false, 'no se abre otra encima')
  const stations = g.detour.stations; assert.equal(stations.length, 5, 'respuesta + 2 párrafos + otras opciones + dato')
  const seen = []; let ends = false, stoppedMid = false
  for (let i = 0; i < 60 * 900 && g.detour; i++) {
    g.step(1 / 60, { throttle: 0 }) // aunque no aceleres, la ruta avanza sola
    for (const e of g.drain()) { if (e.type === 'station') { seen.push(e.index); g.revealStation(e.index) } if (e.type === 'detourEnd') ends = true }
    if (g.detour && g.detour.rs > 30 && g.detour.rs < routeLength(5) - 60 && g.detour.v < 5) stoppedMid = true
  }
  assert.ok(ends && !g.detour, 'termina la ruta'); assert.deepEqual(seen, [0, 1, 2, 3, 4], 'las estaciones se anuncian en orden')
  assert.equal(stoppedMid, false, 'el vehículo no se detiene en las estaciones'); assert.equal(g.s, s0, 'la carrera quedó donde estaba'); assert.equal(g.u, u0)
  // si nadie termina de contar la última estación, espera al final
  g.startDetour(q)
  for (let i = 0; i < 60 * 300; i++) g.step(1 / 60, {})
  assert.ok(g.detour && g.detour.holding && g.detour.rs < routeLength(5) + 1, 'espera al final a que termine la última estación')
  assert.ok(Math.abs(ROUTE.vmax * 3.6 - 255) < 0.01, 'límite de 255 km/h en la ruta de aprendizaje')
}
console.log('ok · 14 vehículos, poderes, historias y ruta de repaso sin paradas')

// Fase 4: modo libre, rivales de IA y cuenta atrás
{
  const { mulberry } = await import('./raceEngine.js')
  const fr = createRace(V('medicina'), { rng: seeded(3), free: true, startTier: 6 })
  assert.equal(fr.forks.length, 0, 'modo libre: sin bifurcaciones')
  for (let i = 0; i < 60 * 400 && !fr.finished; i++) { fr.step(1 / 60, { throttle: 1 }); if (fr.choosing || fr.paused) assert.fail('modo libre no se pausa') }
  assert.ok(fr.finished && fr.tier === 6, 'termina la pista sin cambiar de vehículo')
  // misma semilla = mismas preguntas (para jugar en línea)
  const a = createRace(V('medicina'), { rng: mulberry(42), fixed: true }), b = createRace(V('medicina'), { rng: mulberry(42), fixed: true })
  assert.deepEqual(a.forks.map((f) => f.q.q + f.q.correct), b.forks.map((f) => f.q.q + f.q.correct), 'preguntas y orden idénticos con la misma semilla')
  assert.ok(a.forks.every((f) => f.q), 'todas las preguntas se eligen al empezar')
  // con rivales: cuenta atrás, los bots avanzan, hay puesto y terminan
  const g = createRace(V('medicina'), { rng: mulberry(7), fixed: true, countdown: 3, bots: [{ name: 'A', skill: 0.9 }, { name: 'B', skill: 0.3 }] })
  for (let i = 0; i < 60 * 2; i++) g.step(1 / 60, { throttle: 1 })
  assert.ok(g.startIn > 0 && g.s === 0 && g.rivals.every((r) => r.s === 0), 'nadie arranca durante la cuenta atrás')
  for (let i = 0; i < 60 * 1.5; i++) g.step(1 / 60, { throttle: 0 })
  assert.ok(g.rivals.every((r) => r.s > 0) && g.s < 8, 'arrancan los bots; tú no aceleraste')
  assert.equal(g.rank(), 3, 'último si no te mueves')
  for (let i = 0; i < 60 * 900 && !g.rivals.every((r) => r.finished); i++) g.step(1 / 60, { throttle: 0 })
  assert.ok(g.rivals.every((r) => r.finished), 'los bots terminan solos')
  const top = g.rivals.find((r) => r.name === 'A'), low = g.rivals.find((r) => r.name === 'B')
  assert.ok(top.finishT < low.finishT, 'el bot hábil termina antes que el torpe')
  assert.equal(g.board().length, 3)
  console.log('ok · modo libre, semilla compartida, rivales de IA y cuenta atrás')
}

// Pistas: cada una cambia de rumbo sin curvas imposibles, avanza siempre hacia delante y pasa por el origen en s = 0
{
  const { TRACKS, setTrack, centerX, centerZ, yawAt } = await import('./trackMath.js')
  for (const id of Object.keys(TRACKS)) {
    setTrack(id)
    assert.ok(Math.abs(centerX(0)) < 1e-6 || id === 'classic', `${id}: pasa por el origen`)
    let maxCurv = 0, minDz = Infinity, maxYaw = 0
    for (let s = 0; s < 15000; s += 5) { maxCurv = Math.max(maxCurv, Math.abs(yawAt(s + 1) - yawAt(s))); minDz = Math.min(minDz, centerZ(s) - centerZ(s + 5)); maxYaw = Math.max(maxYaw, Math.abs(yawAt(s))) }
    assert.ok(id === 'classic' || maxCurv < 0.0034, `${id}: radio de curva ≥ 300 m (${maxCurv.toFixed(4)})`)
    assert.ok(minDz > 0, `${id}: la pista siempre avanza hacia delante`)
    const g = createRace(V('medicina'), { rng: seeded(2), track: id, free: true, startTier: 9 })
    for (let i = 0; i < 60 * 600 && !g.finished; i++) g.step(1 / 60, { throttle: 1 })
    assert.ok(g.finished, `${id}: se puede terminar`)
    console.log(`ok pista ${id} · giro máx ${(maxYaw * 57.3).toFixed(0)}° · ${(g.time).toFixed(0)} s a 1000 km/h`)
  }
  setTrack('classic')
}

import { mulberry } from './raceEngine.js'
// Cajas de bonus: hay muchas, no caen en bifurcaciones, son iguales con la misma semilla y se recogen al pasar por encima
{
  const a = createRace(V('medicina'), { rng: mulberry(5), fixed: true }), b = createRace(V('medicina'), { rng: mulberry(5), fixed: true })
  assert.ok(a.pickups.length > 40, `hay cajas y plataformas (${a.pickups.length})`)
  assert.deepEqual(a.pickups.map((p) => [p.kind, p.s | 0]), b.pickups.map((p) => [p.kind, p.s | 0]), 'mismos lugares con la misma semilla')
  assert.ok(a.pickups.every((p) => !a.forks.some((f) => p.s > f.start - 90 && p.s < f.start + 230)), 'ninguna dentro de una bifurcación')
  const g = createRace(V('medicina'), { rng: mulberry(5), free: true, startTier: 3 })
  const first = g.pickups.find((p) => p.kind === 'box'); let got = null
  for (let i = 0; i < 60 * 200 && !got; i++) { g.step(1 / 60, { throttle: 1, steer: Math.abs(first.u - g.u) > 0.3 ? Math.sign(first.u - g.u) : 0 }); got = g.drain().find((e) => e.type === 'pickup') }
  assert.ok(got && g.fxBox > 0, 'recoge una caja al pasar por encima')
  console.log(`ok · ${a.pickups.length} cajas y plataformas, recogida correcta`)
}
