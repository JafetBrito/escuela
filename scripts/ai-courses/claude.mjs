// Curso "Domina Claude: Guía Completa" — el curso insignia de la Academia de IA.
import { quiz, text } from '../linux-courses/helpers.mjs'

export const claude = {
  id: 'course-domina-claude',
  title: 'Domina Claude: Guía Completa',
  description: 'Todo lo que necesitas para sacarle el máximo provecho a Claude, el asistente de IA de Anthropic: Proyectos, Artefactos, trabajar con tus documentos, pensamiento extendido, Claude Code para programar, uso de herramientas y computadora, y el enfoque de seguridad detrás de cómo se construye. El curso insignia de la Academia de IA.',
  ai_instructions: 'Eres Ada, profesora de la Academia de IA de Oliver Academy, guiando el curso "Domina Claude". Conoces a fondo las funciones de Claude (Proyectos, Artefactos, pensamiento extendido, Claude Code, uso de herramientas) y explicas con ejemplos concretos de cuándo usar cada una. Sé honesta sobre que las funciones y planes disponibles pueden cambiar, y anima siempre al alumno a confirmar detalles actuales en claude.ai o en la documentación oficial de Anthropic. No exageres las capacidades de Claude ni de ningún otro modelo — sé precisa y realista, y reconoce sus límites cuando corresponda.',
  icon: '✳️',
  color: '#d97757',
  category: 'Inteligencia Artificial',
  subcategory: 'Herramientas de IA',
  difficulty: 'principiante',
  locked: false,
  modules: [
    text('Bienvenida: qué es Claude y para quién es este curso',
      'El asistente de IA de Anthropic, de cerca — más allá de "es un chatbot".',
      `
<h2>Qué es Claude, en una frase</h2>
<p><strong>Claude</strong> es la familia de modelos de inteligencia artificial desarrollada por <strong>Anthropic</strong>, diseñada para ser útil, honesta e inofensiva — los tres principios que Anthropic resume como <em>helpful, honest, harmless</em>. Como viste en el curso <em>Panorama de Modelos de IA</em>, el nombre rinde homenaje a Claude Shannon, el padre de la teoría de la información.</p>

<h2>Por qué un curso dedicado solo a Claude</h2>
<p>Los cursos anteriores de esta academia te dieron un panorama general de la IA. Este va más a fondo en <strong>una herramienta específica</strong>, con todo detalle: no solo "escribir en un chat", sino Proyectos, Artefactos, trabajar con documentos completos, pensamiento extendido, programar con Claude Code, y cómo Claude puede usar herramientas para completar tareas por sí mismo. Muchas de estas funciones existen también, con variaciones, en otros asistentes — pero aquí las vas a ver con el detalle real de cómo funcionan en Claude.</p>

<h2>El mapa del curso</h2>
<table>
<tr><th>Parte</th><th>Qué vas a aprender</th></tr>
<tr><td>1. Primeros pasos</td><td>La interfaz, los modelos, y cómo empezar una conversación bien.</td></tr>
<tr><td>2. Proyectos y Artefactos</td><td>Organizar tu trabajo y generar contenido que vive fuera del chat.</td></tr>
<tr><td>3. Documentos y pensamiento extendido</td><td>Trabajar con archivos reales y problemas que requieren razonar más.</td></tr>
<tr><td>4. Claude Code y uso de herramientas</td><td>Programar con un agente, y cómo Claude puede actuar, no solo responder.</td></tr>
<tr><td>5. Seguridad y cierre</td><td>Cómo Anthropic construye Claude, y un repaso práctico completo.</td></tr>
</table>

<div class="tip">
💡 Un dato curioso: la mascota de esta misma Academia de Oliver Academy que responde tus preguntas puede estar conectada a Claude (si así lo configuraste) — así que probablemente ya llevas usando algo de lo que este curso explica, sin saber el nombre de cada función.
</div>
`,
      quiz('¿Qué significan las siglas conceptuales "helpful, honest, harmless" que Anthropic usa para describir a Claude?',
        ['Los tres planes de precio de Claude', 'Los tres principios de diseño: que sea útil, honesto e inofensivo', 'Los nombres de los tres modelos más recientes', 'Un examen que Claude debe aprobar cada año'], 1)),

    text('Primeros pasos: la interfaz y cómo empezar bien',
      'claude.ai por dentro, y el hábito más importante desde el primer mensaje.',
      `
<h2>Dónde vive Claude</h2>
<table>
<tr><th>Forma de acceso</th><th>Para quién</th></tr>
<tr><td><strong>claude.ai</strong> (web, app de escritorio y móvil)</td><td>Uso conversacional directo — la forma más común de empezar.</td></tr>
<tr><td><strong>La API de Anthropic</strong></td><td>Para desarrolladores que integran Claude en sus propias aplicaciones (así se conecta, por ejemplo, tu mascota en Oliver Academy).</td></tr>
<tr><td><strong>Plataformas de terceros</strong></td><td>Claude también está disponible a través de servicios en la nube como Amazon Bedrock y Google Cloud Vertex AI.</td></tr>
</table>

<h2>Una familia, distintos tamaños</h2>
<p>En cada generación, Anthropic suele publicar varias versiones de Claude pensadas para necesidades distintas: una más <strong>rápida y económica</strong> para tareas cotidianas y de alto volumen, y otra más <strong>capaz</strong> para problemas complejos que requieren más razonamiento, con un punto intermedio entre ambas. Los nombres exactos cambian con cada generación — lo estable es el concepto: elige velocidad cuando la tarea es simple, y capacidad cuando el problema lo amerita.</p>

<h2>El primer hábito: dale contexto desde el inicio</h2>
<p>Como viste en <em>Trucos y Consejos</em>, el contexto lo cambia casi todo. Con Claude en particular, vale la pena empezar conversaciones importantes explicando: quién eres, qué necesitas lograr, y qué formato esperas — Claude tiende a seguir instrucciones de formato y tono con bastante precisión cuando se las das explícitamente.</p>

<h2>El historial de conversaciones</h2>
<p>Cada conversación en claude.ai queda guardada en tu historial y la puedes retomar después. Ten presente que, salvo que uses la función de <strong>Proyectos</strong> (siguiente clase), cada conversación nueva empieza sin el contexto de las anteriores — Claude no "recuerda" automáticamente lo que hablaste en un chat distinto.</p>

<div class="tip">
💡 Explora el panel de configuración: ahí puedes ajustar preferencias que se aplican a todas tus conversaciones nuevas, como un tono o un tipo de respuesta que prefieras por defecto.
</div>
`,
      quiz('Si no usas la función de Proyectos, ¿qué pasa con el contexto entre dos conversaciones distintas en claude.ai?',
        ['Se comparte automáticamente entre todas tus conversaciones', 'Cada conversación nueva empieza sin el contexto de las conversaciones anteriores', 'Claude olvida incluso lo que dijiste al inicio de la misma conversación', 'No es posible tener más de una conversación'], 1)),

    text('Proyectos: organiza tu trabajo con contexto compartido',
      'Cuando trabajas en algo grande durante días o semanas, no en un solo chat suelto.',
      `
<h2>El problema que resuelven los Proyectos</h2>
<p>Imagina que estás escribiendo una tesis, o llevando el trabajo de una materia completa: sin Proyectos, tendrías que volver a explicar el contexto (de qué trata, qué estilo usas, qué ya escribiste) en cada conversación nueva. Los <strong>Proyectos</strong> resuelven exactamente esto: un espacio donde agrupas varias conversaciones relacionadas, todas compartiendo el mismo contexto de fondo.</p>

<h2>Qué puedes poner en un Proyecto</h2>
<table>
<tr><th>Elemento</th><th>Para qué sirve</th></tr>
<tr><td>Instrucciones personalizadas</td><td>Un texto que Claude "recuerda" en cada conversación dentro de ese proyecto (por ejemplo, tu estilo de escritura preferido).</td></tr>
<tr><td>Documentos de referencia</td><td>Archivos que Claude puede consultar en cualquier conversación del proyecto, sin que tengas que resubirlos cada vez.</td></tr>
<tr><td>Varias conversaciones</td><td>Cada una enfocada en una parte distinta del trabajo, pero todas con el mismo contexto de fondo.</td></tr>
</table>

<h2>Ejemplos prácticos de proyectos</h2>
<ul>
<li><strong>Un curso completo:</strong> sube el temario y tus apuntes; cada conversación nueva puede ser una duda distinta, sin repetir contexto.</li>
<li><strong>Un proyecto de escritura:</strong> guía de estilo + capítulos ya escritos, para que las sugerencias sean consistentes con lo que ya tienes.</li>
<li><strong>Un proyecto de programación:</strong> el contexto del sistema que estás construyendo, para que las respuestas de código encajen con tus decisiones previas.</li>
</ul>

<h2>Cuándo NO hace falta un Proyecto</h2>
<p>Para una pregunta puntual y aislada ("¿cómo se dice esto en francés?"), un Proyecto es innecesario — es una herramienta para <strong>trabajo sostenido</strong>, no para cada interacción.</p>

<div class="tip">
💡 Piensa en un Proyecto como una carpeta de trabajo compartida entre tú y Claude, no como una conversación más larga — la diferencia es que el contexto vive en la carpeta, disponible para cualquier conversación nueva que abras dentro de ella.
</div>
`,
      quiz('¿Cuál es la ventaja principal de usar un Proyecto en vez de una conversación suelta?',
        ['Los Proyectos responden más rápido', 'El contexto (instrucciones, documentos) se comparte automáticamente entre todas las conversaciones dentro del proyecto, sin tener que repetirlo cada vez', 'Los Proyectos son gratuitos y las conversaciones sueltas no', 'No hay ninguna diferencia real'], 1)),

    text('Artefactos: cuando el resultado no cabe en el chat',
      'Documentos, código y visualizaciones que viven en su propio panel, editables.',
      `
<h2>El problema de "todo en el chat"</h2>
<p>Cuando le pides a un chatbot común un documento largo o un fragmento de código, el resultado se mezcla con el resto de la conversación: difícil de ubicar, difícil de editar, difícil de ver mientras sigues conversando. Los <strong>Artefactos</strong> de Claude resuelven esto: cuando genera algo sustancial (un documento, código, una página web, un diagrama), lo muestra en un <strong>panel aparte</strong>, separado del flujo del chat.</p>

<h2>Qué tipo de contenido se vuelve Artefacto</h2>
<table>
<tr><th>Tipo</th><th>Ejemplo</th></tr>
<tr><td>Documentos</td><td>Ensayos, reportes, guiones — texto largo y estructurado.</td></tr>
<tr><td>Código</td><td>Scripts o programas completos, con resaltado de sintaxis.</td></tr>
<tr><td>Páginas web interactivas</td><td>HTML/CSS/JavaScript que se renderiza y puedes ver funcionando, no solo como texto.</td></tr>
<tr><td>Diagramas</td><td>Diagramas de flujo o estructurados, generados a partir de una descripción.</td></tr>
<tr><td>Hojas de cálculo</td><td>Datos organizados en tablas editables.</td></tr>
</table>

<h2>La ventaja de estar "aparte"</h2>
<p>Puedes seguir conversando con Claude sobre el Artefacto ("cámbiale el color de fondo", "acorta la sección 2") sin perder de vista el resultado completo, y Claude actualiza el Artefacto en el mismo panel en vez de repetir todo el contenido de nuevo en el chat. Esto vuelve mucho más eficiente iterar sobre algo largo — exactamente el hábito de iteración que viste en <em>Trucos y Consejos</em>, pero con una interfaz pensada específicamente para eso.</p>

<h2>Ejemplo práctico</h2>
<div class="example">
Le pides a Claude una calculadora simple en una página web. Aparece como Artefacto: una página funcional que puedes usar ahí mismo. Le dices "agrégale un botón para borrar" — y el Artefacto se actualiza, sin que tengas que copiar y pegar código manualmente entre el chat y tu propio editor.
</div>

<div class="tip">
💡 Esta plataforma, Oliver Academy, usa el mismo concepto de "Artefactos" para mostrarte páginas y visualizaciones — no es coincidencia: es un patrón de diseño que Anthropic popularizó y que otros productos, incluido este, adoptaron por lo útil que resulta.
</div>
`,
      quiz('¿Qué ventaja tiene que un documento largo o un código se muestre como Artefacto, en vez de directamente en el chat?',
        ['Los Artefactos son más rápidos de generar', 'Se mantiene visible y editable en un panel aparte mientras sigues conversando, y Claude puede actualizarlo sin repetir todo el contenido en el chat', 'Solo los usuarios de pago pueden verlos', 'No hay ninguna ventaja real'], 1)),

    text('Trabaja con tus propios documentos',
      'PDFs, hojas de cálculo, imágenes y código: Claude puede leerlos, no solo generarlos.',
      `
<h2>Sube, no solo pidas</h2>
<p>Una de las formas más poderosas de usar Claude es <strong>subiéndole tus propios archivos</strong> para que trabaje sobre ellos, en vez de depender solo de lo que escribes en el mensaje. Esto conecta con la idea del curso <em>Trucos y Consejos</em> sobre "responder solo con base en tus documentos" (como viste con Google NotebookLM) — Claude puede hacer algo similar directamente en la conversación.</p>

<h2>Tipos de archivos que puedes trabajar</h2>
<table>
<tr><th>Tipo</th><th>Casos de uso típicos</th></tr>
<tr><td>PDFs</td><td>Resumir, extraer datos específicos, responder preguntas sobre un documento largo.</td></tr>
<tr><td>Hojas de cálculo (CSV, Excel)</td><td>Analizar datos, encontrar patrones, generar gráficas o resúmenes.</td></tr>
<tr><td>Imágenes</td><td>Describir contenido, extraer texto de una foto, analizar un diagrama o gráfica.</td></tr>
<tr><td>Código fuente</td><td>Explicar qué hace, encontrar errores, sugerir mejoras.</td></tr>
<tr><td>Documentos de texto (Word, texto plano)</td><td>Editar, dar formato, reescribir manteniendo el contenido original.</td></tr>
</table>

<h2>Un flujo de trabajo típico</h2>
<ol>
<li>Sube el archivo (o varios) a la conversación.</li>
<li>Sé específico sobre qué necesitas: "resume las conclusiones de la sección 3", no solo "léelo".</li>
<li>Itera: pide que profundice en una parte, o que compare varios documentos que subiste a la vez.</li>
<li>Pide que cite de qué parte del documento sacó cada dato, para poder verificarlo tú mismo.</li>
</ol>

<h2>Un límite importante a tener presente</h2>
<div class="warn">
⚠️ Aunque Claude tiene una ventana de contexto grande (ver el curso <em>Panorama de Modelos de IA</em>), documentos extremadamente largos pueden acercarse a ese límite. Si trabajas con varios documentos grandes de forma sostenida, considera organizarlos dentro de un Proyecto en vez de subirlos todos en una sola conversación.
</div>

<h2>Privacidad de tus documentos</h2>
<p>Revisa siempre la política de privacidad vigente de Anthropic antes de subir información sensible, igual que la recomendación general que viste en <em>Trucos y Consejos</em> — sube lo necesario, no documentos completos con datos que no hacen falta compartir.</p>
`,
      quiz('¿Cuál es un buen hábito al subir un documento largo y pedir un resumen o análisis?',
        ['Pedir siempre "léelo" sin especificar más', 'Ser específico sobre qué necesitas y pedir que cite de qué parte del documento sacó cada dato, para poder verificarlo', 'Subir el documento y no volver a mencionarlo', 'Nunca subir más de un archivo a la vez, bajo ninguna circunstancia'], 1)),

    text('Pensamiento extendido: cuando Claude "piensa antes de responder"',
      'El razonamiento visible, para los problemas que de verdad lo necesitan.',
      `
<h2>Qué es el pensamiento extendido</h2>
<p>Como viste en <em>Actualidad de la IA</em>, una tendencia reciente importante es que los modelos dediquen más cómputo a "pensar" antes de responder. En Claude, esto se llama <strong>pensamiento extendido</strong> (<em>extended thinking</em>): un modo donde Claude trabaja el problema paso a paso de forma más extensa antes de dar su respuesta final, y puede mostrarte ese proceso de razonamiento.</p>

<h2>Cuándo activarlo</h2>
<table>
<tr><th>Tipo de problema</th><th>¿Conviene pensamiento extendido?</th></tr>
<tr><td>Matemáticas con varios pasos</td><td>Sí — reduce errores de cálculo intermedio.</td></tr>
<tr><td>Depurar código con un error difícil de encontrar</td><td>Sí — ayuda a revisar sistemáticamente varias hipótesis.</td></tr>
<tr><td>Decisiones con varios factores a sopesar</td><td>Sí — hace explícito el peso que le da a cada factor.</td></tr>
<tr><td>Preguntas de conocimiento general simples</td><td>No hace falta — sería más lento sin mejorar la respuesta.</td></tr>
<tr><td>Escribir un correo corto</td><td>No hace falta.</td></tr>
</table>

<h2>Por qué ver el razonamiento es útil, no solo la respuesta final</h2>
<p>Cuando Claude muestra su proceso de pensamiento, tú puedes revisarlo: si razonó sobre una premisa incorrecta (por ejemplo, malinterpretó un dato de tu pregunta), lo puedes detectar y corregir, en vez de solo recibir una respuesta final equivocada sin saber por qué. Es la misma ventaja que "mostrar el trabajo" tiene en un examen de matemáticas — no solo para el que califica, sino para ti mismo, para detectar dónde se fue el error.</p>

<h2>Relación con "pídele que piense paso a paso"</h2>
<p>El pensamiento extendido es, en esencia, una versión más profunda y automatizada de la técnica de <em>chain-of-thought</em> que viste en <em>Trucos y Consejos</em> — la diferencia es que en vez de pedirlo tú explícitamente en el prompt, es un modo dedicado del modelo, entrenado específicamente para razonar de forma extensa cuando se activa.</p>

<div class="tip">
💡 Regla práctica: si notas que Claude se equivocó en un problema con varios pasos, prueba de nuevo con pensamiento extendido activado antes de asumir que el modelo "no puede" resolverlo.
</div>
`,
      quiz('¿Qué ventaja tiene poder VER el proceso de razonamiento de Claude en el pensamiento extendido, no solo la respuesta final?',
        ['Ninguna, es solo decorativo', 'Permite detectar si razonó sobre una premisa incorrecta y corregirlo, en vez de recibir solo una respuesta final posiblemente equivocada sin explicación', 'Hace que la respuesta sea más corta', 'Es obligatorio activarlo siempre para cualquier pregunta'], 1)),

    text('Claude Code: un agente para programar de verdad',
      'De sugerir una línea a trabajar en un proyecto completo, con supervisión tuya.',
      `
<h2>Qué es Claude Code</h2>
<p><strong>Claude Code</strong> es una herramienta de Anthropic pensada específicamente para programar: a diferencia de pedirle código a Claude en un chat y copiarlo manualmente, Claude Code corre en tu propio entorno (por ejemplo, en la terminal) con acceso directo a los archivos de tu proyecto — puede leer el código existente, hacer cambios en varios archivos a la vez, ejecutar pruebas, y corregir errores que encuentra, todo dentro de tu propio repositorio.</p>

<h2>El flujo de trabajo típico</h2>
<ol>
<li>Le describes una tarea en lenguaje natural: "agrega un botón que exporte esta tabla a PDF".</li>
<li>Claude Code explora el proyecto para entender su estructura antes de hacer cambios.</li>
<li>Modifica los archivos necesarios, y puede ejecutar pruebas para verificar que no rompió nada.</li>
<li>Te muestra los cambios (como un diff de Git) antes de que decidas aceptarlos.</li>
</ol>

<h2>Este mismo curso es un ejemplo</h2>
<div class="example">
La Academia de Linux de esta plataforma, con sus tres cursos y su isla-atlas en VR, se construyó con la ayuda de una herramienta de este tipo: describir la tarea, generar el código y el contenido, revisar el resultado, ajustar. No es un caso hipotético — es literalmente cómo se hizo parte de lo que estás usando en este momento.
</div>

<h2>Supervisión humana: la parte que no cambia</h2>
<p>Claude Code puede actuar con bastante autonomía, pero el diseño incluye puntos de confirmación antes de acciones potencialmente riesgosas (como sobrescribir archivos importantes o ejecutar comandos con efectos difíciles de revertir) — el mismo principio de "confirma antes de una acción irreversible" que viste en <em>Actualidad de la IA</em> sobre agentes en general. Revisar los cambios que propone, antes de aceptarlos, sigue siendo responsabilidad de quien programa.</p>

<h2>¿Reemplaza aprender a programar?</h2>
<p>No. Herramientas como Claude Code hacen mucho más productivo a alguien que <strong>ya entiende</strong> de programación (revisa el código generado con criterio, detecta cuándo algo está mal diseñado) que a alguien que no tiene ninguna base — si te interesa aprender los fundamentos primero, la Academia de Programación y la Academia de Linux de esta plataforma tienen cursos completos para eso, incluido uno dedicado a Git y GitHub.</p>
`,
      quiz('¿Qué distingue a Claude Code de pedirle código a Claude en un chat normal?',
        ['No hay ninguna diferencia real', 'Claude Code corre en tu propio entorno con acceso directo a los archivos del proyecto, pudiendo leer, modificar varios archivos y ejecutar pruebas, en vez de solo generar texto que copias manualmente', 'Claude Code solo funciona sin conexión a internet', 'Claude Code reemplaza por completo la necesidad de saber programar'], 1)),

    text('Uso de herramientas: cuando Claude hace, no solo responde',
      'Buscar en internet, usar integraciones, y hasta controlar una computadora.',
      `
<h2>De "solo conocimiento entrenado" a "puede consultar y actuar"</h2>
<p>Por defecto, un modelo de lenguaje responde solo con lo que aprendió durante su entrenamiento, con una fecha de corte — no sabe, de forma nativa, lo que pasó después de esa fecha. El <strong>uso de herramientas</strong> (<em>tool use</em>) le da a Claude la capacidad de ir más allá: buscar información actual en internet, ejecutar código para hacer cálculos exactos, o conectarse a aplicaciones externas para completar una tarea real.</p>

<h2>Ejemplos de herramientas que Claude puede usar</h2>
<table>
<tr><th>Herramienta</th><th>Qué habilita</th></tr>
<tr><td>Búsqueda web</td><td>Responder con información actual, más allá de su fecha de conocimiento, citando las fuentes que consultó.</td></tr>
<tr><td>Ejecución de código</td><td>Hacer cálculos exactos o procesar datos reales, en vez de "estimar" un resultado numérico de memoria.</td></tr>
<tr><td>Integraciones con aplicaciones</td><td>Conectarse a herramientas externas (como calendarios, sistemas de gestión de proyectos, u otros servicios) para consultar o actualizar información real.</td></tr>
<tr><td>Uso de la computadora (computer use)</td><td>Ver la pantalla y controlar el mouse/teclado para completar tareas en cualquier aplicación, incluso sin una integración específica para ella.</td></tr>
</table>

<h2>MCP: un estándar para conectar herramientas</h2>
<p>Anthropic desarrolló y publicó el <strong>Protocolo de Contexto de Modelo</strong> (MCP, por sus siglas en inglés), un estándar abierto para que cualquier aplicación pueda exponer sus datos y funciones a un asistente de IA de forma estandarizada — en vez de que cada integración se construya desde cero, de forma distinta para cada herramienta. Al ser un estándar abierto, otras empresas y modelos de IA también lo han adoptado, más allá de Claude.</p>

<h2>La regla de oro sigue siendo la misma</h2>
<div class="warn">
⚠️ Como viste en <em>Actualidad de la IA</em>: cuanta más capacidad de actuar le des a un agente (no solo responder, sino ejecutar acciones reales), más importante es supervisar qué permisos tiene y revisar antes de acciones difíciles de revertir. Esto aplica igual de firme cuando la herramienta es Claude.
</div>
`,
      quiz('¿Qué es el MCP (Protocolo de Contexto de Modelo) que desarrolló Anthropic?',
        ['Un modelo de IA competidor de Claude', 'Un estándar abierto para que aplicaciones expongan sus datos y funciones a un asistente de IA de forma estandarizada, en vez de construir cada integración desde cero', 'El nombre comercial de Claude Code', 'Un tipo de licencia de software'], 1)),

    text('Cómo Anthropic construye Claude para que sea seguro',
      'Más allá del marketing: los mecanismos reales detrás de "IA responsable".',
      `
<h2>La misión de Anthropic, en la práctica</h2>
<p>Como viste al inicio del curso, Anthropic se fundó con la misión de que la IA avanzada se desarrolle de forma segura. Eso no es solo una frase — se traduce en decisiones técnicas concretas sobre cómo se entrena y evalúa Claude antes de publicarse.</p>

<h2>IA Constitucional, en más detalle</h2>
<p>Ya viste en el curso <em>Panorama de Modelos de IA</em> que Anthropic desarrolló la técnica de <strong>IA Constitucional</strong>: entrenar al modelo con un conjunto explícito de principios, usando al propio modelo (guiado por esos principios) para evaluar y mejorar sus propias respuestas, en vez de depender únicamente de que miles de personas califiquen respuestas a mano. Esto busca hacer el proceso más consistente y transparente que depender solo de juicio humano caso por caso.</p>

<h2>Pruebas de seguridad ("red teaming")</h2>
<p>Antes de publicar un modelo nuevo, equipos internos (y a veces externos, independientes) intentan activamente encontrar formas en que el modelo podría comportarse mal o ser usado de forma dañina — una práctica llamada <em>red teaming</em> — para corregir esos problemas antes del lanzamiento público, no después.</p>

<h2>Transparencia sobre límites</h2>
<p>Parte del enfoque de "honestidad" incluye que Claude esté diseñado para reconocer cuándo no sabe algo, en vez de inventar una respuesta con confianza (aunque, como viste en <em>Trucos y Consejos</em>, ningún modelo de IA está libre por completo del riesgo de alucinaciones — verificar información importante sigue siendo tu responsabilidad).</p>

<h2>Un balance, no una garantía absoluta</h2>
<div class="warn">
⚠️ Ningún enfoque de seguridad hace que un modelo de IA sea infalible. El objetivo del diseño de Anthropic es reducir riesgos y hacer que Claude sea confiable con más frecuencia — no eliminar por completo la necesidad de que tú apliques criterio propio, especialmente en decisiones importantes.
</div>

<h2>Por qué esto te debería importar como usuario</h2>
<p>Entender que hay un proceso deliberado detrás de cómo se entrena Claude (y, en distinta medida, otros modelos serios de la industria) te ayuda a formar expectativas realistas: ni "la IA es infalible y objetiva" ni "la IA es peligrosa e incontrolable" — es una herramienta construida con decisiones de diseño específicas, con fortalezas y límites reales.</p>
`,
      quiz('¿Qué es el "red teaming" que se hace antes de publicar un modelo nuevo?',
        ['Un torneo de programación', 'La práctica de que equipos intenten activamente encontrar formas en que el modelo podría comportarse mal, para corregirlo antes del lanzamiento público', 'Un tipo de entrenamiento con datos en rojo', 'Un plan de suscripción de Claude'], 1)),

    text('Cierre: tu plan para dominar Claude de verdad',
      'Repaso completo y cómo seguir aprendiendo dentro de la Academia de IA.',
      `
<h2>Repaso del curso completo</h2>
<table>
<tr><th>Función</th><th>Úsala cuando...</th></tr>
<tr><td>Conversación simple</td><td>Preguntas puntuales, aisladas.</td></tr>
<tr><td>Proyectos</td><td>Trabajo sostenido en algo grande, con contexto compartido entre varias conversaciones.</td></tr>
<tr><td>Artefactos</td><td>El resultado es sustancial (documento, código, página) y quieres iterar sobre él sin perderlo entre el texto del chat.</td></tr>
<tr><td>Subir documentos</td><td>Necesitas que Claude trabaje sobre información específica tuya, no solo su conocimiento general.</td></tr>
<tr><td>Pensamiento extendido</td><td>El problema tiene varios pasos lógicos o matemáticos y la precisión importa más que la velocidad.</td></tr>
<tr><td>Claude Code</td><td>Programar sobre un proyecto real, con cambios en varios archivos.</td></tr>
<tr><td>Uso de herramientas</td><td>Necesitas información actual, cálculos exactos, o que se complete una acción real, no solo una respuesta de texto.</td></tr>
</table>

<h2>Tu plan práctico para seguir</h2>
<ol>
<li>Elige una tarea real que ya haces (estudiar, escribir, programar) y aplícale, a propósito, una función nueva de las que viste aquí.</li>
<li>Prueba un Proyecto con algo que estés trabajando durante varias semanas.</li>
<li>La próxima vez que un problema tenga varios pasos, activa el pensamiento extendido y compara.</li>
<li>Si programas, prueba Claude Code en un proyecto pequeño antes de uno importante.</li>
</ol>

<h2>Sigue en la Academia de IA</h2>
<table>
<tr><th>Si quieres…</th><th>Ve a…</th></tr>
<tr><td>Entender de dónde viene todo esto</td><td>Historia de la Inteligencia Artificial</td></tr>
<tr><td>Comparar Claude con otros modelos con criterio</td><td>Panorama de Modelos de IA</td></tr>
<tr><td>Escribir mejores instrucciones en general</td><td>Prompt Engineering desde Cero</td></tr>
<tr><td>Generar imágenes, audio o video</td><td>IA Generativa: Imágenes, Audio y Video</td></tr>
<tr><td>Pensar en el impacto más amplio de la IA</td><td>Ética e Impacto de la IA en la Sociedad</td></tr>
</table>

<div class="tip">
💡 Este curso, como toda esta academia, lo puedes seguir conversando con tu mascota de IA — pregúntale por cualquier duda sobre Proyectos, Artefactos o cualquier función que hayas visto aquí.
</div>
`,
      quiz('Según el repaso del curso, ¿cuándo conviene usar Artefactos en vez de una respuesta normal en el chat?',
        ['Nunca, es una función decorativa sin uso real', 'Cuando el resultado es sustancial (documento, código, página) y quieres iterar sobre él sin perderlo entre el texto del chat', 'Solo para preguntas de una sola palabra', 'Solo cuando no tienes conexión a internet'], 1)),
  ],
}
