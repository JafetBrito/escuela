// Genera supabase/migration_084.sql: la tabla `item_templates` (la base de datos de objetos en Supabase) + sus políticas RLS
// + la semilla con TODOS los objetos actuales. Cualquiera la lee; solo un admin escribe. La semilla usa
// "on conflict do nothing": si un admin ya editó un objeto en la base, volver a correr el script NO pisa su edición.
// Uso: node scripts/items/make-migration.mjs   y luego pega supabase/migration_084.sql en el SQL Editor de Supabase.
import { buildSync } from 'esbuild'
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const tmp = mkdtempSync(join(tmpdir(), 'items-'))
buildSync({ entryPoints: [join(root, 'src/data/itemDb/raw.js')], bundle: true, platform: 'node', format: 'esm', outfile: join(tmp, 'raw.mjs'), logLevel: 'error' })
const { rawItems } = await import(pathToFileURL(join(tmp, 'raw.mjs')).href)
const ids = JSON.parse(readFileSync(join(root, 'src/data/itemDb/ids.json'), 'utf8'))

const rows = rawItems().map((it) => {
  const { key, ...data } = it
  return { entry: ids[key], key, data }
}).sort((a, b) => a.entry - b.entry)
if (rows.some((r) => r.entry == null)) throw new Error('hay objetos sin entry: corre node scripts/items/sync-ids.mjs primero')

const values = rows.map((r) => `  (${r.entry}, '${r.key.replace(/'/g, "''")}', $j$${JSON.stringify(r.data)}$j$::jsonb)`).join(',\n')
const sql = `-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 084 — Base de datos de objetos (item_templates), estilo WoW
--   • Una fila por objeto: entry numérico estable, key legible y data (jsonb con todos los campos).
--   • Lectura para todos; escritura solo admin (public.is_admin()).
--   • Semilla con los ${rows.length} objetos actuales (on conflict do nothing: no pisa ediciones de un admin).
-- Generado por scripts/items/make-migration.mjs — idempotente (se puede correr dos veces).
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.item_templates (
  entry      integer primary key,
  key        text not null unique,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.item_templates enable row level security;

drop policy if exists "item_templates: read all" on public.item_templates;
create policy "item_templates: read all" on public.item_templates
  for select using (true);

drop policy if exists "item_templates: admin write" on public.item_templates;
create policy "item_templates: admin write" on public.item_templates
  for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.item_templates_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  new.updated_by = auth.uid();
  return new;
end;
$$;

drop trigger if exists item_templates_touch on public.item_templates;
create trigger item_templates_touch before insert or update on public.item_templates
  for each row execute function public.item_templates_touch();

insert into public.item_templates (entry, key, data) values
${values}
on conflict (entry) do nothing;
`
writeFileSync(join(root, 'supabase/migration_084.sql'), sql)
rmSync(tmp, { recursive: true, force: true })
console.log(`supabase/migration_084.sql: ${rows.length} objetos`)
