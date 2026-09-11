-- Road map de ejemplo, con bastante contenido para ver cómo se ve el
-- diagrama lleno — 14 nodos reales: 12 enlazan a cursos que ya existen en
-- el catálogo, 1 enlaza al tutorial que ya creamos, y 1 es un nodo de
-- práctica sin enlace (para mostrar que no todos los nodos necesitan uno).
-- Pégalo en el SQL Editor de Supabase y dale Run.
insert into public.roadmaps (id, title, description, icon, color, category, nodes, locked)
values (
  'roadmap-programador-desde-cero',
  'Ruta: Programador desde Cero',
  'Del primer "hola mundo" a construir tus propios proyectos — la ruta completa, curso por curso.',
  '💻',
  '#fb923c',
  'Programación',
  $$[
    {"id":"node-1","title":"¿Qué es programar?","description":"Compilados vs. interpretados, tipado, paradigmas y niveles de abstracción — cómo elegir por dónde empezar.","linkType":"course","linkId":"course-lenguajes-programacion"},
    {"id":"node-2","title":"Fundamentos: variables, control de flujo y funciones","description":"La base que necesitas antes de aprender cualquier lenguaje — piensa como programador.","linkType":"course","linkId":"course-009"},
    {"id":"node-3","title":"La terminal: tus primeros comandos","description":"Pierde el miedo a la consola — la herramienta que vas a usar todos los días.","linkType":"course","linkId":"course-consola-basica"},
    {"id":"node-4","title":"Bash desde cero","description":"Navegación, archivos, pipes, grep, permisos y scripts — domina la terminal de Linux/Mac.","linkType":"course","linkId":"course-bash"},
    {"id":"node-5","title":"Control de versiones con Git y GitHub","description":"Desde por qué existe Git hasta rebase, colaboración en equipo y automatización.","linkType":"course","linkId":"course-git-github"},
    {"id":"node-6","title":"Programación Orientada a Objetos","description":"Clases, objetos, encapsulamiento, herencia y polimorfismo.","linkType":"course","linkId":"course-poo"},
    {"id":"node-7","title":"Paradigmas de la programación","description":"Imperativo, POO, funcional y más — por qué existen distintos estilos de escribir código.","linkType":"course","linkId":"course-paradigmas-programacion"},
    {"id":"node-8","title":"Principios SOLID","description":"Los cinco principios que hacen que el código sea más fácil de mantener y extender.","linkType":"course","linkId":"course-solid"},
    {"id":"node-9","title":"Bases de datos: SQL y NoSQL","description":"Cómo se organiza la información, SQL básico, relaciones entre tablas.","linkType":"course","linkId":"course-bases-datos"},
    {"id":"node-10","title":"APIs con Python: tu primer bot","description":"De cero a un bot de Telegram funcionando — HTTP, JSON, requests y claves seguras.","linkType":"course","linkId":"course-apis-python-telegram-bot"},
    {"id":"node-11","title":"Un framework de frontend: React","description":"Componentes, props, estado y efectos — la librería con la que está construida esta misma plataforma.","linkType":"course","linkId":"course-react"},
    {"id":"node-12","title":"Bonus: cómo llegamos hasta aquí","description":"Un recorrido desde Ada Lovelace hasta la IA generativa de hoy.","linkType":"course","linkId":"course-historia-programacion"},
    {"id":"node-13","title":"Genera tu propio curso con IA","description":"Usa el Oráculo para crear contenido nuevo sobre cualquier tema que te interese.","linkType":"tutorial","linkId":"tutorial-oraculo"},
    {"id":"node-14","title":"Practica con proyectos propios","description":"Ningún roadmap reemplaza construir algo tuyo — elige una idea pequeña y termínala.","linkType":null}
  ]$$::jsonb,
  false
)
on conflict (id) do update set
  title = excluded.title, description = excluded.description, icon = excluded.icon,
  color = excluded.color, category = excluded.category, nodes = excluded.nodes,
  locked = excluded.locked, updated_at = now();
