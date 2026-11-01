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
