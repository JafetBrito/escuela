// Asigna un `entry` NUMÉRICO ESTABLE a cada objeto (como el entry de item_template en WoW) y lo guarda en
// src/data/itemDb/ids.json. Solo agrega: un objeto conserva su número para siempre aunque lo renombres o cambies de lugar.
// El rango sale de la clase (consumible 1000+, equipo 2000+, cosmético 3000+, mascota 4000+, herramienta 5000+, ...).
// Uso: node scripts/items/sync-ids.mjs     (córrelo después de agregar objetos a cualquier registro)
import { buildSync } from 'esbuild'
import { readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const tmp = mkdtempSync(join(tmpdir(), 'items-'))
const out = join(tmp, 'raw.mjs')
buildSync({ entryPoints: [join(root, 'src/data/itemDb/raw.js')], bundle: true, platform: 'node', format: 'esm', outfile: out, logLevel: 'error' })
const { rawItems } = await import(pathToFileURL(out).href)
const { ITEM_CLASS } = await import(pathToFileURL((buildSync({ entryPoints: [join(root, 'src/data/itemDb/enums.js')], bundle: true, platform: 'node', format: 'esm', outfile: join(tmp, 'enums.mjs'), logLevel: 'error' }), join(tmp, 'enums.mjs'))).href)

const idsPath = join(root, 'src/data/itemDb/ids.json')
const ids = existsSync(idsPath) ? JSON.parse(readFileSync(idsPath, 'utf8')) : {}
const next = Object.fromEntries(Object.entries(ITEM_CLASS).map(([c, v]) => [c, Math.max(v.base, ...Object.entries(ids).filter(([, n]) => n >= v.base && n < v.base + 1000).map(([, n]) => n + 1))]))
let added = 0
for (const it of rawItems()) {
  if (ids[it.key] != null) continue
  ids[it.key] = next[it.class]++
  added++
}
writeFileSync(idsPath, JSON.stringify(Object.fromEntries(Object.entries(ids).sort((a, b) => a[1] - b[1])), null, 1) + '\n')
rmSync(tmp, { recursive: true, force: true })
console.log(`ids.json: ${Object.keys(ids).length} objetos (${added} nuevos)`)
