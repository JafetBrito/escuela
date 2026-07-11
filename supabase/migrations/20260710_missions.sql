-- ─────────────────────────────────────────────────────────────────────────
-- missions: catálogo central de misiones. Cada fila es una misión completa.
-- check_type + check_value reemplazan las funciones JS anteriores — el
-- front-end evalúa via evaluateMission() en globalMissionsRegistry.js.
-- Tipos de check disponibles: chat_count, completed_modules, has_active_item,
-- purchased_count, books_opened, skin_changed, level, course_modules_completed.
-- Para un nuevo tipo: agregar un case en evaluateMission() (1 línea de código).
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.missions (
  id           text primary key,
  npc_name     text,
  npc_icon     text,
  icon         text    not null default '📋',
  title        text    not null,
  description  text    not null default '',
  reward       integer not null default 0,
  xp_reward    integer not null default 0,
  category     text,
  check_type   text    not null,
  check_value  integer,
  course_id    text,   -- requerido si check_type = 'course_modules_completed'
  sort_order   integer not null default 0,
  active       boolean not null default true
);

comment on table public.missions is
  'Catálogo de misiones. Agregar una fila = agregar una misión sin tocar código.';

-- Todos pueden leer misiones activas.
alter table public.missions enable row level security;

drop policy if exists "missions: select active (authenticated)" on public.missions;
create policy "missions: select active (authenticated)" on public.missions
  for select using (auth.role() = 'authenticated' and active = true);

-- Solo admins pueden modificar.
drop policy if exists "missions: admin write" on public.missions;
create policy "missions: admin write" on public.missions
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ─────────────────────────────────────────────────────────────────────────
-- user_missions: progreso del usuario por misión.
-- state: 'available' | 'accepted' | 'claimed'
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.user_missions (
  user_id     uuid  not null references public.profiles (id) on delete cascade,
  mission_id  text  not null references public.missions (id) on delete cascade,
  state       text  not null default 'available'
                    check (state in ('available', 'accepted', 'claimed')),
  accepted_at timestamptz,
  claimed_at  timestamptz,
  primary key (user_id, mission_id)
);

alter table public.user_missions enable row level security;

drop policy if exists "user_missions: own rows" on public.user_missions;
create policy "user_missions: own rows" on public.user_missions
  for all using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Seed: misiones globales actuales (espejo de globalMissionsRegistry.js).
-- Cuando se active la tabla, comentar las líneas del registry JS y
-- reemplazar GLOBAL_MISSIONS con un fetch desde esta tabla.
-- ─────────────────────────────────────────────────────────────────────────
insert into public.missions (id, npc_name, npc_icon, icon, title, description, reward, xp_reward, category, check_type, check_value, sort_order) values
  ('habla-con-mascota',    'Oliver',              '🐱',   '💬', 'Rompe el hielo',        'Habla con tu mascota al menos una vez para activar su IA.', 1000, 30,  'Social',          'chat_count',          1, 10),
  ('completa-una-clase',   'Maestro de Misiones', '🧙',   '📘', 'Primer paso',           'Completa tu primera clase de cualquier curso disponible.',  2000, 50,  'Academia',        'completed_modules',   1, 20),
  ('activa-objeto',        'Jafet',               '🧑‍💻', '🎒', 'Usa tu equipo',         'Activa cualquier objeto interactivo de tu inventario.',     1000, 30,  'Exploración',     'has_active_item',  null, 30),
  ('compra-tienda',        'Maestro de Misiones', '🧙',   '🛒', 'De compras',            'Compra al menos un objeto en la Tienda del campus.',        1500, 40,  'Exploración',     'purchased_count',     1, 40),
  ('lee-libro',            'Oliver',              '🐱',   '📖', 'Ratón de biblioteca',   'Abre un libro desde la Biblioteca del campus.',             1500, 40,  'Academia',        'books_opened',        1, 50),
  ('cambia-apariencia',    'Jafet',               '🧑‍💻', '🎨', 'Nuevo look',            'Cambia el skin o atuendo de tu mascota Oliver.',            1000, 30,  'Personalización', 'skin_changed',     null, 60),
  ('completa-cinco-clases','Maestro de Misiones', '🧙',   '🏆', 'En racha',              'Completa 5 clases en cualquier combinación de cursos.',     5000, 120, 'Academia',        'completed_modules',   5, 70),
  ('sube-nivel-5',         'Oliver',              '🐱',   '⭐', 'Aprendiz consolidado',  'Alcanza el nivel 5 de experiencia en la plataforma.',       3000, 0,   'Progresión',      'level',               5, 80)
on conflict (id) do nothing;
