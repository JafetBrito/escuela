---
name: mapas-vr-lowpoly
description: Cómo se construyen los mapas 3D del VR de Oliver Academy (campus universitario, hospital escuela y los que vengan) — mapas por datos JSON + piezas procedurales low-poly + editor /vr/editor. Úsalo siempre que se pida crear, ampliar o corregir un mapa/edificio/interior del VR, o agregar un mapa nuevo "con este mismo estilo".
---

# Mapas VR low-poly por datos (referente de estilo y de método)

Un mapa NO es código: es un **layout JSON** (`src/data/<mapa>Layout.json`) que dibuja `CampusScenery` con **piezas procedurales** (`campusKit.js`, `hospitalKit.js`). Se edita en `/vr/editor?map=<id>` y se juega en la ruta del mapa. Lee primero `scripts/campus/LEEME.md` (formato) y la memoria `project_campus_university.md`.

## Piezas del sistema (`src/components/vr/campus/`)
| Archivo | Qué hace |
|---|---|
| `mesher.js` | `Mesher`: cajas/cilindros/conos/techos con **color por vértice**, se funden en 1 geometría. Convención: (x,y,z) = centro de la BASE; `ry` gira sobre ese punto. |
| `campusKit.js` | `buildBuilding` (edificio hueco por parámetros), árboles/farolas/vallas/puente/estadio, `CATALOG` (paleta + campos del inspector), `pieceFor(item)` con caché. |
| `hospitalKit.js` + `hospitalData.js` | Hospital por **cuartos** (`room`): `buildRoom`, equipo médico (`Eq`), mobiliario por tipo (`FUR`), letreros, helipuerto… `hospitalData` = departamentos, tipos de área, textos docentes es/en. |
| `CampusScenery.jsx` | Dibuja un layout; en juego funde piezas por zonas de 70 m y arma la cáscara de colisión (`onShell`). |
| `campusWorld.js` | Terreno (`heightAt`, modo `river`/`flat`), caminos/pavimentos, `itemY`, `npcPoints`, escala `CAMPUS_S = 0.33` u/m. |
| `campusMaps.js` | Registro `MAPS` (id → layout, ruta, archivo). |
| `signs.js` | Letreros a atlas de texturas (cientos de carteles = pocos draw calls). |
| `HospitalOverlay.jsx` | Panel "dónde estás/qué pasa aquí", directorio con teletransporte y ascensor por niveles. |
| `CampusEditor.jsx` | Editor (paleta, gizmo, niveles, deshacer, guardado, recorrido guiado). |

## Reglas que NO se rompen
- **Unidades: metros**, +Z al sur, `rot` en grados (0 = frente a +Z). El motor usa unidades de mundo = metros × `CAMPUS_S`.
- **Todo lo que pueda suspender dentro del Canvas lleva su propio `<Suspense>`** (un r3f Block mata el contexto WebGL). `CampusScenery` va lazy dentro de `<Suspense fallback={null}>`.
- **Colisión = geometría aparte**: cada pieza devuelve `collide` (paredes, no-suelo), `floors` (suelo visible+caminable), `ramps` (suelo invisible, p. ej. escaleras). El Player lanza rayos solo contra esa cáscara (`isFloor` = suelo). Mantén `collide` en pocas cajas.
- **Pisos altos**: el Player usa `multiLevel` (rayo desde pies+0.7u, gana el piso más alto). Una escalera = peldaños visibles + rampa invisible en `ramps` + hueco en la losa de arriba. Prueba siempre subiendo con rayos o a pie.
- **Techos y cámara**: el Player limita la cámara bajo el primer collider de techo; cada cuarto/edificio cerrado necesita su `collide` de techo. No dejes la cámara sin techo en interiores.
- Rendimiento: mallas por pieza = solo editor; en juego se funden. Árboles/autos van `instanced`. Letreros por atlas. Nada de una luz por cuarto: `InteriorLights` reparte 6 PointLights entre las lámparas más cercanas (`piece.lights`).
- Interiores claros: ambient del mapa (`data.ambient`), techos emisivos, `data.lamp` = potencia de las luces. Evita sobreexposición (bloom).
- Estilo: low-poly **atmosférico** (flat shading, paleta cálida, hora del día por `PRESETS`), color por vértice, sin texturas (salvo letreros). Rótulos legibles, departamentos con color de señalización constante.
- Nunca nombres/escudos reales (Harvard, hospitales reales): "inspirado en".

## Agregar un edificio / pieza
1. Si es un parámetro más de lo existente → edita `CATALOG[tipo].fields`/`buildBuilding`.
2. Pieza nueva → función `buildX(params)` que devuelve `{solid, floors?, ramps?, glass?, roof?, emissive?, collide?, lights?, signs?, bounds}`; regístrala en `CATALOG` (+ `pieceFor`/`hospitalPiece`).
3. Un mueble/equipo nuevo → método de `Eq` (hospital) o `Furnish` (campus) y úsalo en `FUR[kind]`.

## Agregar un MAPA nuevo
1. Genera su JSON (script en `scripts/campus/gen<Mapa>.mjs` o a mano en el editor). Campos: `version`, `map`, `terrain` (`river`|`flat`), `ambient`, `lamp`, `spawn:[x,z]`, `items`.
2. Regístralo en `campusMaps.js` (`MAPS`), crea la ruta en `App.jsx` (`<VRPage plazaMode campusMap="<id>" />`, DEV abierto / prod `ProtectedRoute`), entrada en `TRANSPORT_WORLDS` de `VRPage.jsx` y textos i18n (`vr.transportMenu.worlds.<id>`, `vr.worldNames.<id>`) en es/en/fr.
3. Si necesita capa propia (como `HospitalOverlay`), móntala en `VRPage` bajo `campusMap === '<id>'`.
4. Agrega el id al whitelist de `campusEditorPlugin` en `vite.config.js` para que el editor guarde directo.

## Hospital: modelo de datos
- `room`: `{x,z (centro), w,d, level 0-4, hh (niveles de alto), kind, name, door (N/S/E/W), extraDoor, dpos, ext (lados con ventana), walls, top (azotea), up (escalera sube), rail}`. Nivel = `level * 4.4 m`. Las puertas dan a pasillos (`corridor`), cada puerta lleva su letrero con el color del departamento.
- Escaleras = mismo `x,z` en todos los niveles (`stairs`), ascensores igual (`elevator`; cambio de piso en `HospitalOverlay`).
- `scripts/campus/genHospital.mjs` calcula solo puertas, ventanas, azoteas y escaleras a partir de los rectángulos.
- Cada `kind` tiene `info` docente (es/en) en `hospitalData.js`; mantenlo médicamente correcto y breve. Es material de clase.

## Verificación mínima antes de entregar
`npx eslint src/components/vr/campus` limpio · `npx vite build` · abrir la ruta en el preview (nombre del mapa, exterior, un interior por tipo, subir una escalera, ver consola sin errores) · en el editor: cargar, seleccionar, cambiar un parámetro, guardar.
