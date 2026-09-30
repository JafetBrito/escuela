// Curso "Historia de los Agentes de IA Autónomos". Solo texto + quizzes.
import { quiz, text } from '../linux-courses/helpers.mjs'

export const historiaAgentes = {
  id: 'course-historia-agentes-ia',
  title: 'Historia de los Agentes de IA Autónomos',
  description: 'De los primeros experimentos virales que ataban un modelo de lenguaje a un bucle de "piensa y actúa", a los asistentes personales de código abierto y las herramientas que coordinan equipos completos de agentes. La historia reciente y en curso de cómo la IA pasó de responder a actuar.',
  ai_instructions: 'Eres el Mago, profesor de la Escuela de Programación de Oliver Academy, guiando el curso "Historia de los Agentes de IA Autónomos". Este es un tema MUY reciente (2023 en adelante) y en desarrollo activo — sé especialmente cuidadoso en distinguir hechos bien documentados de percepciones o hype del momento, y aclara siempre que tu conocimiento tiene una fecha de corte y que el panorama sigue cambiando. Nunca inventes fechas o cifras exactas que no recuerdes con certeza — di que no estás seguro en vez de aproximar como si fuera un hecho.',
  icon: '🤖',
  color: '#0ea5e9',
  category: 'Programación',
  subcategory: 'Código Abierto',
  difficulty: 'intermedio',
  locked: false,
  modules: [
    text('Bienvenida: la historia más reciente de esta escuela',
      'De "responder preguntas" a "hacer el trabajo" — una transición que está ocurriendo mientras tomas este curso.',
      `
<h2>Un tipo de historia distinto</h2>
<p>Los demás cursos de historia de esta escuela (<em>Historia de la Inteligencia Artificial</em>, <em>Historia de Linux</em>) cubren décadas, con hechos bien documentados y asentados. Este curso es distinto: cubre apenas un puñado de años (2023 en adelante), un periodo tan reciente que todavía está <strong>ocurriendo</strong> mientras lo estudias. Trátalo con esa perspectiva.</p>

<h2>El hilo conductor: de responder a actuar</h2>
<p>Como viste en <em>Actualidad de la IA</em>, la tendencia central de este periodo es el paso de <strong>chatbots que responden</strong> a <strong>agentes que actúan</strong> — este curso cuenta esa historia con más detalle: quién empezó a experimentar con esto, qué proyectos marcaron el camino, y cómo llegamos a herramientas como OpenClaw y Paperclip, que ya conoces de los cursos anteriores.</p>

<h2>El mapa del curso</h2>
<table>
<tr><th>Parte</th><th>Qué vas a ver</th></tr>
<tr><td>1. Los primeros experimentos virales</td><td>Cuando "atar" un modelo a un bucle de acción se volvió una idea popular.</td></tr>
<tr><td>2. Los agentes de código</td><td>De sugerir líneas sueltas a resolver tareas de programación completas.</td></tr>
<tr><td>3. Asistentes personales siempre activos</td><td>El salto de la terminal a tus apps de mensajería de siempre.</td></tr>
<tr><td>4. La capa de orquestación</td><td>Cuando coordinar varios agentes se volvió su propio problema por resolver.</td></tr>
<tr><td>5. Hacia dónde parece ir esto</td><td>Con toda la humildad que exige predecir un campo que cambia cada mes.</td></tr>
</table>

<div class="warn">
⚠️ Más que ningún otro curso de esta escuela, aquí es fundamental recordar: lo que leas puede haber cambiado ya para cuando lo leas. Usa este curso para entender el <strong>patrón</strong> de cómo llegamos hasta aquí, no como una lista definitiva y final de nombres de productos.
</div>
`,
      quiz('¿Cuál es el hilo conductor de este curso?',
        ['La historia completa de la informática desde 1950', 'El paso, muy reciente, de "chatbots que responden" a "agentes que actúan" de forma cada vez más autónoma', 'Solo la historia de una empresa específica', 'La historia de los videojuegos'], 1)),

    text('Los primeros experimentos: atar un modelo a un bucle',
      'La idea simple (y viral) detrás de los primeros "agentes autónomos" de 2023.',
      `
<h2>Una idea sorprendentemente simple</h2>
<p>La idea central de un agente autónomo temprano es, en el fondo, muy simple: en vez de que una persona converse con el modelo mensaje por mensaje, se le da un objetivo general, y un programa alrededor del modelo lo pone en un <strong>bucle</strong>: el modelo decide qué hacer, el programa ejecuta esa acción (buscar algo, escribir un archivo, ejecutar un comando), le devuelve el resultado al modelo, y el modelo decide el siguiente paso — repitiendo esto una y otra vez hasta considerar terminado el objetivo, sin que un humano intervenga en cada paso individual.</p>

<h2>2023: el año en que la idea se volvió viral</h2>
<p>A principios de 2023, poco después de que GPT-4 estuviera disponible (como viste en <em>Historia de la IA</em>), varios proyectos de código abierto que implementaban esta idea de "modelo en bucle con un objetivo" se volvieron extremadamente populares muy rápido, generando una enorme ola de interés y experimentación sobre "agentes autónomos de IA" en toda la comunidad de desarrolladores — mucha gente probándolos por primera vez, con resultados que iban de sorprendentes a decepcionantes.</p>

<h2>Las limitaciones reales de esa primera ola</h2>
<table>
<tr><th>Problema común</th><th>Por qué pasaba</th></tr>
<tr><td>Bucles improductivos</td><td>El agente repetía variaciones de la misma acción fallida sin darse cuenta, gastando cómputo sin avanzar.</td></tr>
<tr><td>Pérdida del objetivo original</td><td>En tareas largas, el "hilo" del objetivo inicial se perdía o se distorsionaba con cada paso.</td></tr>
<tr><td>Sin verificación real</td><td>El agente podía "creer" que había completado una tarea sin haberla completado correctamente.</td></tr>
<tr><td>Costo elevado</td><td>Cada paso del bucle consumía llamadas al modelo, y las tareas largas podían salir caras.</td></tr>
</table>
<p>Estas limitaciones son, en gran medida, la razón por la que los cursos de <em>Actualidad de la IA</em> y <em>Paperclip</em> insisten tanto en presupuestos y puntos de aprobación humana — son lecciones aprendidas directamente de esta primera ola.</p>

<h2>Por qué importó de todas formas</h2>
<p>Aunque esos primeros proyectos eran imperfectos en la práctica, demostraron algo importante: que la idea de "un modelo actuando en bucle hacia un objetivo" era técnicamente posible y capturaba la imaginación de miles de desarrolladores a la vez — sembrando el interés que, con el tiempo, maduraría en herramientas mucho más confiables.</p>

<div class="tip">
💡 Este patrón — una idea imperfecta pero viral que abre camino a versiones mucho mejores después — ya lo viste en <em>Historia de la IA</em> con las redes neuronales de los 80: a veces el primer intento imperfecto es lo que demuestra que vale la pena seguir invirtiendo en la idea.
</div>
`,
      quiz('¿Cuál era la idea central detrás de los primeros "agentes autónomos" populares de 2023?',
        ['Un chatbot que solo responde una pregunta a la vez', 'Un modelo puesto en un bucle: decide una acción, un programa la ejecuta, el resultado vuelve al modelo, y repite hasta considerar terminado el objetivo', 'Un modelo que solo genera imágenes', 'Un sistema que reemplaza por completo a los programadores humanos'], 1)),

    text('Los agentes de código: de sugerir líneas a resolver tareas completas',
      'Cómo la programación fue de las primeras áreas en madurar esta idea de agentes.',
      `
<h2>Por qué programar fue un terreno natural para los agentes</h2>
<p>La programación tiene una ventaja única para los agentes de IA: los resultados se pueden <strong>verificar automáticamente</strong> — el código o funciona (pasa las pruebas, compila, hace lo que debía) o no funciona. Esa retroalimentación clara y objetiva hace que sea mucho más fácil que un agente sepa si va por buen camino, comparado con tareas más subjetivas.</p>

<h2>La evolución en etapas, revisitada</h2>
<p>Como viste en <em>Actualidad de la IA</em>, la programación asistida por IA pasó por etapas: del autocompletado dentro del editor, a un chat conversacional donde copiabas y pegabas código manualmente, hasta agentes que trabajan directamente sobre un proyecto completo — leyendo varios archivos, haciendo cambios coordinados, y ejecutando pruebas por sí mismos.</p>

<h2>Herramientas que marcaron esta transición</h2>
<table>
<tr><th>Tipo de herramienta</th><th>Ejemplos que ya conoces</th></tr>
<tr><td>Agentes de código de los laboratorios de modelos</td><td>Claude Code (Anthropic), Codex (OpenAI) — viste el primero a fondo en <em>Domina Claude</em>.</td></tr>
<tr><td>Editores con IA integrada como agente</td><td>Herramientas como Cursor, que integran capacidades de agente directamente en el flujo de edición.</td></tr>
<tr><td>Agentes de código abierto especializados</td><td>Proyectos de la comunidad enfocados específicamente en resolver tareas de programación de forma autónoma.</td></tr>
</table>

<h2>Lo que estos agentes demostraron</h2>
<p>Los agentes de código ayudaron a demostrar, con evidencia concreta y verificable (pruebas que pasan, código que funciona), que un modelo de lenguaje puede completar tareas de varios pasos con bastante fiabilidad cuando tiene <strong>retroalimentación clara</strong> en cada paso — una lección que después se extendió a otros dominios, aunque con más dificultad al no tener siempre una forma tan objetiva de verificar el éxito.</p>

<div class="tip">
💡 Si tomaste <em>Domina Claude</em>, ya viste de primera mano cómo funciona un agente de código moderno — este módulo te da el contexto histórico de por qué la programación fue, específicamente, donde esta tecnología maduró primero.
</div>
`,
      quiz('¿Por qué la programación fue un terreno particularmente favorable para que maduraran los primeros agentes de IA confiables?',
        ['Porque programar es más fácil que cualquier otra tarea', 'Porque los resultados se pueden verificar automáticamente (el código funciona o no), dándole al agente retroalimentación clara y objetiva en cada paso', 'Porque no requiere ningún tipo de supervisión humana', 'Porque los agentes de código no cometen errores'], 1)),

    text('De la terminal a tus apps de siempre: los asistentes personales',
      'Cuando los agentes dejaron de vivir solo en una terminal de programador.',
      `
<h2>Un salto de audiencia, no solo de tecnología</h2>
<p>Los primeros agentes autónomos vivían casi exclusivamente en la terminal, pensados para desarrolladores cómodos con la línea de comandos. El siguiente paso natural fue llevar esa misma capacidad a donde la gente <strong>ya</strong> pasa su tiempo: WhatsApp, Telegram, Discord, Slack — las mismas apps de mensajería de todos los días, no una herramienta técnica aparte.</p>

<h2>OpenClaw como ejemplo de esta ola</h2>
<p>Como viste en el curso <em>OpenClaw</em> de esta escuela, ese proyecto representa exactamente este movimiento: un asistente capaz de actuar (no solo responder), que corre en tu propio hardware por privacidad, y que te encuentra en los canales que ya usas, en vez de obligarte a abrir una interfaz nueva y aprenderla desde cero.</p>

<h2>Por qué este cambio de canal importa tanto</h2>
<table>
<tr><th>Antes</th><th>Después</th></tr>
<tr><td>Necesitabas saber usar una terminal.</td><td>Le escribes como a cualquier contacto en tu app de mensajería favorita.</td></tr>
<tr><td>El asistente era una herramienta técnica aparte de tu vida digital.</td><td>El asistente vive dentro de tu flujo normal de comunicación.</td></tr>
<tr><td>Uso limitado a desarrolladores y entusiastas técnicos.</td><td>Accesible para cualquier persona que ya usa WhatsApp o Telegram.</td></tr>
</table>

<h2>El otro lado de la moneda: privacidad y control</h2>
<p>Llevar un asistente con capacidad de actuar a tus canales personales de mensajería plantea preguntas de privacidad más directas que un chatbot de escritorio — por eso, como viste en el curso de <em>OpenClaw</em>, el diseño de este tipo de herramientas pone tanto énfasis en que el estado y las credenciales vivan en tu propio hardware, y en tratar los mensajes entrantes como no confiables por defecto.</p>

<div class="tip">
💡 Este patrón — llevar una tecnología de un círculo técnico especializado al uso cotidiano de cualquier persona — es exactamente el mismo que viste con ChatGPT en <em>Historia de la IA</em>: la tecnología de fondo ya existía en formas más limitadas; lo que cambia todo es hacerla accesible en el lugar donde la gente ya está.
</div>
`,
      quiz('¿Qué representa el paso de "agentes solo en la terminal" a "agentes en WhatsApp/Telegram/Discord"?',
        ['No representa ningún cambio real', 'Un salto de audiencia: de herramientas técnicas para desarrolladores a algo accesible para cualquier persona, dentro de las apps que ya usa a diario', 'Un retroceso tecnológico', 'Solo un cambio de nombre, sin diferencia funcional'], 1)),

    text('La capa de orquestación: cuando coordinar agentes se volvió su propio problema',
      'De "tengo un agente" a "tengo veinte agentes y no sé qué hace cada uno".',
      `
<h2>Un problema que solo aparece a escala</h2>
<p>Usar un solo agente de IA es manejable — lo ves trabajar, revisas el resultado, listo. El problema nuevo apareció cuando la gente empezó a usar <strong>varios agentes a la vez</strong>, para distintas tareas: de pronto, coordinar quién hace qué, cuánto gasta cada uno, y si alguno se quedó atascado, se volvió un problema en sí mismo — separado del problema original de "hacer que un agente funcione bien".</p>

<h2>Paperclip como respuesta a este problema</h2>
<p>Como viste en el curso <em>Paperclip</em> de esta escuela, ese proyecto nació específicamente para resolver este problema de segundo orden: no "cómo hago que un agente sea bueno", sino "cómo organizo, superviso y controlo el costo de <strong>varios</strong> agentes trabajando a la vez, posiblemente de distintos proveedores".</p>

<h2>Un patrón que ya conoces de la historia de la computación</h2>
<p>Este tipo de evolución — una tecnología nueva madura, y después aparece una capa de gestión y coordinación encima de ella — no es nuevo en la historia de la computación:</p>
<table>
<tr><th>Tecnología base</th><th>Capa de gestión que apareció después</th></tr>
<tr><td>Servidores individuales</td><td>Herramientas de orquestación de contenedores (como Kubernetes)</td></tr>
<tr><td>Empleados individuales en una empresa</td><td>Sistemas de gestión de proyectos y recursos humanos</td></tr>
<tr><td>Agentes de IA individuales</td><td>Herramientas de orquestación como Paperclip</td></tr>
</table>

<h2>Por qué esto sugiere que el campo está madurando</h2>
<p>La aparición de una "capa de gestión" dedicada suele ser una señal de que una tecnología pasó de ser un experimento novedoso a algo que la gente usa de forma seria y sostenida — nadie construye herramientas de organigrama y presupuesto para algo que todavía es solo un juguete experimental. El hecho de que existan proyectos como Paperclip sugiere que, para 2025-2026, coordinar varios agentes de IA ya era un problema real y recurrente para suficiente gente como para justificar construir una solución dedicada.</p>
`,
      quiz('¿Qué sugiere la aparición de herramientas de orquestación como Paperclip sobre el estado del campo de los agentes de IA?',
        ['Que los agentes de IA fracasaron por completo', 'Que el uso de agentes de IA maduró lo suficiente como para que coordinar varios a la vez se volviera un problema real y recurrente, que justifica una solución dedicada', 'Que ya no se necesitan agentes individuales', 'Que este problema nunca existió antes en la historia de la computación'], 1)),

    text('Hacia dónde parece ir esto (con toda la humildad necesaria)',
      'Tendencias razonables, no predicciones certeras — la diferencia importa.',
      `
<h2>Por qué esta clase es distinta a una predicción segura</h2>
<p>Predecir hacia dónde va un campo que cambia cada pocos meses es, por definición, arriesgado. Esta clase no te da certezas — te da <strong>tendencias razonables</strong> a partir de lo que ya viste en este curso, con la honestidad de que podrían no cumplirse exactamente así.</p>

<h2>Tendencias que parecen razonables a partir de lo visto</h2>
<table>
<tr><th>Tendencia</th><th>Por qué parece razonable, según lo que ya viste</th></tr>
<tr><td>Más verificación automática antes de confiar en un agente</td><td>La lección de los bucles improductivos de 2023 (módulo 2) sigue siendo relevante — la confianza se gana con retroalimentación verificable.</td></tr>
<tr><td>Más capas de gobernanza y presupuesto, no menos</td><td>Paperclip resuelve un problema real; es razonable esperar que ese tipo de herramienta se vuelva más común, no una rareza.</td></tr>
<tr><td>Agentes cada vez más presentes en canales cotidianos</td><td>El patrón de OpenClaw (llevar la IA a donde la gente ya está) es consistente con cómo se adoptó la tecnología anteriormente (módulo 4).</td></tr>
<tr><td>Regulación específica para agentes autónomos</td><td>Como viste en <em>Actualidad de la IA</em>, la regulación de IA en general ya está en marcha; es razonable que agentes con capacidad de actuar (no solo responder) reciban atención regulatoria específica.</td></tr>
</table>

<h2>Lo que este curso NO te puede decir con certeza</h2>
<ul>
<li>Qué proyecto específico "ganará" en este espacio — los nombres y líderes del mercado cambian rápido.</li>
<li>Cuándo (o si) los agentes autónomos llegarán a ser tan confiables como para necesitar mínima supervisión humana en tareas importantes.</li>
<li>Cómo evolucionará exactamente la regulación en cada país.</li>
</ul>

<div class="warn">
⚠️ Si en el futuro lees sobre un proyecto nuevo en este espacio que no se menciona en este curso, eso no es un error del curso — es exactamente la naturaleza de estudiar un campo que sigue en movimiento. Usa el patrón que aprendiste aquí (de responder → actuar → coordinar varios agentes) para entender dónde encaja cualquier herramienta nueva que encuentres.
</div>

<h2>Cierre del curso</h2>
<p>Viste el arco completo: los primeros experimentos virales e imperfectos, la maduración en el terreno de la programación, el salto a asistentes personales como OpenClaw, y la aparición de la capa de orquestación con Paperclip. Es una historia corta pero densa, y sigue escribiéndose — con las herramientas de esta escuela, ahora tienes el contexto para seguirla entendiendo, no solo reaccionando a cada titular nuevo.</p>
`,
      quiz('¿Cuál es la actitud correcta al leer sobre un proyecto de agentes de IA muy nuevo que no aparece en este curso?',
        ['Asumir que el curso está mal hecho', 'Reconocer que es normal en un campo que cambia rápido, y usar el patrón aprendido (responder → actuar → coordinar) para entender dónde encaja esa herramienta nueva', 'Ignorar cualquier información posterior a este curso', 'Asumir que ningún proyecto nuevo puede ser legítimo'], 1)),
  ],
}
