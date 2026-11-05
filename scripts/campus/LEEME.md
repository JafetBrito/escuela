# Campus: cómo se arma y cómo editarlo

El campus es **datos**, no código: `src/data/campusLayout.json`. El juego (`/vr/campus`) y el editor
(`/vr/editor`) leen ese mismo archivo.

```json
{ "version": 1, "spawn": [0, 132],
  "items": [
    { "id": "b1", "type": "building", "x": 0, "z": -62, "rot": 0, "w": 60, "d": 34, "floors": 3,
      "style": "neo", "roof": "hip", "interior": "library", "portico": true, "sign": "Biblioteca Central" },
    { "id": "p1", "type": "path", "pts": [[0, 112], [0, 30]], "w": 6, "mat": "gravel" }
  ] }
```

- Unidades: **metros**, +Z hacia el sur (el río). `rot` en grados: 0 = el frente mira a +Z, 90 = a +X, 180 = a -Z, -90 = a -X.
- `y` es opcional (si falta, la pieza se apoya en el terreno). En `npc` sí conviene ponerlo si el punto está dentro de un edificio con zócalo.
- Tipos y sus campos: `CATALOG` en `src/components/vr/campus/campusKit.js` (building, tree, lamp, bench, flagpole, hedge, fence, gate, fountain, statue, kiosk, tower, bridge, stadium, pave, npc, glb) + `path`.
- Edificio: `style` brick|neo|brut|modern · `roof` gable|hip|flat · `interior` hall|classroom|library|dining|chapel|lab|dorm|cafe · `tower` none|cupola|steeple.

## Flujo de trabajo
1. `npm run dev` y abre `/vr/editor`. **Guardar** escribe `src/data/campusLayout.json` (en producción descarga el JSON).
2. **Probar aquí** guarda y abre `/vr/campus?spawn=x,z` justo en esa pieza.
3. Haz commit del JSON.

## Herramientas externas
- Cualquier script puede generar/editar el JSON (ver `genLayout.mjs`, que crea el layout inicial — ojo: sobrescribe).
- **Modelos propios**: guarda `.glb` en `src/assets/campus/` (Blender, Tripo…). Salen en la paleta del editor (grupo "Mis modelos") y se guardan como `{ "type": "glb", "file": "mi-modelo.glb", "s": 1 }`. Los `.glb` no colisionan todavía (solo decoran).
- Para exportar desde Blender: Y arriba, 1 unidad = 1 metro, pivote en la base del objeto.


## Mapas y editor
- Mapas: `campusLayout.json` (`/vr/campus`) y `hospitalLayout.json` (`/vr/hospital`). El editor elige mapa con `/vr/editor?map=campus|hospital` (o el selector de arriba).
- **Hospital**: la pieza base es `room` (`kind`, `level`, `w`, `d`, `door`, `ext`, `walls`, `top`, `up`, `rail`…); ver `src/components/vr/campus/hospitalData.js` para los tipos de área. `scripts/campus/genHospital.mjs` crea el plano inicial y calcula puertas/ventanas/azoteas.
- Editor: selector de niveles (solo/hasta nivel N), cuadrícula, techos, 🗗 **Ventana aparte** (abre el editor en otra ventana), ❓ **Cómo funciona** (recorrido guiado que NO guarda cambios), ⬆ copiar un cuarto al nivel de arriba.
- **Santuario de los Caminos** (`/vr/santuario`, `santuarioLayout.json`): el mapa del tutorial. `terrain: 'sanctuary'` = colinas que suben al norte con una **explanada plana bajo cada `zone`** (el terreno lee las zonas del layout: muévelas en el editor y el suelo las sigue; `lift` = elevación extra, `step` = paso del tutorial que vive ahí). Paleta fija con `preset: 'amanecer'`. Piezas propias en `sanctuaryKit.js` (altar de clase con emblema, faro, fogata, nido, muñeco, observatorio, arco, antorcha, estandarte, roca, ruinas). Los puntos `npc` llevan `who` (id del NPC: `jafet`, `oliver`). Generador: `scripts/campus/genSantuario.mjs` (sobrescribe).
- **La Caverna de Platón** (`/vr/caverna`, `cavernaLayout.json`): campo + ágora al sur y la montaña hueca al norte (boca en (0,0), túnel y cámara hacia -Z). Usa el terreno `sanctuary` con `rise: 0`, `autumn` bajo y `sunAz` (el sol por el sur para que la fachada reciba luz). Las zonas con `dark` (0–1) apagan la luz del cielo al entrar (`CaveMood` en CampusScenery); `silent: true` = solo aplana el terreno, sin aviso de zona. Piezas en `cavernKit.js` (caverna, pared de sombras, prisionero, muro con titiriteros, hoguera, estalactitas/estalagmitas, formas platónicas, monumento al Sol). Generador: `scripts/campus/genCaverna.mjs` (sobrescribe).
- `?spawn=x,z[,y]` en la ruta del juego: aparecer en ese punto (y en metros para pisos altos).
