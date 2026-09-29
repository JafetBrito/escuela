// Genera supabase/migration_082.sql: segunda ronda de la Academia de IA —
// Gemini, el Gran Repositorio de Prompts, y Fundamentos de Machine Learning.
// Aparte de migration_081 para no reabrirla si ya se corrió.
// Uso: node scripts/build_ai_courses2.mjs
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { courseSql, splitConsoleModules } from './linux-courses/helpers.mjs'
import { gemini } from './ai-courses/gemini.mjs'
import { prompts } from './ai-courses/prompts.mjs'
import { mlFundamentos } from './ai-courses/ml-fundamentos.mjs'

const courses = [gemini, prompts, mlFundamentos].map((c) => ({ ...c, modules: splitConsoleModules(c.modules) }))

const sql = `-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 082 — Academia de IA, segunda ronda de refresh
${courses.map((c) => `--   • ${c.title} (${c.id}) — ${c.modules.length} clases`).join('\n')}
-- Generado por scripts/build_ai_courses2.mjs — idempotente (se puede correr dos veces).
-- ════════════════════════════════════════════════════════════════════════

${courses.map(courseSql).join('\n')}`

writeFileSync(path.join(process.cwd(), 'supabase', 'migration_082.sql'), sql)
for (const c of courses) console.log(`✓ ${c.id}: ${c.modules.length} módulos`)
console.log('✓ supabase/migration_082.sql', Math.round(sql.length / 1024), 'KB')
