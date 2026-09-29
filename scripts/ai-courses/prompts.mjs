// Curso "El Gran Repositorio de Prompts: Cientos de Ejemplos Listos para Usar".
// Biblioteca de ejemplos (no un tutorial de técnica — eso ya lo cubren los
// otros dos cursos de Prompt Engineering) + un módulo a fondo de JSON.
import { quiz, text } from '../linux-courses/helpers.mjs'

export const prompts = {
  id: 'course-repositorio-prompts',
  title: 'El Gran Repositorio de Prompts: Cientos de Ejemplos Listos para Usar',
  description: 'Una biblioteca enorme de prompts ya escritos y listos para adaptar — para escribir, estudiar, programar, hacer negocios, crear y decidir — más un módulo a fondo sobre cómo y por qué usar JSON para pedirle a la IA respuestas estructuradas. No es una teoría de prompt engineering: son cientos de ejemplos reales, listos para copiar.',
  ai_instructions: 'Eres Ada, profesora de la Academia de IA de Oliver Academy, guiando el curso "El Gran Repositorio de Prompts". Este curso es una biblioteca de ejemplos, no una teoría — cuando el alumno pregunte, ayúdalo a encontrar o adaptar un prompt de la colección a su caso específico. Cuando expliques JSON en prompts, hazlo con ejemplos concretos y sin asumir que el alumno sabe programar, pero sé técnicamente precisa. Anima siempre a adaptar los placeholders (los textos entre corchetes) antes de usar cualquier prompt de ejemplo.',
  icon: '📚',
  color: '#f97316',
  category: 'Inteligencia Artificial',
  subcategory: 'Prompt Engineering',
  difficulty: 'intermedio',
  locked: false,
  modules: [
    text('Bienvenida: una biblioteca, no un tutorial',
      'Cómo usar este curso distinto a los demás — y por qué existe.',
      `
<h2>Este curso es diferente a los otros dos de Prompt Engineering</h2>
<p>Los cursos <em>Prompt Engineering desde Cero</em> y <em>Prompt Engineering Práctico</em> de esta academia te enseñan la <strong>técnica</strong>: cómo pensar un buen prompt desde cero. Este curso es distinto a propósito: es una <strong>biblioteca de ejemplos ya escritos</strong>, organizada por tema, para que tengas cientos de puntos de partida listos para adaptar — la idea de "un PromptHero, pero para texto en vez de imágenes": un lugar con muchísimos ejemplos reales que puedes copiar, ajustar y usar de inmediato.</p>

<h2>Cómo usar cada prompt de ejemplo</h2>
<ul>
<li>Los textos entre <strong>[corchetes]</strong> son <strong>placeholders</strong> — reemplázalos siempre por tu información real antes de usar el prompt.</li>
<li>Ningún prompt es "mágico" ni funciona igual de bien en todos los modelos — ajústalo según lo que veas en la respuesta, como aprendiste en <em>Trucos y Consejos</em>.</li>
<li>Combina varios prompts de este repositorio en una misma conversación — muchos están pensados para encadenarse.</li>
<li>Usa estos ejemplos como plantilla para crear los tuyos propios — el objetivo final es que aprendas el patrón, no que memorices el texto exacto.</li>
</ul>

<h2>El mapa del curso</h2>
<table>
<tr><th>Módulo</th><th>Qué encontrarás</th></tr>
<tr><td>Escribir y editar</td><td>Correos, resúmenes, tono, traducción, corrección.</td></tr>
<tr><td>Estudiar y aprender</td><td>Explicaciones, quizzes, planes de estudio, repaso.</td></tr>
<tr><td>Programar</td><td>Depurar, revisar, documentar, generar pruebas.</td></tr>
<tr><td>Negocios y productividad</td><td>Reuniones, propuestas, análisis, organización.</td></tr>
<tr><td>Creatividad y roles</td><td>Historias, nombres, personajes que puede adoptar la IA.</td></tr>
<tr><td>Análisis y decisiones</td><td>Comparar opciones, pros y contras, evaluar riesgos.</td></tr>
<tr><td>JSON en prompts</td><td>Cómo y por qué pedir respuestas estructuradas — un módulo a fondo.</td></tr>
<tr><td>Meta-prompts</td><td>Plantillas avanzadas que generan o mejoran otros prompts.</td></tr>
</table>

<div class="tip">
💡 Guarda tus prompts favoritos adaptados a tu contexto — como viste en <em>Trucos y Consejos</em>, muchas plataformas te dejan reutilizarlos como plantillas o instrucciones personalizadas.
</div>
`,
      quiz('¿En qué se diferencia este curso de "Prompt Engineering desde Cero"?',
        ['Es exactamente el mismo contenido repetido', 'Este curso es una biblioteca de cientos de ejemplos ya escritos y listos para adaptar, mientras que el otro enseña la técnica de escribir prompts desde cero', 'Este curso solo sirve para generar imágenes', 'No tiene ninguna relación con prompt engineering'], 1)),

    text('Prompts para escribir y editar',
      'Correos, resúmenes, tono, traducción y corrección — listos para copiar.',
      `
<h2>Correos y mensajes</h2>
<table>
<tr><th>Prompt</th><th>Para qué</th></tr>
<tr><td><code>Escribe un correo profesional a [destinatario] para [objetivo], en tono [formal/cercano], de máximo [N] párrafos.</code></td><td>Redactar un correo desde cero.</td></tr>
<tr><td><code>Reescribe este correo para que sea más breve y directo, sin perder cortesía: [pega el correo]</code></td><td>Acortar sin sonar cortante.</td></tr>
<tr><td><code>Dame 3 formas distintas de decir que no puedo asistir a [evento], siendo respetuoso pero firme.</code></td><td>Mensajes delicados.</td></tr>
<tr><td><code>Responde a este correo agradeciendo, aclarando [punto] y proponiendo [siguiente paso]: [pega el correo]</code></td><td>Respuestas estructuradas.</td></tr>
</table>

<h2>Resúmenes</h2>
<table>
<tr><th>Prompt</th><th>Para qué</th></tr>
<tr><td><code>Resume este texto en 3 viñetas de máximo 15 palabras cada una: [pega el texto]</code></td><td>Resumen ultra breve.</td></tr>
<tr><td><code>Resume esto para alguien que no sabe nada del tema, en un párrafo: [pega el texto]</code></td><td>Resumen accesible.</td></tr>
<tr><td><code>Extrae solo las decisiones y tareas pendientes de este texto, organizadas por responsable: [pega el texto]</code></td><td>Resumen accionable.</td></tr>
</table>

<h2>Tono y estilo</h2>
<table>
<tr><th>Prompt</th><th>Para qué</th></tr>
<tr><td><code>Reescribe este texto con un tono más [formal/cercano/entusiasta/serio], sin cambiar el contenido: [pega el texto]</code></td><td>Ajustar tono.</td></tr>
<tr><td><code>Reescribe esto como si lo explicara un [experto/amigo/profesor de secundaria]: [pega el texto]</code></td><td>Cambiar perspectiva narrativa.</td></tr>
<tr><td><code>Simplifica este texto para un lector de [edad/nivel], sin perder la idea principal: [pega el texto]</code></td><td>Ajustar nivel de lectura.</td></tr>
</table>

<h2>Traducción y corrección</h2>
<table>
<tr><th>Prompt</th><th>Para qué</th></tr>
<tr><td><code>Traduce esto al [idioma], manteniendo un tono [formal/casual]: [pega el texto]</code></td><td>Traducción con control de tono.</td></tr>
<tr><td><code>Corrige la ortografía y gramática de este texto sin cambiar el estilo: [pega el texto]</code></td><td>Corrección conservadora.</td></tr>
<tr><td><code>Señala (sin corregir todavía) los 3 problemas más importantes de este texto.</code></td><td>Diagnóstico antes de corregir.</td></tr>
</table>

<div class="tip">
💡 Combínalos: primero pide el diagnóstico, revisa tú qué aplicar, y luego pide la corrección — el hábito de iterar que viste en <em>Trucos y Consejos</em>.
</div>
`,
      quiz('¿Qué tienen en común los prompts de esta clase?',
        ['Todos requieren saber programar', 'Todos usan placeholders entre corchetes que debes reemplazar con tu información real antes de usarlos', 'Solo funcionan en un idioma específico', 'Ninguno se puede combinar con otro'], 1)),

    text('Prompts para estudiar y aprender',
      'Explicaciones a tu medida, autoevaluación y planes de repaso.',
      `
<h2>Explicaciones a tu medida</h2>
<table>
<tr><th>Prompt</th><th>Para qué</th></tr>
<tr><td><code>Explícame [tema] como si nunca hubiera estudiado [materia], con una analogía cotidiana.</code></td><td>Partir de cero.</td></tr>
<tr><td><code>Explícame [tema] asumiendo que ya sé [conocimiento previo], sin repetir lo básico.</code></td><td>Evitar explicaciones redundantes.</td></tr>
<tr><td><code>Dame 3 analogías distintas para entender [concepto difícil].</code></td><td>Cuando una sola explicación no aterriza.</td></tr>
<tr><td><code>¿Cuál es la diferencia entre [concepto A] y [concepto B]? Dame una tabla comparativa.</code></td><td>Comparar conceptos que se confunden.</td></tr>
</table>

<h2>Autoevaluación</h2>
<table>
<tr><th>Prompt</th><th>Para qué</th></tr>
<tr><td><code>Hazme 5 preguntas de opción múltiple sobre [tema] para comprobar si lo entendí, y dame la respuesta correcta solo después de que yo responda.</code></td><td>Examinarte activamente.</td></tr>
<tr><td><code>Voy a explicarte [tema] con mis palabras. Señálame qué parte está confusa o incorrecta: [tu explicación]</code></td><td>Técnica Feynman (ver <em>Trucos y Consejos</em>).</td></tr>
<tr><td><code>Dame un caso práctico sobre [tema] y pídeme que lo resuelva paso a paso, dándome pistas si me atoro.</code></td><td>Practicar con problemas, no solo teoría.</td></tr>
</table>

<h2>Planes de estudio y repaso</h2>
<table>
<tr><th>Prompt</th><th>Para qué</th></tr>
<tr><td><code>Tengo [N] días para prepararme para un examen de [materia]. Divide el temario en un plan diario realista.</code></td><td>Organizar el tiempo.</td></tr>
<tr><td><code>Convierte estos apuntes en 10 tarjetas de repaso (pregunta/respuesta): [pega tus apuntes]</code></td><td>Crear material de repetición espaciada.</td></tr>
<tr><td><code>Dame un resumen de una página de [tema], solo con lo que probablemente entra en un examen.</code></td><td>Repaso de último momento.</td></tr>
</table>

<h2>Investigación guiada</h2>
<table>
<tr><th>Prompt</th><th>Para qué</th></tr>
<tr><td><code>Antes de explicarme [tema], pregúntame qué ya sé sobre él, y ajusta tu explicación según mi respuesta.</code></td><td>Explicación verdaderamente personalizada.</td></tr>
<tr><td><code>Dame 5 preguntas que debería hacerme para entender [tema] a fondo, sin responderlas todavía.</code></td><td>Guiar tu propia curiosidad.</td></tr>
</table>
`,
      quiz('¿Qué técnica de estudio aplica el prompt "Voy a explicarte [tema] con mis palabras. Señálame qué parte está confusa"?',
        ['La técnica de memorización pura', 'La técnica Feynman: explicar tú mismo el tema obliga a tu cerebro a procesarlo activamente', 'Un examen de opción múltiple', 'No corresponde a ninguna técnica de estudio conocida'], 1)),

    text('Prompts para programar',
      'Depurar, revisar, documentar y generar pruebas.',
      `
<h2>Depurar errores</h2>
<table>
<tr><th>Prompt</th><th>Para qué</th></tr>
<tr><td><code>Tengo este error: [pega el mensaje de error completo]. Aquí está el código relacionado: [pega el código]. Explícame qué lo causa antes de corregirlo.</code></td><td>Entender, no solo arreglar.</td></tr>
<tr><td><code>Este código debería [comportamiento esperado] pero hace [comportamiento real]. ¿Qué podría estar mal?: [pega el código]</code></td><td>Cuando no hay mensaje de error, solo comportamiento raro.</td></tr>
<tr><td><code>Revisa este código y dime, en orden de probabilidad, las 3 causas más comunes de este síntoma: [describe el síntoma]</code></td><td>Depuración sistemática.</td></tr>
</table>

<h2>Revisión y mejora de código</h2>
<table>
<tr><th>Prompt</th><th>Para qué</th></tr>
<tr><td><code>Actúa como un revisor de código exigente. Señala los 3 problemas más importantes de este código, sin corregirlo todavía: [pega el código]</code></td><td>Diagnóstico antes de cambios.</td></tr>
<tr><td><code>Reescribe esta función para que sea más legible, sin cambiar su comportamiento: [pega el código]</code></td><td>Mejorar claridad.</td></tr>
<tr><td><code>¿Hay alguna forma más simple de lograr esto mismo?: [pega el código]</code></td><td>Buscar simplicidad (espíritu "ponytail").</td></tr>
</table>

<h2>Documentación y explicación</h2>
<table>
<tr><th>Prompt</th><th>Para qué</th></tr>
<tr><td><code>Explica qué hace este código línea por línea, para alguien que está aprendiendo: [pega el código]</code></td><td>Aprender leyendo código real.</td></tr>
<tr><td><code>Escribe comentarios claros para este código, sin comentar lo obvio: [pega el código]</code></td><td>Documentar con criterio.</td></tr>
<tr><td><code>Genera un README breve para este proyecto explicando qué hace y cómo instalarlo: [describe el proyecto]</code></td><td>Documentación de proyecto.</td></tr>
</table>

<h2>Pruebas</h2>
<table>
<tr><th>Prompt</th><th>Para qué</th></tr>
<tr><td><code>Genera casos de prueba para esta función, incluyendo casos límite (entradas vacías, valores extremos): [pega el código]</code></td><td>Cobertura de pruebas.</td></tr>
<tr><td><code>¿Qué casos límite no estoy considerando en esta función?: [pega el código]</code></td><td>Revisión de huecos antes de escribir pruebas.</td></tr>
</table>

<div class="tip">
💡 Recuerda de <em>Domina Claude</em>: para tareas de programación sobre un proyecto completo (varios archivos), una herramienta como Claude Code va mucho más allá de estos prompts sueltos de chat.
</div>
`,
      quiz('¿Por qué conviene pedirle a la IA que explique la causa de un error ANTES de pedirle que lo corrija?',
        ['Para que la respuesta sea más larga', 'Para entender el problema de fondo, no solo aplicar un parche que quizás no resuelve la causa real', 'No hay ninguna razón, es lo mismo', 'Porque la IA no puede corregir errores directamente'], 1)),

    text('Prompts para negocios y productividad',
      'Reuniones, propuestas, análisis y organización.',
      `
<h2>Reuniones</h2>
<table>
<tr><th>Prompt</th><th>Para qué</th></tr>
<tr><td><code>Convierte estas notas de reunión en un acta con: decisiones tomadas, tareas pendientes (con responsable) y próximos pasos: [pega las notas]</code></td><td>Actas accionables.</td></tr>
<tr><td><code>Dame una agenda de [N] minutos para una reunión sobre [tema], con tiempo asignado a cada punto.</code></td><td>Planear reuniones eficientes.</td></tr>
<tr><td><code>Redacta un correo de seguimiento después de esta reunión, resumiendo acuerdos: [pega las notas]</code></td><td>Cierre de reunión.</td></tr>
</table>

<h2>Propuestas y documentos</h2>
<table>
<tr><th>Prompt</th><th>Para qué</th></tr>
<tr><td><code>Estructura una propuesta para [proyecto] con: problema, solución, costo estimado y cronograma.</code></td><td>Esqueleto de propuesta.</td></tr>
<tr><td><code>Revisa esta propuesta y dime qué le falta para convencer a alguien escéptico: [pega la propuesta]</code></td><td>Fortalecer argumentos.</td></tr>
<tr><td><code>Resume esta propuesta en 3 líneas para un correo de presentación: [pega la propuesta]</code></td><td>Versión ejecutiva breve.</td></tr>
</table>

<h2>Análisis de negocio</h2>
<table>
<tr><th>Prompt</th><th>Para qué</th></tr>
<tr><td><code>Haz un análisis FODA (fortalezas, oportunidades, debilidades, amenazas) de [idea/negocio/proyecto].</code></td><td>Análisis estratégico rápido.</td></tr>
<tr><td><code>¿Qué preguntas debería hacerme antes de decidir [decisión de negocio]?</code></td><td>Preparar una decisión, no solo tomarla.</td></tr>
<tr><td><code>Dame 3 riesgos que no estoy considerando en [plan/decisión].</code></td><td>Detectar puntos ciegos.</td></tr>
</table>

<h2>Organización personal</h2>
<table>
<tr><th>Prompt</th><th>Para qué</th></tr>
<tr><td><code>Tengo estas tareas: [lista]. Ayúdame a priorizarlas según urgencia e importancia.</code></td><td>Priorización tipo matriz Eisenhower.</td></tr>
<tr><td><code>Divide este proyecto grande en pasos pequeños y accionables: [describe el proyecto]</code></td><td>Evitar la parálisis de "es muy grande".</td></tr>
<tr><td><code>Dame un borrador de horario semanal considerando: [tus compromisos fijos].</code></td><td>Planeación de tiempo.</td></tr>
</table>
`,
      quiz('¿Qué logra el prompt "¿Qué riesgos no estoy considerando en este plan?"',
        ['Nada útil, es una pregunta vacía', 'Ayuda a detectar puntos ciegos que quizás no habías pensado por tu cuenta', 'Solo sirve para proyectos de programación', 'Reemplaza la necesidad de analizar el plan tú mismo'], 1)),

    text('Prompts de creatividad y personas (roles)',
      'Historias, nombres, personajes — y cómo pedirle a la IA que adopte un rol específico.',
      `
<h2>El patrón "actúa como"</h2>
<p>Pedirle a la IA que adopte un rol específico ajusta su tono y enfoque de forma muy efectiva — porque el rol implica, de forma implícita, mucho contexto sobre cómo debe comportarse (como viste en <em>Trucos y Consejos</em>).</p>
<table>
<tr><th>Rol</th><th>Prompt de ejemplo</th></tr>
<tr><td>Editor exigente</td><td><code>Actúa como un editor exigente. Señala los 3 puntos más débiles de este texto: [pega el texto]</code></td></tr>
<tr><td>Abogado del diablo</td><td><code>Actúa como abogado del diablo sobre esta decisión: [describe la decisión]. Dame los mejores argumentos en contra.</code></td></tr>
<tr><td>Entrevistador de trabajo</td><td><code>Actúa como entrevistador para un puesto de [puesto]. Hazme 5 preguntas difíciles, una a la vez, esperando mi respuesta antes de la siguiente.</code></td></tr>
<tr><td>Tutor paciente</td><td><code>Actúa como un tutor muy paciente que nunca da la respuesta directa, solo pistas, para enseñarme [tema].</code></td></tr>
<tr><td>Cliente difícil</td><td><code>Actúa como un cliente insatisfecho con [situación]. Practica conmigo cómo manejar la conversación.</code></td></tr>
</table>

<h2>Historias y narrativa</h2>
<table>
<tr><th>Prompt</th><th>Para qué</th></tr>
<tr><td><code>Dame 5 ideas de inicio para una historia sobre [tema/género], cada una en una sola frase.</code></td><td>Superar el folio en blanco.</td></tr>
<tr><td><code>Desarrolla este personaje: [descripción breve]. Dame su motivación, su miedo más grande y un secreto.</code></td><td>Profundidad de personajes.</td></tr>
<tr><td><code>Continúa esta escena manteniendo el mismo tono y estilo: [pega el texto]</code></td><td>Continuar escritura existente.</td></tr>
<tr><td><code>¿Qué le falta a esta escena para generar más tensión?: [pega el texto]</code></td><td>Retroalimentación narrativa.</td></tr>
</table>

<h2>Nombres e ideas de marca</h2>
<table>
<tr><th>Prompt</th><th>Para qué</th></tr>
<tr><td><code>Dame 15 opciones de nombre para [tipo de proyecto/negocio], que suenen [estilo deseado].</code></td><td>Lluvia de ideas de nombres.</td></tr>
<tr><td><code>De esta lista de nombres, ¿cuáles podrían confundirse con marcas existentes o ser difíciles de pronunciar?: [lista]</code></td><td>Filtro rápido antes de decidir.</td></tr>
</table>

<h2>Lluvia de ideas general</h2>
<table>
<tr><th>Prompt</th><th>Para qué</th></tr>
<tr><td><code>Dame 10 ideas para [objetivo], sin filtrar ninguna todavía, aunque suenen extrañas.</code></td><td>Cantidad antes que calidad, para no autocensurarte.</td></tr>
<tr><td><code>De estas 10 ideas, ¿cuáles 3 son más viables con un presupuesto de [monto]?</code></td><td>Filtrar después de generar.</td></tr>
</table>
`,
      quiz('¿Por qué pedirle a la IA que "actúe como" un rol específico mejora sus respuestas?',
        ['Porque cambia el idioma de la respuesta', 'Porque el rol implica, de forma implícita, mucho contexto sobre el tono y enfoque que debe usar', 'Porque hace que responda más rápido', 'No tiene ningún efecto real'], 1)),

    text('Prompts para análisis y toma de decisiones',
      'Comparar opciones, ver ambos lados, y evaluar antes de decidir.',
      `
<h2>Comparar opciones</h2>
<table>
<tr><th>Prompt</th><th>Para qué</th></tr>
<tr><td><code>Compara [opción A] y [opción B] en una tabla, considerando: [criterios que te importan].</code></td><td>Comparación estructurada.</td></tr>
<tr><td><code>¿En qué situación elegiría alguien [opción A] en vez de [opción B]?</code></td><td>Entender el contexto de cada opción.</td></tr>
<tr><td><code>Si tuviera que elegir hoy entre [opción A] y [opción B] sin más información, ¿qué preguntaría primero?</code></td><td>Identificar información faltante.</td></tr>
</table>

<h2>Ver todos los lados de un tema</h2>
<table>
<tr><th>Prompt</th><th>Para qué</th></tr>
<tr><td><code>Dame los 3 mejores argumentos a favor y los 3 mejores en contra de [postura], de la forma más justa posible para ambos lados.</code></td><td>Pensamiento balanceado.</td></tr>
<tr><td><code>¿Qué respondería alguien que no está de acuerdo con esto?: [tu argumento]</code></td><td>Anticipar objeciones.</td></tr>
<tr><td><code>Explica [tema controversial] desde dos perspectivas distintas, sin tomar partido.</code></td><td>Entender un debate antes de opinar.</td></tr>
</table>

<h2>Evaluación de riesgo y consecuencias</h2>
<table>
<tr><th>Prompt</th><th>Para qué</th></tr>
<tr><td><code>¿Qué podría salir mal con [plan/decisión], y qué tan probable es cada escenario?</code></td><td>Anticipar problemas.</td></tr>
<tr><td><code>Si [decisión] resulta mal en un año, ¿cuál sería la razón más probable? (pre-mortem)</code></td><td>Técnica de "pre-mortem" para decisiones importantes.</td></tr>
</table>

<h2>Resumir y sintetizar datos</h2>
<table>
<tr><th>Prompt</th><th>Para qué</th></tr>
<tr><td><code>Aquí hay datos de [tema]: [pega los datos]. ¿Qué patrón o tendencia notas?</code></td><td>Análisis exploratorio inicial.</td></tr>
<tr><td><code>Convierte estos datos en 3 conclusiones claras, en lenguaje simple: [pega los datos]</code></td><td>Traducir datos a insights.</td></tr>
</table>

<div class="warn">
⚠️ Como viste en <em>Trucos y Consejos</em>: para decisiones importantes (médicas, legales, financieras), usa estos prompts como punto de partida para pensar mejor, nunca como la fuente final de la decisión.
</div>
`,
      quiz('¿Qué es la técnica de "pre-mortem" aplicada con un prompt de IA?',
        ['Preguntar por el pasado de una empresa', 'Imaginar que una decisión ya salió mal en el futuro y preguntar cuál sería la razón más probable, para anticipar problemas', 'Un tipo de examen médico', 'Pedir siempre la opción más barata'], 1)),

    text('JSON en prompts: pídele a la IA respuestas estructuradas',
      'El módulo a fondo — cómo y por qué usar JSON, sin asumir que sabes programar.',
      `
<h2>El problema: texto libre es difícil de reutilizar</h2>
<p>Cuando le pides a la IA una respuesta en texto normal ("dame 3 recomendaciones de libros"), el formato exacto puede variar cada vez: a veces una lista, a veces un párrafo, a veces con distinto orden de información. Eso está bien para leer tú mismo, pero es un problema si quieres <strong>usar esa respuesta dentro de otra herramienta o programa</strong> — por ejemplo, para mostrarla en una tabla, guardarla en una base de datos, o conectarla con otra aplicación.</p>

<h2>Qué es JSON, sin jerga</h2>
<p><strong>JSON</strong> (<em>JavaScript Object Notation</em>) es un formato de texto para organizar datos de manera predecible, usando <strong>llaves</strong> (nombres de campo) y sus <strong>valores</strong>, algo parecido a una ficha con casillas fijas que siempre se llenan igual. Ejemplo simple:</p>
<pre><code>{
  "libro": "Cien años de soledad",
  "autor": "Gabriel García Márquez",
  "año": 1967,
  "genero": "Realismo mágico"
}</code></pre>
<p>Cada respuesta con esta misma estructura tiene los mismos campos ("libro", "autor", "año", "genero") en el mismo formato — por eso un programa puede leerla de forma confiable, sin tener que "adivinar" dónde está cada dato dentro de un párrafo.</p>

<h2>Cómo pedirle a la IA una respuesta en JSON</h2>
<table>
<tr><th>Prompt</th><th>Resultado</th></tr>
<tr><td><code>Dame 3 recomendaciones de libros sobre [tema] en formato JSON, con los campos: titulo, autor, año y por_que_recomendado.</code></td><td>Una lista de objetos JSON, cada uno con esos 4 campos exactos.</td></tr>
<tr><td><code>Analiza este texto y devuélveme un JSON con: sentimiento ("positivo"/"negativo"/"neutral"), temas_principales (lista) y resumen_una_linea.</code></td><td>Un análisis estructurado, reutilizable en cualquier programa.</td></tr>
<tr><td><code>Extrae de este correo: remitente, asunto, fecha_mencionada y accion_requerida, en formato JSON. Si algún dato no aparece, usa null.</code></td><td>Extracción de datos consistente, incluso cuando falta información.</td></tr>
</table>

<h2>Por qué darle un "esquema" (schema) ayuda todavía más</h2>
<p>Puedes ser aún más específico describiendo exactamente qué campos esperas y de qué tipo (texto, número, lista, verdadero/falso) — a esto se le llama informalmente un <strong>schema</strong> o esquema. Cuanto más claro seas sobre la estructura exacta que esperas, más consistente será la respuesta entre distintas veces que uses el mismo prompt.</p>

<div class="example">
<strong>Ejemplo con schema explícito:</strong><br>
<code>Clasifica este comentario de cliente en JSON con exactamente estos campos: { "categoria": uno de ["queja", "elogio", "pregunta", "sugerencia"], "urgencia": número del 1 al 5, "resumen": texto de máximo 10 palabras }</code>
</div>

<h2>Por qué esto importa incluso si no programas</h2>
<ul>
<li><strong>Consistencia:</strong> si repites la misma tarea muchas veces (analizar 50 comentarios de clientes, por ejemplo), un formato fijo te ahorra tener que releer respuestas con estructura distinta cada vez.</li>
<li><strong>Copiar a una hoja de cálculo:</strong> una respuesta en JSON con la misma estructura se puede convertir fácilmente en filas y columnas.</li>
<li><strong>Conectar con otras herramientas:</strong> si alguna vez programas algo (o le pides a alguien que lo haga) que use respuestas de IA automáticamente, JSON es prácticamente el estándar universal para eso — es, de hecho, cómo las aplicaciones (incluida esta plataforma) le piden a un modelo de IA datos estructurados en vez de solo texto libre.</li>
</ul>

<div class="tip">
💡 Si trabajas con hojas de cálculo o análisis de datos repetitivo, este es probablemente el módulo con más impacto práctico de todo el curso — combínalo con las clases de negocios y análisis que ya viste.
</div>
`,
      quiz('¿Por qué pedirle a la IA una respuesta en formato JSON (en vez de texto libre) es útil para tareas repetitivas?',
        ['Porque JSON es un idioma distinto al español', 'Porque garantiza una estructura consistente (los mismos campos, en el mismo formato) cada vez, fácil de reutilizar en una hoja de cálculo o programa', 'Porque hace que la IA piense más rápido', 'No tiene ninguna ventaja real sobre el texto libre'], 1)),

    text('Meta-prompts: plantillas que generan y mejoran otros prompts',
      'El nivel avanzado — usar la IA para escribir mejores instrucciones para la IA.',
      `
<h2>¿Qué es un meta-prompt?</h2>
<p>Un <strong>meta-prompt</strong> es un prompt cuyo propósito es generar, mejorar o evaluar <strong>otro</strong> prompt — en vez de pedir directamente el resultado final, le pides a la IA que te ayude a construir mejor la instrucción antes de usarla.</p>

<h2>Plantillas de meta-prompts listas para usar</h2>
<table>
<tr><th>Prompt</th><th>Para qué</th></tr>
<tr><td><code>Quiero pedirte que hagas [tarea general]. Antes de responder, hazme las preguntas que necesites para darte el contexto suficiente.</code></td><td>Que la IA misma pida el contexto que le falta, en vez de asumir.</td></tr>
<tr><td><code>Aquí está mi prompt: [pega tu prompt]. ¿Qué le falta para obtener una mejor respuesta?</code></td><td>Mejorar un prompt antes de usarlo.</td></tr>
<tr><td><code>Convierte esta idea vaga en un prompt específico y bien estructurado: [tu idea informal]</code></td><td>Cuando sabes qué quieres pero no cómo pedirlo bien.</td></tr>
<tr><td><code>Dame 3 versiones distintas de este prompt, cada una enfatizando un aspecto distinto: [tu prompt]</code></td><td>Explorar variaciones antes de decidir.</td></tr>
</table>

<h2>Plantillas de razonamiento estructurado</h2>
<table>
<tr><th>Prompt</th><th>Para qué</th></tr>
<tr><td><code>Resuelve esto en 3 pasos: 1) identifica el problema real, 2) lista posibles soluciones, 3) recomienda la mejor con justificación: [tu problema]</code></td><td>Forzar un razonamiento ordenado (chain-of-thought, ver <em>Trucos y Consejos</em>).</td></tr>
<tr><td><code>Antes de responder, resume en una línea qué es lo que realmente te estoy pidiendo, para confirmar que entendiste.</code></td><td>Detectar malentendidos antes de una respuesta larga.</td></tr>
</table>

<h2>Auto-crítica: que la IA revise su propia respuesta</h2>
<table>
<tr><th>Prompt</th><th>Para qué</th></tr>
<tr><td><code>Revisa tu respuesta anterior. ¿Qué parte podría estar incompleta o equivocada?</code></td><td>Segunda pasada de calidad.</td></tr>
<tr><td><code>Si un experto en [tema] leyera tu respuesta anterior, ¿qué le corregiría?</code></td><td>Simular una revisión experta.</td></tr>
</table>

<h2>Cierre del curso completo</h2>
<p>Este repositorio te dio cientos de puntos de partida, organizados por tema, más un módulo a fondo de JSON para respuestas estructuradas. El patrón detrás de todos ellos es el mismo que viste en <em>Trucos y Consejos</em>: contexto claro, iteración, y verificación. Ahora tienes tanto la <strong>técnica</strong> (en los otros cursos de Prompt Engineering) como la <strong>biblioteca de ejemplos</strong> (aquí) para no volver a empezar de cero cada vez.</p>

<div class="tip">
💡 Vuelve a este curso como referencia cuando necesites un punto de partida rápido — no hace falta memorizarlo todo de una sola vez.
</div>
`,
      quiz('¿Qué es un "meta-prompt"?',
        ['Un prompt escrito en mayúsculas', 'Un prompt cuyo propósito es generar, mejorar o evaluar otro prompt, en vez de pedir directamente el resultado final', 'Un prompt que solo funciona con imágenes', 'Un error común que se debe evitar siempre'], 1)),
  ],
}
