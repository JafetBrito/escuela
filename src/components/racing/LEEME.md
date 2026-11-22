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

## Fase 2 (hecha)
- **14 vehículos por mundo** (nivel 0–13): los 10–11 son aerodeslizadores, el 12 un avión y el 13 una nave espacial; del 10 en adelante **vuelan** (altura, sombra en el suelo, cámara más alta). Velocidad = `20 + 3.2 × nivel` m/s. La dificultad de las preguntas sigue al nivel (`lvlOfTier`).
- **Garaje** (`RacingGarage.jsx`): vista 3D de tu vehículo, los 14 con candado (se desbloquea el más alto que alcances en una carrera), nivel/XP/estadísticas del mundo y **personalización** (pintura, luces, accesorio: bandera/antena/alerones). Elige con qué vehículo empezar.
- **Perfil guardado en la cuenta** (`stores/useRacingStore.js`, snapshot `racing`): XP, nivel, `bestTier`, estadísticas, vehículo inicial y personalización por mundo.
- **Poderes**: al empezar cada misión nueva eliges 1 de 3 (🛡️ escudo pasivo, 💡 pista, 🔥 nitro, 🌀 salto extra); se usan con Q/E/R o tocando el ícono. Máximo 3.
- **Acertar ya NO detiene el vehículo**: aviso con el dato (9 s) y botón "Visitar ruta de repaso". Fallar abre una ventana que sí pausa.
- **Ruta de repaso real**: "Visitar ruta" lleva el vehículo a una pista aparte (`routeBuild.js`, a 4000 m de la carrera) con una **estación por tramo de la explicación detallada** (respuesta → 2 párrafos de `racingDeep.js` → por qué las otras no → dato). En cada estación el locutor la cuenta y el vehículo espera (botón "Siguiente"); al final o con "Volver a la carrera" regresas exactamente donde estabas. Las 70 preguntas tienen explicación de 2 párrafos.
- Resultados con XP ganada, subida de nivel y vehículo desbloqueado.

## Fase 3 (hecha)
- **Ruta de repaso SIN paradas**: el vehículo avanza solo a ritmo moderado (`ROUTE.vmax` = 16 m/s; puedes frenar y girar) y el locutor cuenta las estaciones EN ORDEN mientras te acercas (cola en la interfaz; el motor solo espera al final si falta contar la última). Botones "Saltar" (la narración actual) y "Volver a la carrera". Estaciones a 260 m.
- **Niveles**: cada mundo tiene `levels[]`; cada nivel = 3 misiones + un banco de ≥ 30 preguntas (`MIN_QUESTIONS`). `levelView(world, i)` arma el "mundo" que usa el motor. Selector de niveles en el menú, con ⭐ (6+/9+/11+ aciertos de 12) y el siguiente se desbloquea con ≥ 1 estrella. Hoy: Nivel 1 de cada mundo, 30 preguntas c/u (todas con explicación detallada).
- **Historias**: cada misión trae `story[4]`; el locutor cuenta un episodio 160 m después de cada bifurcación (Larrey y la ambulancia, Hipócrates, Pasteur/Fleming · Ada Lovelace, Berners-Lee, Turing · Sócrates, la caverna, Kant), con tarjeta "📖 Historia".
- **Editor** `/carrera/editor` (solo admin): preguntas (tema, dificultad, emoji, trampas, dato, explicación de 2 párrafos, pestañas ES/EN/FR), misiones (escenario, paleta, temas, introducción y 4 episodios), niveles nuevos, informe de calidad, importar/exportar JSON, y **IA del usuario** (Ajustes → Núcleo) para traducir a EN/FR (una o todas las pendientes) y para generar preguntas nuevas. Guarda en **Supabase `racing_content`** (`supabase/migration_085.sql`, una fila por mundo; si no existe, el juego usa el contenido de serie). `racingContent.js` fusiona lo remoto sobre la semilla y guarda caché local.
- Contenido traducible: cualquier misión o pregunta acepta `i18n: { en: {...}, fr: {...} }` (en preguntas, `deep` como texto con párrafos separados por `|`).

## Pendiente
**Fase 4 — Modos y menús.** Selector de personaje; **modo libre** (solo rodar y probar); competir contra **IA** (bots) y contra otra persona (Supabase Realtime).
**Fase 5 — Pistas y arte.** Más variación procedural (saltos, rampas, túneles, tramos de vuelo con más control), mejores gráficos y partículas, más música por mundo, **modelos 3D del campus** como decorado grande, y **editor de pistas/modelos** como el de mapas (`/vr/editor`).
**Contenido:** más niveles por mundo (≥ 30 preguntas c/u) y traducir las 90 preguntas y las 9 misiones a EN/FR (usa el editor).
