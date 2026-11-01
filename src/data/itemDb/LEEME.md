# Base de datos de objetos (estilo WoW)

Todo objeto del juego es **una fila** de `ITEM_DB` con los mismos campos (como `item_template`). Se ve y se busca en
`/db/items` (filtros por clase, calidad, uso y fuente; tooltip; fila cruda; exportar JSON/CSV).

| Campo | Qué es |
|---|---|
| `entry` | Número **estable** (ids.json). Nunca cambia aunque renombres el objeto. Rango por clase: consumible 1000, equipo 2000, cosmético 3000, mascota 4000, herramienta 5000, prompt 6000, llave 7000, trofeo/misión 8000 |
| `key` | El id de siempre (`gorra_estudiante`, `reina-nefertiti`…): así nada existente se rompe |
| `name`, `description`, `i18n.en` | Textos (español base; inglés opcional) |
| `icon`, `image`, `model` | Emoji, imagen y modelo 3D (`{kind: 'mascot'\|'glb', ref}`) |
| `class`, `subclass`, `quality` | Qué es y qué tan raro (`common → legendary`) |
| `bonding`, `slot`, `owner`, `requiredLevel`, `requiredClass`, `stats` | Equipo y requisitos |
| `effects[]` | Qué hace al usarlo: `pet_need`, `unlock_mascot`, `toggle_tool`, `ai_prompt`, `equip`… |
| `source[]` | Cómo se consigue: `vendor`, `starter`, `condition`, `quest`, `loot`, `admin`, `soon` |
| `buyPrice`, `sellPrice` | En cobre (10000 = 1 oro) |
| `contexts[]` | Dónde sirve: `app`, `vr`, `hub` (un objeto puede servir dentro y fuera del juego) |
| `flags[]`, `tags[]`, `stackable`, `maxStack` | Extras |

## Cómo se agrega un objeto
1. Ponlo en su registro de origen (`shopRegistry`, `equipmentRegistry`, `itemsRegistry`, `petFoods`…). `raw.js` los convierte al formato único.
2. `node scripts/items/sync-ids.mjs` le asigna su `entry`.
3. Revísalo en `/db/items`.

## Supabase (etapa 2)
- `supabase/migration_084.sql` crea `item_templates` (entry, key, data jsonb) con RLS: lectura para todos, escritura solo admin (`is_admin()`), y siembra los objetos actuales (`on conflict do nothing`: no pisa ediciones). Se genera con `node scripts/items/make-migration.mjs`; pégala en el SQL Editor de Supabase.
- `itemDb/remote.js` carga la tabla al abrir `/db/items` o el Hub, la mezcla sobre los valores locales (`applyRemoteRows`) y guarda copia en localStorage. Si la tabla no existe todavía, todo sigue funcionando con los valores locales.
- En `/db/items` un admin puede **editar** nombre, descripción, ícono, calidad, precio, nivel y dónde se usa, y crear objetos nuevos (`＋ Nuevo`); se guarda en Supabase y la comida del Hub ya lo respeta.

## Siguiente etapa (pendiente)
- Que bolsas, tienda, inventario, equipo y misiones guarden/lean por `entry` (hoy siguen usando `key`).
- Que tienda y equipo lean de ITEM_DB en lugar de sus registros viejos (hoy solo el Hub lee la tabla editada).
- Mismo modelo para clases y subclases (`class_template`) y habilidades.
