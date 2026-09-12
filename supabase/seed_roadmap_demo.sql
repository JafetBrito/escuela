-- Road map de ejemplo v2 (árbol jerárquico expandible) — reemplaza el
-- INSERT anterior (que usaba la forma plana v1, ya obsoleta). Pégalo en el
-- SQL Editor de Supabase y dale Run — como ya existe una fila con este id,
-- el ON CONFLICT la actualiza a la nueva forma en vez de duplicarla.
--
-- Sigue de cerca tu propio ejemplo: "Front-end" → Internet (con sus 6
-- subtemas, igual que roadmap.sh) → HTML → CSS → JavaScript → Git → un
-- framework → buenas prácticas. Los links de referencia van a Wikipedia/
-- MDN Web Docs (páginas reales y estables, nunca inventadas); donde existe
-- un curso real en tu catálogo (Git, React, Vue, POO, SOLID) el nodo
-- también enlaza ahí.
insert into public.roadmaps (id, title, description, icon, color, category, nodes, locked)
values (
  'roadmap-frontend',
  'Front-end',
  'De cómo funciona Internet a construir tus propias interfaces — el mapa completo, tema por tema.',
  '🖥️',
  '#38bdf8',
  'Programación',
  $$[
    {"id":"internet","title":"Internet","intro":"Antes de tocar código, entiende cómo funciona la red que hace posible la web.",
     "children":[
       {"id":"internet-how","title":"¿Cómo funciona Internet?","intro":"La red de redes: cómo viajan los datos de un dispositivo a otro.","resources":[{"label":"Internet — Wikipedia","url":"https://es.wikipedia.org/wiki/Internet"}]},
       {"id":"internet-http","title":"¿Qué es HTTP?","intro":"El protocolo que usan los navegadores para pedir y recibir páginas web.","resources":[{"label":"HTTP — MDN Web Docs","url":"https://developer.mozilla.org/es/docs/Web/HTTP/Overview"}]},
       {"id":"internet-domain","title":"¿Qué es un dominio?","intro":"El nombre legible que usamos en vez de una dirección IP.","resources":[{"label":"Nombre de dominio — Wikipedia","url":"https://es.wikipedia.org/wiki/Nombre_de_dominio"}]},
       {"id":"internet-hosting","title":"¿Qué es hosting?","intro":"Dónde vive tu página web para que cualquiera pueda visitarla.","resources":[{"label":"Alojamiento web — Wikipedia","url":"https://es.wikipedia.org/wiki/Alojamiento_web"}]},
       {"id":"internet-dns","title":"DNS y cómo funciona","intro":"El directorio que traduce dominios a direcciones IP.","resources":[{"label":"DNS — Wikipedia","url":"https://es.wikipedia.org/wiki/Sistema_de_nombres_de_dominio"}]},
       {"id":"internet-browsers","title":"Navegadores y cómo funcionan","intro":"El programa que interpreta HTML/CSS/JS y te muestra la página.","resources":[{"label":"Navegador web — Wikipedia","url":"https://es.wikipedia.org/wiki/Navegador_web"}]}
     ]},
    {"id":"html","title":"HTML","intro":"El esqueleto de toda página web — la estructura del contenido.","resources":[{"label":"HTML — MDN Web Docs","url":"https://developer.mozilla.org/es/docs/Web/HTML"}],
     "children":[
       {"id":"html-structure","title":"Estructura básica de un documento","intro":"Etiquetas, atributos y jerarquía — cómo se arma un documento HTML."},
       {"id":"html-semantic","title":"Elementos semánticos","intro":"header, nav, main, article, footer — etiquetas que describen el significado del contenido, no solo su apariencia."},
       {"id":"html-forms","title":"Formularios","intro":"Cómo recibir información del usuario: inputs, selects y validación básica."},
       {"id":"html-a11y","title":"Accesibilidad básica","intro":"Que tu página funcione para todos, incluida la gente que usa lector de pantalla."}
     ]},
    {"id":"css","title":"CSS","intro":"Cómo se ve una página web — color, tipografía, espaciado y layout.","resources":[{"label":"CSS — MDN Web Docs","url":"https://developer.mozilla.org/es/docs/Web/CSS"}],
     "children":[
       {"id":"css-selectors","title":"Selectores y especificidad","intro":"Cómo CSS decide qué regla aplica cuando varias compiten por el mismo elemento."},
       {"id":"css-boxmodel","title":"Box model","intro":"Margin, border, padding, content — cómo se calcula el tamaño real de cada elemento."},
       {"id":"css-flexbox","title":"Flexbox","intro":"El sistema de layout de una dimensión — ideal para filas y columnas simples.","resources":[{"label":"Flexbox — MDN Web Docs","url":"https://developer.mozilla.org/es/docs/Web/CSS/CSS_flexible_box_layout"}]},
       {"id":"css-grid","title":"Grid","intro":"El sistema de layout de dos dimensiones — ideal para diseños de página completos.","resources":[{"label":"CSS Grid — MDN Web Docs","url":"https://developer.mozilla.org/es/docs/Web/CSS/CSS_grid_layout"}]},
       {"id":"css-responsive","title":"Diseño responsive","intro":"Media queries — que tu página se vea bien en celular, tablet y escritorio.","resources":[{"label":"Media queries — MDN Web Docs","url":"https://developer.mozilla.org/es/docs/Web/CSS/CSS_media_queries"}]}
     ]},
    {"id":"javascript","title":"JavaScript","intro":"El lenguaje que le da interactividad a la web.","resources":[{"label":"JavaScript — MDN Web Docs","url":"https://developer.mozilla.org/es/docs/Web/JavaScript"}],
     "children":[
       {"id":"js-basics","title":"Sintaxis básica y tipos de datos","intro":"Variables, funciones, condicionales y ciclos — lo esencial para empezar."},
       {"id":"js-dom","title":"DOM y eventos","intro":"Cómo JavaScript lee y modifica la página, y reacciona a clics/teclas/formularios.","resources":[{"label":"DOM — MDN Web Docs","url":"https://developer.mozilla.org/es/docs/Web/API/Document_Object_Model"}]},
       {"id":"js-fetch","title":"Fetch y APIs","intro":"Cómo pedirle datos a un servidor sin recargar la página.","resources":[{"label":"Fetch API — MDN Web Docs","url":"https://developer.mozilla.org/es/docs/Web/API/Fetch_API"}]},
       {"id":"js-modern","title":"ES6+: arrow functions, destructuring, async/await","intro":"La sintaxis moderna de JavaScript que vas a ver en casi todo código actual."}
     ]},
    {"id":"git","title":"Control de versiones: Git","intro":"Guarda el historial de tu código y te permite colaborar sin pisarte con nadie.","linkType":"course","linkId":"course-git-github"},
    {"id":"framework","title":"Un framework de frontend","intro":"React y Vue son las dos opciones más comunes hoy — con cualquiera puedes construir aplicaciones reales.",
     "children":[
       {"id":"framework-react","title":"React","intro":"La librería con la que está construida esta misma plataforma.","linkType":"course","linkId":"course-react"},
       {"id":"framework-vue","title":"Vue","intro":"El otro gran framework de interfaces reactivas.","linkType":"course","linkId":"course-vue"}
     ]},
    {"id":"practices","title":"Buenas prácticas","intro":"Código que no solo funciona, sino que es fácil de mantener y extender.",
     "children":[
       {"id":"practices-poo","title":"Programación Orientada a Objetos","linkType":"course","linkId":"course-poo"},
       {"id":"practices-solid","title":"Principios SOLID","linkType":"course","linkId":"course-solid"}
     ]}
  ]$$::jsonb,
  false
)
on conflict (id) do update set
  title = excluded.title, description = excluded.description, icon = excluded.icon,
  color = excluded.color, category = excluded.category, nodes = excluded.nodes,
  locked = excluded.locked, updated_at = now();

-- El road map v1 ("Ruta: Programador desde Cero") queda con la forma
-- plana vieja — ya no la muestra bien el visor nuevo (no tiene `intro`/
-- `resources`/`children`). Bórrala si ya no la quieres:
-- delete from public.roadmaps where id = 'roadmap-programador-desde-cero';
