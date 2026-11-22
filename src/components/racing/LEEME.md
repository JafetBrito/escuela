# Oliver Racing — `/carrera`

Carrera 3D estilo Tux Racer donde **el mundo (profesión) que eliges define las preguntas, el vehículo y la pista**. Controlas tú: acelerar, frenar, girar y derrapar; el vehículo espera en el pórtico a que el locutor termine de leer la pregunta.

## Fase 1 (hecha)
- **Control manual** (W/↑ acelerar · S/↓ frenar · ←→/AD girar · Espacio/Shift derrapar). Si no aceleras te detienes. Modo **Auto** (por defecto en celular) acelera solo.
- **Pista larga (~11.7 km) con subidas y bajadas** (`trackMath.js`): la pendiente suma o resta velocidad.
- **Lectura completa antes de las opciones**: la pregunta se anuncia a 460 m; el vehículo se detiene en el pórtico (`holding`) hasta que la voz termina (`onEnd` → `game.reveal`); entonces aparecen las opciones y los carteles. Sin voz, se revelan tras un tiempo de lectura estimado.
- **Derrape**: gira + derrapa a más de 14 m/s → más agarre y mini-turbo al soltar.
- **Ventana de información tras cada respuesta** (la partida se pausa): explicación + dato curioso + cambio de nivel; si fallaste, **Ruta de repaso** (la respuesta correcta explicada y narrada) y luego "Volver a la pista".
- Fondo de montañas, bloom, minimapa de la pista con tus aciertos, ambiente que cambia por misión.
- **Idiomas**: interfaz en es/en/fr (`racingI18n.js`). El contenido (mundos, misiones, preguntas) puede traer `i18n: { en: {...}, fr: {...} }`; lo que falte cae a español. La voz usa el idioma actual.
- Música y efectos sintetizados (Web Audio), locutor con `speechSynthesis`.

## Archivos
`racingData.js` (mundos, misiones, preguntas, constantes) · `raceEngine.js` (motor sin React, prueba: `node src/components/racing/raceEngine.test.mjs`) · `trackMath.js` / `track.js` / `trackBuild.js` (pista) · `vehicles.js` · `racingAudio.js` · `racingVoice.js` · `racingI18n.js` · `RacingDemo.jsx` (menú, escena, HUD).

## Plan de fases (pedido del usuario, 2026-11-22)
**Fase 2 — Progreso y garaje.** 14 vehículos por mundo (los 2 últimos: avión y nave espacial con turbo; el tramo final se vuelve vuelo). Perfil guardado en la cuenta (nivel, XP, vehículos, récords). Menú de garaje: ver tu vehículo, nivel y progreso; **personalizar** (colores, piezas, calcomanías según los gustos de cada profesión). Poderes/mejoras al avanzar (escudo, 50/50, tiempo lento, salto extra...), 1 por misión.
**Fase 3 — Contenido por niveles.** Mundos con varios niveles/misiones (cada uno con una historia que se va aprendiendo), ≥ 30 preguntas por nivel, traducciones EN/FR. **Editor de preguntas/misiones** con importar/exportar JSON-CSV (y generación con IA del usuario).
**Fase 4 — Modos y menús.** Selector de personaje y de nivel; **modo libre** (solo rodar y probar); competir contra **IA** (bots) y contra otra persona (Supabase Realtime).
**Fase 5 — Pistas y arte.** Más variación procedural (saltos, rampas, túneles, tramos de vuelo), mejores gráficos y partículas, más música por mundo, **modelos 3D del campus** como decorado grande, y **editor de pistas/modelos** como el de mapas (`/vr/editor`).
**Fase 6 — Ruta especial real.** Hoy la "ruta de repaso" es una ventana; la versión final sería un desvío físico en la pista que cuenta la respuesta y vuelve a la pista principal.
