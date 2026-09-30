// Genera supabase/migration_083.sql: tercera ronda — OpenClaw, Paperclip,
// Fundamentos del Código Abierto (reemplaza el placeholder), Historia de los
// Agentes de IA Autónomos, Crea tu Primera App con IA, Automatización con
// Python e IA. Aparte de 081/082 para no reabrirlas si ya se corrieron.
// Uso: node scripts/build_ai_courses3.mjs
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { courseSql, splitConsoleModules } from './linux-courses/helpers.mjs'
import { openclaw } from './ai-courses/openclaw.mjs'
import { paperclip } from './ai-courses/paperclip.mjs'
import { fuentesAbiertas } from './ai-courses/fuentes-abiertas.mjs'
import { historiaAgentes } from './ai-courses/historia-agentes.mjs'
import { creaAppIa } from './ai-courses/crea-app-ia.mjs'
import { automatizacionPythonIa } from './ai-courses/automatizacion-python-ia.mjs'

const courses = [openclaw, paperclip, fuentesAbiertas, historiaAgentes, creaAppIa, automatizacionPythonIa]
  .map((c) => ({ ...c, modules: splitConsoleModules(c.modules) }))

const sql = `-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 083 — OpenClaw, Paperclip y automatización con IA
${courses.map((c) => `--   • ${c.title} (${c.id}) — ${c.modules.length} clases`).join('\n')}
-- course-open-claw y course-fuentes-abiertas ya existían (placeholders
-- locked, sin módulos): esta migración los actualiza con contenido real.
-- Generado por scripts/build_ai_courses3.mjs — idempotente (se puede correr dos veces).
-- ════════════════════════════════════════════════════════════════════════

${courses.map(courseSql).join('\n')}`

writeFileSync(path.join(process.cwd(), 'supabase', 'migration_083.sql'), sql)
for (const c of courses) console.log(`✓ ${c.id}: ${c.modules.length} módulos`)
console.log('✓ supabase/migration_083.sql', Math.round(sql.length / 1024), 'KB')
