// Genera supabase/migration_081.sql: refresh de la Academia de IA — 7 cursos
// nuevos (historia, trucos, modelos, actualidad, Claude, generativa, ética).
// Corre una vez, no forma parte de la app. Uso: node scripts/build_ai_courses.mjs
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { courseSql, splitConsoleModules } from './linux-courses/helpers.mjs'
import { historia } from './ai-courses/historia.mjs'
import { trucos } from './ai-courses/trucos.mjs'
import { modelos } from './ai-courses/modelos.mjs'
import { actualidad } from './ai-courses/actualidad.mjs'
import { claude } from './ai-courses/claude.mjs'
import { generativa } from './ai-courses/generativa.mjs'
import { etica } from './ai-courses/etica.mjs'

const courses = [historia, trucos, modelos, actualidad, claude, generativa, etica]
  .map((c) => ({ ...c, modules: splitConsoleModules(c.modules) }))

const sql = `-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 081 — Refresh de la Academia de IA: 7 cursos nuevos
${courses.map((c) => `--   • ${c.title} (${c.id}) — ${c.modules.length} clases`).join('\n')}
-- Generado por scripts/build_ai_courses.mjs — idempotente (se puede correr dos veces).
-- ════════════════════════════════════════════════════════════════════════

${courses.map(courseSql).join('\n')}`

writeFileSync(path.join(process.cwd(), 'supabase', 'migration_081.sql'), sql)
for (const c of courses) console.log(`✓ ${c.id}: ${c.modules.length} módulos`)
console.log('✓ supabase/migration_081.sql', Math.round(sql.length / 1024), 'KB')
