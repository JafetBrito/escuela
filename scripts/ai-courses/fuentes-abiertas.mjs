// Curso "Fundamentos del Código Abierto: Cómo Explorar y Contribuir a un
// Proyecto Real". Reemplaza el contenido del placeholder locked
// course-fuentes-abiertas (mismo id) con contenido real.
import { quiz, text } from '../linux-courses/helpers.mjs'

export const fuentesAbiertas = {
  id: 'course-fuentes-abiertas',
  title: 'Fundamentos del Código Abierto',
  description: 'Las reglas generales que aplican a CUALQUIER proyecto de código abierto: qué es realmente, cómo leer un repositorio que nunca has visto, licencias explicadas sin jerga legal, el flujo de contribución con Pull Requests, y cómo se sostiene (o no) un proyecto del que depende medio internet. Con OpenClaw y Paperclip como ejemplos reales a lo largo del curso.',
  ai_instructions: 'Eres el Mago, profesor de la Escuela de Programación de Oliver Academy, guiando el curso "Fundamentos del Código Abierto". Explica conceptos legales de licencias con precisión pero sin jerga, y siempre aclara que no eres un abogado — para decisiones legales importantes sobre licenciamiento, recomienda consultar una fuente especializada o un profesional. Anima al alumno a mirar repositorios reales mientras aprende, no solo a leer teoría.',
  icon: '📖',
  color: '#84cc16',
  category: 'Programación',
  subcategory: 'Código Abierto',
  difficulty: 'principiante',
  locked: false,
  modules: [
    text('Bienvenida: las reglas que aplican a cualquier proyecto',
      'Un curso de fundamentos generales, no de un proyecto específico.',
      `
<h2>Por qué este curso es distinto a "OpenClaw" y "Paperclip"</h2>
<p>Los cursos <em>OpenClaw</em> y <em>Paperclip</em> de esta escuela te enseñaron dos proyectos específicos, de principio a fin. Este curso da un paso atrás: las reglas, hábitos y conceptos que aplican a <strong>cualquier</strong> proyecto de código abierto que encuentres — para que sepas moverte con confianza en un repositorio que jamás has visto, sea cual sea.</p>

<h2>El mapa del curso</h2>
<table>
<tr><th>Parte</th><th>Qué vas a aprender</th></tr>
<tr><td>1. Qué es realmente el código abierto</td><td>Más allá de "el código es público".</td></tr>
<tr><td>2. Licencias, sin jerga legal</td><td>Qué puedes y no puedes hacer con el código de otros.</td></tr>
<tr><td>3. Leer un repositorio desconocido</td><td>Un método para orientarte en minutos, no horas.</td></tr>
<tr><td>4. El flujo de contribución</td><td>De un fork a un Pull Request aceptado.</td></tr>
<tr><td>5. Sostenibilidad y comunidad</td><td>Cómo (y por qué a veces no) se sostiene un proyecto del que depende medio internet.</td></tr>
</table>

<div class="tip">
💡 A lo largo del curso vamos a usar <strong>OpenClaw</strong> y <strong>Paperclip</strong> (los proyectos de los dos cursos anteriores) como ejemplos reales y concretos — si ya los tomaste, vas a reconocer varios de sus detalles aquí, ahora vistos desde la perspectiva de las reglas generales.
</div>
`,
      quiz('¿En qué se diferencia este curso de "OpenClaw" y "Paperclip"?',
        ['Es exactamente el mismo contenido repetido', 'Este curso enseña las reglas y hábitos GENERALES que aplican a cualquier proyecto de código abierto, no la arquitectura específica de un solo proyecto', 'Este curso no tiene ninguna relación con código abierto', 'Solo sirve para proyectos escritos en un lenguaje específico'], 1)),

    text('Qué es realmente el código abierto',
      'Más allá de "puedo ver el código" — las cuatro libertades, otra vez, aplicadas.',
      `
<h2>Código público no es lo mismo que código abierto</h2>
<p>Que puedas <strong>ver</strong> el código de un proyecto no significa automáticamente que sea código abierto en el sentido completo. Como viste en <em>Historia de Linux</em>, el software libre y el código abierto se definen por <strong>libertades</strong> concretas: poder ejecutarlo, estudiarlo, modificarlo y redistribuirlo — no solo mirarlo.</p>

<h2>La definición práctica de la Open Source Initiative</h2>
<p>La <strong>Open Source Initiative (OSI)</strong>, que viste también en <em>Historia de Linux</em>, mantiene una definición formal de qué licencias califican como "código abierto" de verdad. En la práctica, para que un proyecto sea código abierto necesita:</p>
<table>
<tr><th>Requisito</th><th>En otras palabras</th></tr>
<tr><td>Código fuente disponible</td><td>No solo el programa compilado, sino el código que un humano puede leer.</td></tr>
<tr><td>Redistribución libre</td><td>Puedes compartir copias, incluso comercialmente.</td></tr>
<tr><td>Permite obras derivadas</td><td>Puedes modificarlo y distribuir tu versión modificada.</td></tr>
<tr><td>Sin discriminación</td><td>No puede prohibir el uso a ciertas personas, grupos o campos de aplicación.</td></tr>
</table>

<h2>Código abierto no siempre significa "sin dueño"</h2>
<p>Un proyecto de código abierto puede tener una empresa detrás (como Paperclip Labs, Inc. con Paperclip), una fundación sin fines de lucro (como la OpenClaw Foundation), o ser mantenido por voluntarios individuales sin ninguna organización formal. "Código abierto" describe la <strong>licencia</strong> del código, no quién lo financia ni quién toma las decisiones del proyecto.</p>

<h2>"Disponible en GitHub" no es una licencia</h2>
<div class="warn">
⚠️ Que un repositorio esté público en GitHub no significa automáticamente que tengas permiso legal de usarlo, copiarlo o modificarlo — necesitas revisar su <strong>licencia</strong> explícita (normalmente un archivo <code>LICENSE</code> en la raíz del repositorio). Sin una licencia clara, la ley por defecto protege al autor y tú, técnicamente, no tienes permisos automáticos — el siguiente módulo profundiza en esto.
</div>
`,
      quiz('¿Por qué "puedo ver el código en GitHub" no es lo mismo que "es código abierto"?',
        ['Es exactamente lo mismo, no hay diferencia', 'Ver el código no te da automáticamente permiso legal de usarlo, copiarlo o modificarlo — eso depende de la licencia explícita del proyecto', 'GitHub solo aloja proyectos de código cerrado', 'El código abierto nunca se sube a GitHub'], 1)),

    text('Licencias, sin jerga legal',
      'Copyleft vs. permisivas, y cómo identificar cuál tiene un proyecto en segundos.',
      `
<h2>Repaso rápido: las dos grandes familias</h2>
<p>Como viste en <em>Historia de Linux</em>, las licencias de código abierto se dividen, a grandes rasgos, en dos familias:</p>
<table>
<tr><th>Familia</th><th>Ejemplos</th><th>Idea central</th></tr>
<tr><td><strong>Copyleft</strong></td><td>GPL, AGPL, LGPL</td><td>Si distribuyes una versión modificada, debe seguir siendo de código abierto, bajo la misma licencia.</td></tr>
<tr><td><strong>Permisivas</strong></td><td>MIT, Apache 2.0, BSD</td><td>Puedes hacer casi lo que quieras, incluso cerrar el código en un producto comercial — solo debes conservar el aviso de autoría.</td></tr>
</table>

<h2>Ejemplos reales que ya conoces</h2>
<table>
<tr><th>Proyecto</th><th>Licencia</th><th>Qué significa en la práctica</th></tr>
<tr><td>Paperclip</td><td>MIT</td><td>Puedes usarlo, modificarlo, e incluso venderlo como parte de otro producto, siempre que conserves el aviso de licencia original.</td></tr>
<tr><td>Linux (el kernel)</td><td>GPL v2</td><td>Cualquier dispositivo que lo distribuya con modificaciones debe ofrecer el código fuente de esas modificaciones.</td></tr>
</table>

<h2>Cómo identificar la licencia de un proyecto en segundos</h2>
<ol>
<li>Busca un archivo llamado <code>LICENSE</code> o <code>LICENSE.md</code> en la raíz del repositorio.</li>
<li>Si no está, revisa el archivo <code>README</code> — muchos proyectos mencionan su licencia ahí.</li>
<li>En GitHub, la barra lateral derecha de cualquier repositorio suele mostrar la licencia detectada automáticamente.</li>
<li>Si de verdad no encuentras ninguna licencia, <strong>asume que no tienes permisos automáticos</strong> de uso o redistribución — escríbele al autor si necesitas usarlo formalmente.</li>
</ol>

<h2>Preguntas prácticas antes de usar código de otros</h2>
<table>
<tr><th>Pregunta</th><th>Por qué importa</th></tr>
<tr><td>¿Voy a usarlo en un producto comercial?</td><td>Algunas licencias tienen condiciones distintas para uso comercial.</td></tr>
<tr><td>¿Voy a modificarlo y redistribuirlo?</td><td>Una licencia copyleft te obligaría a mantener esa misma licencia en tu versión.</td></tr>
<tr><td>¿Necesito conservar avisos de autoría?</td><td>Casi todas las licencias, incluso las permisivas, lo exigen.</td></tr>
</table>

<div class="warn">
⚠️ No soy abogado, y este curso tampoco lo es: para decisiones legales importantes sobre licenciamiento (especialmente en un producto comercial), consulta con un profesional o usa herramientas especializadas como choosealicense.com como punto de partida, no como consejo legal definitivo.
</div>
`,
      quiz('¿Cuál es la diferencia central entre una licencia copyleft (como GPL) y una permisiva (como MIT)?',
        ['No hay ninguna diferencia real entre ellas', 'La copyleft exige que las versiones modificadas distribuidas sigan siendo de código abierto; la permisiva permite incluso cerrar el código, solo exigiendo conservar el aviso de autoría', 'Las permisivas nunca se pueden usar comercialmente', 'La copyleft prohíbe totalmente modificar el código'], 1)),

    text('Cómo leer un repositorio que nunca has visto',
      'Un método de cinco minutos para orientarte en cualquier proyecto nuevo.',
      `
<h2>El problema: llegar a un repositorio y no saber por dónde empezar</h2>
<p>Abrir el repositorio de un proyecto grande por primera vez puede ser abrumador — cientos de archivos, carpetas con nombres que no conoces. Este método te da un orden de exploración que funciona con casi cualquier proyecto.</p>

<h2>El método de cinco pasos</h2>
<ol>
<li><strong>Lee el README primero, completo.</strong> Casi siempre explica qué hace el proyecto, cómo instalarlo, y a veces cómo está organizado.</li>
<li><strong>Mira la estructura de carpetas de nivel superior</strong>, sin entrar todavía a ninguna. Los nombres ya te dicen mucho: <code>docs</code> (documentación), <code>tests</code> (pruebas), <code>src</code> o <code>apps</code> (el código principal).</li>
<li><strong>Busca un archivo CONTRIBUTING.md</strong> — casi siempre explica exactamente cómo está organizado el proyecto para quien quiere colaborar.</li>
<li><strong>Revisa el archivo de configuración de dependencias</strong> (<code>package.json</code> en proyectos de JavaScript/Node, por ejemplo) — te dice qué otras herramientas y librerías usa el proyecto.</li>
<li><strong>Busca el punto de entrada</strong> — el archivo desde donde arranca todo (a menudo mencionado en el README o en la configuración de arranque).</li>
</ol>

<h2>Aplicado a un ejemplo real: la estructura de OpenClaw</h2>
<p>Como viste en el curso <em>OpenClaw</em> de esta escuela, su repositorio tiene carpetas como <code>apps</code> (las aplicaciones), <code>crates</code> (componentes escritos en Rust), y <code>config</code> — con solo leer esos nombres, ya sabes que es un proyecto con varias aplicaciones relacionadas y al menos parte del código en Rust, antes de abrir un solo archivo de código.</p>

<h2>No intentes entenderlo todo de golpe</h2>
<div class="tip">
💡 Nadie lee un proyecto grande de arriba a abajo de una sola sentada — ni siquiera sus propios mantenedores tienen memorizado cada archivo. Entra con una pregunta específica ("¿cómo maneja los errores?", "¿dónde se conecta a la base de datos?") en vez de intentar "entender todo el proyecto" de una vez.
</div>

<h2>Usa la IA como guía, no como sustituto de leer</h2>
<p>Puedes pegarle a Claude o a tu asistente de IA un archivo específico y pedirle que te explique qué hace línea por línea (como viste en <em>El Gran Repositorio de Prompts</em>) — un excelente atajo para entender más rápido, aunque no reemplaza tu propio criterio para juzgar si el código está bien diseñado.
</div>
`,
      quiz('¿Cuál es el primer paso recomendado al explorar un repositorio de código abierto que nunca has visto?',
        ['Leer cada archivo de código en orden alfabético', 'Leer el README completo primero — casi siempre explica qué hace el proyecto y cómo está organizado', 'Modificar el código inmediatamente sin leer nada', 'Buscar solo los archivos de configuración, ignorando el resto'], 1)),

    text('El flujo de contribución: de un fork a un Pull Request aceptado',
      'El proceso paso a paso, con las reglas no escritas que hacen que un PR se acepte.',
      `
<h2>El flujo técnico, repaso</h2>
<p>Si tomaste <em>Git y GitHub: de Cero a Experto</em> de esta escuela, este flujo ya te resulta familiar — aquí lo revisas enfocado específicamente en contribuir a un proyecto que <strong>no es tuyo</strong>:</p>
<ol>
<li><strong>Fork:</strong> creas tu propia copia del repositorio en tu cuenta.</li>
<li><strong>Clona</strong> tu fork a tu computadora.</li>
<li>Crea una <strong>rama</strong> nueva y descriptiva para tu cambio (no trabajes directamente en <code>main</code>).</li>
<li>Haz tu cambio, con <strong>commits</strong> pequeños y mensajes claros.</li>
<li><strong>Push</strong> a tu fork, y abre un <strong>Pull Request</strong> hacia el repositorio original.</li>
<li>Responde a la revisión — casi ningún PR se acepta sin al menos una ronda de comentarios.</li>
</ol>

<h2>Las reglas NO escritas que aumentan tus probabilidades de éxito</h2>
<table>
<tr><th>Regla no escrita</th><th>Por qué importa</th></tr>
<tr><td>Un PR pequeño y enfocado, no uno gigante</td><td>Un cambio de 500 líneas que toca 20 archivos es mucho más difícil (y desalentador) de revisar que uno de 20 líneas con un propósito claro.</td></tr>
<tr><td>Explica el "por qué", no solo el "qué"</td><td>El código ya muestra qué cambiaste; la descripción del PR debe explicar por qué era necesario.</td></tr>
<tr><td>Para cambios grandes, pregunta primero</td><td>Abre un issue o pregunta en la comunidad antes de invertir horas en algo que quizás el proyecto no quiere aceptar.</td></tr>
<tr><td>Sigue el estilo de código existente</td><td>Consistencia importa más que tu preferencia personal de formato.</td></tr>
<tr><td>Sé paciente con la revisión</td><td>Los mantenedores suelen ser voluntarios o tener tiempo limitado — una respuesta puede tardar días o semanas.</td></tr>
</table>

<h2>"Good first issue": tu punto de entrada</h2>
<p>Muchos proyectos activos (incluidos OpenClaw y Paperclip) etiquetan issues pequeños y bien definidos como <strong>"good first issue"</strong> — pensados específicamente para que alguien nuevo en el proyecto tenga un punto de entrada claro, sin necesitar entender todo el sistema de antemano.</p>

<div class="tip">
💡 Tu primera contribución no tiene que ser código. Corregir un error de tipografía en la documentación, mejorar un ejemplo confuso, o traducir un archivo, son contribuciones reales y bienvenidas — y una forma excelente de aprender el flujo completo antes de intentar algo más grande.
</div>
`,
      quiz('¿Por qué un Pull Request pequeño y enfocado tiene más probabilidades de ser aceptado que uno gigante?',
        ['Los PR grandes siempre se rechazan automáticamente', 'Un cambio pequeño y con un propósito claro es mucho más fácil y rápido de revisar para los mantenedores', 'El tamaño del PR nunca importa', 'Los proyectos solo aceptan PRs de una sola línea'], 1)),

    text('Cómo se sostiene (o no) un proyecto de código abierto',
      'El dinero, el tiempo y el agotamiento detrás del software del que depende medio internet.',
      `
<h2>Una pregunta incómoda pero importante</h2>
<p>Mucho software crítico de internet depende de proyectos de código abierto mantenidos por muy pocas personas, a veces sin ninguna compensación económica. Entender cómo (y a veces cómo NO) se sostienen estos proyectos te da una perspectiva importante como usuario y posible contribuidor.</p>

<h2>Modelos de sostenibilidad, con ejemplos reales</h2>
<table>
<tr><th>Modelo</th><th>Ejemplo</th><th>Cómo funciona</th></tr>
<tr><td>Fundación sin fines de lucro</td><td>OpenClaw Foundation</td><td>Recibe donaciones de empresas y organizaciones (Amazon, Red Hat, GitHub, NVIDIA, entre otros donantes mencionados en el proyecto) que financian el trabajo sin ser dueñas del proyecto.</td></tr>
<tr><td>Empresa con producto de código abierto</td><td>Paperclip Labs, Inc.</td><td>Una empresa mantiene el proyecto abierto, y puede ofrecer servicios adicionales de pago (soporte, alojamiento) sobre la base gratuita.</td></tr>
<tr><td>Patrocinio individual</td><td>Muchos proyectos pequeños</td><td>Plataformas como GitHub Sponsors o Patreon permiten donaciones directas a mantenedores individuales.</td></tr>
<tr><td>Voluntariado puro</td><td>Buena parte del ecosistema</td><td>Sin ningún financiamiento formal — mantenido en tiempo libre, por pasión o necesidad propia.</td></tr>
</table>

<h2>El riesgo real: el agotamiento de mantenedores</h2>
<p>Un problema documentado y recurrente en el ecosistema de código abierto: proyectos usados por millones de personas (o por empresas enormes) mantenidos por una sola persona sin compensación, que termina agotada respondiendo issues, revisando PRs, y arreglando errores sin ayuda suficiente. Cuando esa persona se va, el proyecto puede quedar sin mantenimiento de un día para otro, afectando a todo quien dependía de él.</p>

<h2>Cómo puedes ayudar a la sostenibilidad, incluso sin programar</h2>
<ul>
<li>Patrocina económicamente los proyectos que usas y valoras, si puedes.</li>
<li>Reporta errores de forma clara y útil, en vez de generar más trabajo innecesario para el mantenedor.</li>
<li>Responde preguntas de otros usuarios en los foros o Discord del proyecto — le quita carga directa al mantenedor principal.</li>
<li>Da crédito público al proyecto cuando lo uses, ayudando a que consiga más apoyo y visibilidad.</li>
</ul>

<div class="tip">
💡 La próxima vez que uses una herramienta gratuita de código abierto que te ahorra horas de trabajo, considera si puedes devolver algo — aunque sea un reporte de error bien escrito o una estrella en el repositorio.
</div>
`,
      quiz('¿Cuál es un riesgo real y documentado en el ecosistema de código abierto, según esta clase?',
        ['Que el código abierto siempre tiene financiamiento garantizado de por vida', 'El agotamiento de mantenedores: proyectos usados por millones de personas mantenidos por muy pocas personas sin compensación adecuada', 'Que nadie usa realmente software de código abierto', 'Que el código abierto siempre es más lento que el código cerrado'], 1)),

    text('Elige la licencia correcta para tu propio proyecto',
      'Cuando pasas de usuario/contribuidor a autor: cómo decidir con criterio.',
      `
<h2>Sin licencia, nadie puede usar legalmente tu código</h2>
<div class="warn">
⚠️ Si publicas código en GitHub sin ningún archivo de licencia, por defecto <strong>no</strong> le estás dando permiso legal a nadie de usarlo, modificarlo o redistribuirlo — aunque sea público. Si quieres que otros lo usen, necesitas elegir y agregar una licencia explícitamente.
</div>

<h2>Preguntas para decidir qué licencia elegir</h2>
<table>
<tr><th>Pregunta</th><th>Si la respuesta es "sí"...</th></tr>
<tr><td>¿Me importa que las versiones modificadas de mi código sigan siendo abiertas?</td><td>Considera una licencia copyleft (GPL).</td></tr>
<tr><td>¿Quiero que empresas puedan usar mi código libremente, incluso en productos cerrados?</td><td>Considera una licencia permisiva (MIT, Apache 2.0).</td></tr>
<tr><td>¿Necesito protección explícita de patentes?</td><td>Apache 2.0 incluye cláusulas de patentes que MIT no tiene.</td></tr>
<tr><td>¿Es un proyecto pequeño y solo quiero algo simple?</td><td>MIT es, por lejos, la licencia permisiva más usada y sencilla de entender.</td></tr>
</table>

<h2>Una herramienta práctica</h2>
<p><strong>choosealicense.com</strong>, mantenido por GitHub, es un buen punto de partida para comparar licencias comunes en lenguaje simple, con ejemplos de qué proyectos las usan.</p>

<h2>Aplícalo en la práctica</h2>
<p>En GitHub, al crear un repositorio nuevo, hay una opción para agregar una licencia directamente desde una lista de las más comunes — no necesitas escribir el texto legal tú mismo, solo elegir la que se ajuste a tus objetivos.</p>

<div class="tip">
💡 Piensa en la elección de licencia como una decisión de producto, no solo legal: ¿qué comportamiento quieres fomentar en quien use tu código? Esa pregunta suele guiarte a la respuesta correcta más rápido que memorizar cláusulas legales.
</div>

<h2>Cierre del curso</h2>
<p>Con este curso ya tienes las reglas generales: qué es realmente el código abierto, cómo identificar y entender una licencia, cómo orientarte en cualquier repositorio nuevo, el flujo completo de contribución, y una mirada honesta a cómo (y por qué a veces no) se sostienen estos proyectos. Aplícalo la próxima vez que abras un repositorio — el de OpenClaw, el de Paperclip, o cualquier otro que te encuentres.</p>
`,
      quiz('¿Qué pasa legalmente si publicas código en un repositorio público de GitHub SIN ningún archivo de licencia?',
        ['Automáticamente se vuelve de dominio público y cualquiera puede hacer lo que quiera con él', 'Por defecto, no le das permiso legal a nadie de usarlo, modificarlo o redistribuirlo, aunque el código sea visible', 'GitHub le asigna automáticamente la licencia MIT', 'No es posible publicar código sin licencia en GitHub'], 1)),
  ],
}
