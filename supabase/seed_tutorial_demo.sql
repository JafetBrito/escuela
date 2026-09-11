-- Tutorial de prueba — pégalo en el SQL Editor de Supabase (mismo lugar
-- donde corriste migration_063.sql) y dale Run. Aparece de inmediato en
-- /tutoriales, sin recargar nada más que esa página.
insert into public.tutorials (id, title, description, icon, color, category, content, locked)
values (
  'tutorial-oraculo',
  'Cómo generar un curso con el Oráculo',
  'Guía rápida para usar la IA del Oráculo y crear tu propio curso completo en minutos.',
  '🔮',
  '#7c3aed',
  'Guías de la plataforma',
  $$
<h2>¿Qué es el Oráculo?</h2>
<p>El Oráculo es la herramienta de IA de Oliver Academy que arma un curso completo por ti: temario, clases con contenido real, imágenes, recursos y un quiz por clase — listo para jugar como cualquier otro curso.</p>

<h2>Antes de empezar</h2>
<p>Necesitas tener una conexión de IA activa. Ve a <strong>Ajustes → Núcleo</strong> y conecta tu proveedor de IA (OpenAI, Anthropic, Gemini, o cualquier otro compatible) con tu propia llave.</p>

<h2>Pasos</h2>
<ol>
  <li>Entra a <strong>Oráculo</strong> desde el menú de Academia.</li>
  <li>Escribe cualquier tema que quieras aprender — desde "Fotografía de retrato" hasta "Historia del jazz".</li>
  <li>Elige la dificultad, el idioma, el público objetivo (opcional) y cuántas clases quieres.</li>
  <li>Dale a generar y espera — verás el progreso real: primero planea el temario, luego escribe cada clase una por una.</li>
  <li>Cuando termine, tu curso queda guardado y puedes empezarlo de inmediato desde "Continuar".</li>
</ol>

<h2>¿Quieres compartirlo?</h2>
<p>Desde la pestaña "Mis Cursos" del Oráculo puedes pedir revisión — si un admin lo aprueba, aparece en la pestaña "Comunidad" para que cualquier alumno lo juegue.</p>
$$,
  false
)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  icon = excluded.icon,
  color = excluded.color,
  category = excluded.category,
  content = excluded.content,
  locked = excluded.locked,
  updated_at = now();
