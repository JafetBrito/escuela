// Genera supabase/check_migrations.sql: pega el resultado en el SQL Editor de Supabase
// y te dice, migración por migración, qué tablas/columnas/funciones esperadas NO existen.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
const dir = 'supabase'
const files = readdirSync(dir).filter((f) => /^migration_\d+\.sql$/.test(f)).sort()
const rows = []
for (const f of files) {
  const n = f.match(/\d+/)[0]
  const sql = readFileSync(`${dir}/${f}`, 'utf8').replace(/--.*$/gm, '')
  const seen = new Set()
  const add = (kind, a, b = '') => { const k = `${kind}|${a}|${b}`; if (!seen.has(k)) { seen.add(k); rows.push([n, kind, a, b]) } }
  for (const m of sql.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?"?(\w+)"?/gi)) add('table', m[1])
  for (const m of sql.matchAll(/alter\s+table\s+(?:if\s+exists\s+)?(?:only\s+)?(?:public\.)?"?(\w+)"?([^;]*);/gi))
    for (const c of m[2].matchAll(/add\s+column\s+(?:if\s+not\s+exists\s+)?"?(\w+)"?/gi)) add('column', m[1], c[1])
  for (const m of sql.matchAll(/create\s+(?:or\s+replace\s+)?function\s+(?:public\.)?"?(\w+)"?\s*\(/gi)) add('function', m[1])
}
const values = rows.map(([n, k, a, b]) => `('${n}','${k}','${a}','${b}')`).join(',\n  ')
const out = `-- Generado por scripts/gen-migration-check.mjs — pega completo en el SQL Editor y dale Run.
-- Muestra SOLO lo que falta. Si una migración aparece aquí, corre su archivo migration_NNN.sql.
with expected(mig, kind, a, b) as (values
  ${values}
), missing as (
  select * from expected e where not (
    (kind = 'table'    and exists (select 1 from information_schema.tables  where table_schema = 'public' and table_name = e.a)) or
    (kind = 'column'   and exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = e.a and column_name = e.b)) or
    (kind = 'function' and exists (select 1 from pg_proc p join pg_namespace s on s.oid = p.pronamespace where s.nspname = 'public' and p.proname = e.a))
  )
)
select mig as migracion, count(*) as faltan, string_agg(kind || ' ' || a || case when b <> '' then '.' || b else '' end, ', ' order by kind, a) as detalle
from missing group by mig order by mig;
`
writeFileSync(`${dir}/check_migrations.sql`, out)
console.log(`${files.length} migraciones, ${rows.length} objetos a verificar → supabase/check_migrations.sql`)
