// Genera supabase/migration_079.sql: Academia de Linux — registra la academia,
// mueve course-bash y course-consola-basica a la categoría "Linux" e inserta
// los cursos "Historia de Linux" y "Termux". Corre una vez, no forma parte de la app.
// Uso: node scripts/build_linux_courses.mjs
import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { courseSql, splitConsoleModules } from './linux-courses/helpers.mjs'
import { historia } from './linux-courses/historia.mjs'
import { termux } from './linux-courses/termux.mjs'
import { instalacion } from './linux-courses/instalacion.mjs'

const courses = [historia, termux].map((c) => ({ ...c, modules: splitConsoleModules(c.modules) }))

const sql = `-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 079 — Academia de Linux
--   1. Registra la academia 'linux' (inscripción de alumnos / profesores).
--   2. Mueve "Bash desde Cero" y "Consola de Comandos" a la categoría Linux.
--   3. Inserta "Historia de Linux" (${courses[0].modules.length} clases) y "Termux: Linux en tu Bolsillo" (${courses[1].modules.length} clases),
--      cada una con consolas interactivas (GitTerminalSim.jsx).
-- Generado por scripts/build_linux_courses.mjs — idempotente (se puede correr dos veces).
-- ════════════════════════════════════════════════════════════════════════

insert into public.academies (id, name) values ('linux', 'Academia de Linux')
on conflict (id) do nothing;

update public.courses
   set category = 'Linux', subcategory = 'Terminal y Sistemas', updated_at = now()
 where id in ('course-bash', 'course-consola-basica');

${courses.map(courseSql).join('\n')}`

writeFileSync(path.join(process.cwd(), 'supabase', 'migration_079.sql'), sql)
for (const c of courses) console.log(`✓ ${c.id}: ${c.modules.length} módulos, ${c.modules.filter((m) => m.terminalSim).length} consolas`)
console.log('✓ supabase/migration_079.sql', Math.round(sql.length / 1024), 'KB')

// Migración 080: curso "Instala Linux" (aparte para no reabrir la 079 si ya se corrió).
const inst = { ...instalacion, modules: splitConsoleModules(instalacion.modules) }
const sql80 = `-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 080 — Curso "Instala Linux: Tu Primera Distro" (${inst.modules.length} clases)
-- Generado por scripts/build_linux_courses.mjs — idempotente.
-- ════════════════════════════════════════════════════════════════════════

${courseSql(inst)}`
writeFileSync(path.join(process.cwd(), 'supabase', 'migration_080.sql'), sql80)
console.log(`✓ ${inst.id}: ${inst.modules.length} módulos, ${inst.modules.filter((m) => m.terminalSim).length} consolas → supabase/migration_080.sql`)
