# Migración de contenido a base de datos ("estilo core de servidor WoW")

## Por qué existe esto

Comparando con cómo funcionan los cores de servidor privado de World of
Warcraft (TrinityCore/AzerothCore): el contenido del juego (NPCs, misiones,
objetos) vive en tablas SQL que un GM edita en caliente, nunca hardcodeado
en el binario del servidor. Oliver Academy va en esa misma dirección: mover
el contenido (cursos primero, después juegos/mundo VR/logros) de archivos
JS/JSON hardcodeados a tablas de Supabase, editables desde un panel admin
sin que haga falta tocar código ni hacer un deploy.

No es una reescritura — la plataforma ya usaba un patrón parecido
(`course_exams` con contenido en una columna `jsonb`, editable desde
`AdminExamsPage.jsx`). Esto extiende ese mismo patrón.

## Fase 1 — Cursos ✅ (completada)

**Qué cambió:**
- Nueva tabla `public.courses` (`supabase/migration_024.sql`) — reemplaza
  `src/data/courses.json` (catálogo) + `src/data/courseRegistry.js`
  (contenido) por una sola fila por curso, con `modules jsonb`.
- Semilla de los 48 cursos existentes (19 con contenido real, 29
  bloqueados/placeholder) en `supabase/migration_025.sql`, generada por
  `scripts/generate-course-seed.mjs` a partir de los archivos que ya
  existían — no se retipeó nada a mano.
- `src/stores/useCourseContentStore.js` (nuevo) — carga TODO (catálogo +
  contenido) de una sola vez al arrancar la app (`App.jsx`), no por curso
  bajo demanda. Fue una decisión deliberada, no el diseño original: cargar
  bajo demanda rompía en silencio para cualquier componente que llama a
  `getCourseData()` como función plana (no como hook) — no se re-renderiza
  solo cuando el fetch resuelve después. Cargar todo de una vez, antes de
  que cualquier ruta protegida monte, evita ese hueco. El costo de payload
  extra no es una regresión: los 19 archivos de contenido YA viven sin
  lazy-loading en el bundle inicial hoy — esto cambia "bundleado siempre"
  por "descargado siempre", mismo orden de magnitud.
- `src/data/courseRegistry.js` reescrito como capa de compatibilidad —
  `getCourseData`/`hasCourseData`/`COURSES_DATA` (este último ahora un
  `Proxy` que reenvía al store) mantienen la misma forma de siempre, así que
  los ~20 componentes que ya los usaban no cambiaron.
- 3 archivos tenían un bug real de "lee el contenido a nivel de módulo, una
  sola vez, al importar" — con contenido async eso se congelaba vacío para
  siempre, sin ningún error visible: `AchievementWatcher.jsx`,
  `AchievementsPanel.jsx`, `searchIndex.js`. Los tres se arreglaron para
  recalcular después de que el store cargue (o en cada búsqueda, para
  `searchIndex.js`).
- `ProtectedRoute.jsx` gana un segundo gate (igual al de `authReady`):
  bloquea el render hasta que `useCourseContentStore` haya cargado.
- Editor admin nuevo: `/admin/cursos` (`AdminCoursesPage.jsx`) — mismo
  patrón que `AdminExamsPage.jsx` (estado local, un botón que sube todo el
  curso de una vez).

**Deliberadamente NO migrado en esta fase** (para no agrandar el cambio
más de lo necesario): `src/data/courses.json` sigue existiendo tal cual y
lo siguen leyendo ~14 archivos que solo necesitan metadata simple (título,
ícono) para etiquetar algo — ej. `ExamsPage.jsx`, `AdminTasksPage.jsx`,
`LandingPage.jsx`. Si un admin edita el título de un curso desde
`/admin/cursos`, esos 14 lugares seguirán mostrando el título viejo hasta
que se actualicen o se borre `courses.json` en una limpieza futura — el
objetivo de esta fase era que el LECTOR del curso (`/learn/:id`) y las
páginas de biblioteca (`/dashboard`, `/escuela`, `/academias/ia`) fueran
editables sin deploy, no cada lugar de la app que menciona un título de
curso.

**Limpieza pendiente** (no se hace hasta verificar todo en producción):
borrar los 19 archivos estáticos de `src/data/course*.js|json` +
`courses.json`, y migrar esos ~14 archivos restantes a leer del catálogo
del store en vez del JSON estático.

## Fase 2 — Janulingo (pendiente, sesión futura)

`src/data/matrixData.js` (5442 líneas) — idiomas → niveles → bases/verbos/
vocabulario, todo hardcodeado igual que los cursos lo estaban. El arreglo de
esta sesión (compatibilidad verbo↔objeto vía stem-matching contra
`examples`, en `JanulingoEngine.jsx`) se calcula en runtime — al migrar a
DB, podría convertirse en una tabla explícita de pares verbo-objeto en vez
de calcularse cada vez.

## Fase 3 — Mundo VR (pendiente, sesión futura)

`tutorialMissions.js`, `questsRegistry.js`, `vrNpcRegistry.js` — esto es lo
más parecido al patrón "GM agrega un NPC" de WoW. Mayor beneficio de UX de
admin (agregar una misión o NPC sin deploy) con menor volumen de datos que
Janulingo.

## Fase 4 — Logros/skills/equipo (pendiente, baja prioridad)

Contenido que cambia poco una vez definido — puede quedarse estático más
tiempo que el resto.

## Cómo retomar esto en una sesión futura

1. Lee este archivo completo primero.
2. Revisa `src/stores/useCourseContentStore.js` y `src/data/courseRegistry.js`
   como referencia del patrón ya usado (store + capa de compatibilidad +
   gate en `ProtectedRoute.jsx`) — repetirlo para la Fase 2/3 es el mismo
   esqueleto, cambiando solo qué tabla y qué archivo se reemplaza.
3. `AdminCoursesPage.jsx` es la referencia de editor admin a copiar.
4. Antes de dar por hecho que "solo 2-3 archivos consumen esto", grepea a
   fondo — en Cursos la investigación inicial encontró 16 consumidores, pero
   la lista real (incluyendo quienes importan el objeto de datos crudo
   directo, no solo las funciones getX/hasX) resultó ser más de 25. Fue el
   punto más subestimado de todo este plan.
