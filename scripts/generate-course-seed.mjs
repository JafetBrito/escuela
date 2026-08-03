// Corre UNA vez para generar supabase/migration_025.sql a partir del
// contenido que hoy vive hardcodeado en src/data/course*.js|json — no forma
// parte de la app, no se importa desde src/.
//
// Uso: node scripts/generate-course-seed.mjs
import { createRequire, register } from 'node:module'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

// Los archivos de curso importan sus helpers sin extensión (`./glossaryRegistry`),
// que Vite resuelve solo pero Node plano no — este hook lo arregla solo para
// este script (ver esm-loader.mjs).
register('./esm-loader.mjs', import.meta.url)

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, '..', 'src', 'data')

// courses.json = catálogo (48 entradas). Se lee con require() en vez de
// import porque Node plano (a diferencia de Vite) no resuelve JSON sin
// sintaxis de import-attributes que varía por versión — require() no tiene
// ese problema.
const catalog = require(path.join(dataDir, 'courses.json'))

// Los 19 archivos de contenido real, mismo mapeo que courseRegistry.js.
// Los .js se importan dinámicamente (son objetos planos, sin JSX ni nada
// específico de Vite/React — seguro bajo Node normal); los .json con
// require(), igual que el catálogo.
const CONTENT_FILES = [
  ['course.json', 'json'],
  ['coursePromptEngineering.js', 'js'],
  ['courseDemo.json', 'json'],
  ['courseFilosofia.json', 'json'],
  ['courseClaudeMayores.json', 'json'],
  ['courseAjedrez.json', 'json'],
  ['courseBash.json', 'json'],
  ['courseHistoriaMatematicas.json', 'json'],
  ['courseMedicina.js', 'js'],
  ['coursePsicologia.js', 'js'],
  ['courseBiologia.js', 'js'],
  ['courseSumerios.js', 'js'],
  ['courseEtica.js', 'js'],
  ['courseDerecho.js', 'js'],
  ['courseDerechosMexico.js', 'js'],
  ['courseDerechosCanada.js', 'js'],
  ['courseMujeresHistoria.js', 'js'],
  ['courseDesarrolloMujeres.js', 'js'],
  ['courseNahuatl.js', 'js'],
]

const contentByCourseId = {}
for (const [file, kind] of CONTENT_FILES) {
  const full = path.join(dataDir, file)
  const mod = kind === 'json' ? require(full) : (await import(`file://${full.replace(/\\/g, '/')}`)).default
  contentByCourseId[mod.courseId] = mod
}

// `comments: []` en cada módulo es un resto sin uso — los comentarios reales
// viven en la tabla course_comments, no en el contenido del curso.
function stripComments(modules) {
  return (modules ?? []).map(({ comments, ...rest }) => rest)
}

function sqlString(value) {
  if (value === null || value === undefined) return 'null'
  return `'${String(value).replace(/'/g, "''")}'`
}

function sqlJsonb(value) {
  return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`
}

const rows = catalog.map((entry) => {
  const content = contentByCourseId[entry.id]
  return {
    id: entry.id,
    title: entry.title,
    description: entry.description ?? null,
    ai_instructions: content?.aiInstructions ?? null,
    icon: entry.icon ?? null,
    color: entry.color ?? null,
    category: entry.category ?? null,
    subcategory: entry.subcategory ?? null,
    difficulty: entry.difficulty ?? null,
    locked: Boolean(entry.locked),
    modules: stripComments(content?.modules),
  }
})

const values = rows.map((r) => `  (${[
  sqlString(r.id),
  sqlString(r.title),
  sqlString(r.description),
  sqlString(r.ai_instructions),
  sqlString(r.icon),
  sqlString(r.color),
  sqlString(r.category),
  sqlString(r.subcategory),
  sqlString(r.difficulty),
  r.locked,
  sqlJsonb(r.modules),
].join(', ')})`).join(',\n')

const sql = `-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 025 — semilla de public.courses (generado por
-- scripts/generate-course-seed.mjs a partir de courses.json + los 19
-- archivos de contenido de src/data/) — no editar a mano, regenerar
-- ════════════════════════════════════════════════════════════════════════

insert into public.courses
  (id, title, description, ai_instructions, icon, color, category, subcategory, difficulty, locked, modules)
values
${values}
on conflict (id) do nothing;
`

const outPath = path.join(__dirname, '..', 'supabase', 'migration_025.sql')
writeFileSync(outPath, sql, 'utf8')
console.log(`Wrote ${outPath} — ${rows.length} rows (${rows.filter((r) => r.modules.length > 0).length} with content).`)
