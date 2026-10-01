// Genera supabase/migration_082.sql: segunda ronda de la Academia de IA —
// Gemini y Fundamentos de Machine Learning.
// Aparte de migration_081 para no reabrirla si ya se corrió.
// NOTA: "El Gran Repositorio de Prompts" (ai-courses/prompts.mjs) se dio de
// baja como curso a pedido del usuario — no quería un curso con quizzes,
// quería un recurso de consulta. Su contenido ahora vive como datos simples
// en src/data/promptLibrary.js, mostrado en /herramientas (pestaña
// "Prompts") con botón de copiar — ver ToolsPage.jsx. Este script borra la
// fila vieja de Supabase si alguien llegó a correr una versión anterior de
// esta migración que la insertaba.
// Uso: node scripts/build_ai_courses2.mjs
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { courseSql, splitConsoleModules } from './linux-courses/helpers.mjs'
import { gemini } from './ai-courses/gemini.mjs'
import { mlFundamentos } from './ai-courses/ml-fundamentos.mjs'

const courses = [gemini, mlFundamentos].map((c) => ({ ...c, modules: splitConsoleModules(c.modules) }))

const sql = `-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 082 — Academia de IA, segunda ronda de refresh
${courses.map((c) => `--   • ${c.title} (${c.id}) — ${c.modules.length} clases`).join('\n')}
-- "El Gran Repositorio de Prompts" ya NO es un curso (ver nota arriba) —
-- esta línea limpia la fila si una corrida anterior la llegó a insertar.
-- Generado por scripts/build_ai_courses2.mjs — idempotente (se puede correr dos veces).
-- ════════════════════════════════════════════════════════════════════════

delete from public.courses where id = 'course-repositorio-prompts';

${courses.map(courseSql).join('\n')}`

writeFileSync(path.join(process.cwd(), 'supabase', 'migration_082.sql'), sql)
for (const c of courses) console.log(`✓ ${c.id}: ${c.modules.length} módulos`)
console.log('✓ supabase/migration_082.sql', Math.round(sql.length / 1024), 'KB')
