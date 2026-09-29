// Curso "Trucos y Consejos para Sacarle el Máximo Provecho a la IA". Solo texto + quizzes.
import { quiz, text } from '../linux-courses/helpers.mjs'

export const trucos = {
  id: 'course-ia-trucos',
  title: 'Trucos y Consejos para Sacarle el Máximo Provecho a la IA',
  description: 'Lo que separa a quien usa la IA "para preguntas rápidas" de quien de verdad multiplica su trabajo con ella: dar contexto, iterar, pedir que piense paso a paso, verificar lo que responde, y los errores más comunes que le restan valor a cada conversación.',
  ai_instructions: 'Eres Ada, profesora de la Academia de IA de Oliver Academy, guiando el curso "Trucos y Consejos para Sacarle el Máximo Provecho a la IA". Da consejos prácticos y accionables, con ejemplos concretos de "antes/después" de un prompt. Sé honesta sobre las limitaciones reales de los asistentes de IA (pueden inventar datos, pueden estar desactualizados) y siempre recuerda al alumno que debe verificar información importante en vez de confiar ciegamente. Sé breve en el chat, cercana y práctica.',
  icon: '💡',
  color: '#fbbf24',
  category: 'Inteligencia Artificial',
  subcategory: 'Herramientas de IA',
  difficulty: 'principiante',
  locked: false,
  modules: [
    text('Bienvenida: la diferencia entre "usar IA" y usarla bien',
      'La misma herramienta, resultados muy distintos según cómo la uses.',
      `
<h2>El mismo modelo, resultados muy distintos</h2>
<p>Dos personas usan exactamente el mismo asistente de IA. Una escribe "hazme un plan de estudio" y recibe algo genérico que no usa. La otra le da contexto, itera, y termina con un plan que de verdad sigue. La diferencia no está en el modelo — está en <strong>cómo lo usan</strong>. Este curso es una colección de hábitos concretos, no trucos mágicos: cosas simples que, una vez que las conoces, no vuelves a usar la IA de la misma forma superficial.</p>

<h2>Lo que vas a aprender</h2>
<table>
<tr><th>Tema</th><th>La idea central</th></tr>
<tr><td>Contexto</td><td>La IA no lee tu mente — dale lo que necesita saber.</td></tr>
<tr><td>Iterar</td><td>La primera respuesta casi nunca es la final; corrige en conversación.</td></tr>
<tr><td>Pedir el razonamiento</td><td>Pedir que "piense en voz alta" mejora respuestas complejas.</td></tr>
<tr><td>Verificar</td><td>La IA puede inventar datos con total confianza — cómo detectarlo.</td></tr>
<tr><td>Usos por tarea</td><td>Escribir, programar, estudiar, investigar: cada uno pide un enfoque distinto.</td></tr>
</table>

<div class="warn">
⚠️ Este curso enseña <strong>hábitos generales</strong>, útiles con cualquier asistente (Claude, GPT, Gemini...). El curso <em>Prompt Engineering desde cero</em> de esta misma academia profundiza en la técnica de escribir instrucciones; aquí nos enfocamos en el flujo completo de trabajar con IA, no solo en el prompt inicial.
</div>
`,
      quiz('¿Cuál es la idea central de este curso?',
        ['Que todos los modelos de IA dan siempre el mismo resultado sin importar cómo los uses', 'Que la forma en que usas la IA (contexto, iteración, verificación) cambia radicalmente el resultado, más allá de qué modelo elijas', 'Que solo hay una forma correcta de escribir un prompt', 'Que la IA nunca se equivoca'], 1)),

    text('El contexto lo es casi todo',
      'La diferencia entre una respuesta genérica y una que de verdad te sirve.',
      `
<h2>La IA no sabe lo que no le dices</h2>
<p>Un error muy común: tratar a la IA como si ya supiera tu situación. "Ayúdame con mi presentación" le da al modelo casi nada con qué trabajar, así que responde con algo genérico. Compara:</p>

<div class="example">
<strong>Antes:</strong> "Ayúdame con mi presentación."<br>
<strong>Después:</strong> "Voy a presentar en 10 minutos a un grupo de compañeros de secundaria un resumen del curso de Historia de la IA. Ya tengo el contenido en texto — ayúdame a organizarlo en 6 diapositivas, con un título llamativo por diapositiva y máximo 3 puntos de texto en cada una."
</div>

<h2>Qué tipo de contexto suele importar</h2>
<table>
<tr><th>Contexto</th><th>Por qué ayuda</th></tr>
<tr><td>Quién es la audiencia</td><td>No es lo mismo explicarle a un niño que a un experto.</td></tr>
<tr><td>El formato que necesitas</td><td>Lista, tabla, párrafo, código — dilo explícitamente.</td></tr>
<tr><td>Restricciones reales</td><td>Longitud, tiempo, herramientas disponibles, nivel de detalle.</td></tr>
<tr><td>Lo que ya intentaste</td><td>Evita que te repita algo que ya probaste y no funcionó.</td></tr>
<tr><td>El objetivo final</td><td>No es lo mismo "quiero un resumen" que "quiero un resumen para memorizar antes de un examen".</td></tr>
</table>

<h2>El truco de "actúa como"</h2>
<p>Pedirle a la IA que adopte un rol específico ("actúa como un editor exigente", "actúa como un tutor de matemáticas paciente que nunca da la respuesta directa") ajusta el tono y el enfoque de sus respuestas de forma sorprendentemente efectiva — porque el rol implica, de forma implícita, mucho contexto sobre cómo debe comportarse.</p>

<div class="tip">
💡 <strong>Hábito para toda la vida:</strong> antes de enviar un prompt corto, pregúntate: "¿un compañero humano, sin más información que esta frase, sabría exactamente qué necesito?" Si la respuesta es no, agrégale contexto.
</div>
`,
      quiz('¿Por qué "ayúdame con mi presentación" suele dar peores resultados que un prompt con contexto?',
        ['Porque la IA se enoja con prompts cortos', 'Porque la IA no puede adivinar la audiencia, el formato ni el objetivo si no se los dices', 'Porque los prompts cortos están prohibidos', 'No hay ninguna diferencia real'], 1)),

    text('Iterar: la primera respuesta casi nunca es la final',
      'Conversar con la IA, no solo hacerle una pregunta y aceptar lo primero que diga.',
      `
<h2>Un chat, no un buscador</h2>
<p>Mucha gente usa la IA como un buscador: escribe una pregunta, lee la respuesta, se va. Pero a diferencia de un buscador, la IA recuerda el resto de la conversación (dentro de la misma sesión) y puede <strong>refinar</strong> su respuesta si le das retroalimentación. Ese ida y vuelta es donde está el verdadero valor.</p>

<h2>Frases que mejoran casi cualquier respuesta</h2>
<table>
<tr><th>Frase</th><th>Cuándo usarla</th></tr>
<tr><td>"Hazlo más corto / más largo"</td><td>Cuando el nivel de detalle no es el que necesitas.</td></tr>
<tr><td>"Explícamelo como si tuviera 12 años"</td><td>Cuando la respuesta usó demasiada jerga.</td></tr>
<tr><td>"Dame 3 alternativas distintas"</td><td>Cuando quieres comparar opciones, no solo una.</td></tr>
<tr><td>"¿Qué le falta a esta respuesta?"</td><td>Para que la propia IA identifique huecos.</td></tr>
<tr><td>"No me gustó la parte de ___, cámbiala por ___"</td><td>Corrección quirúrgica, sin reescribir todo el prompt.</td></tr>
</table>

<h2>El error de "empezar de cero" cada vez</h2>
<p>Si la primera respuesta no te convence del todo, no borres todo y reescribas un prompt nuevo desde cero — sigue en la misma conversación y corrige. El modelo ya tiene el contexto de lo que pediste y lo que no funcionó; aprovéchalo.</p>

<h2>Divide tareas grandes en pasos</h2>
<p>Para una tarea compleja (por ejemplo, escribir un ensayo largo), en vez de pedir todo de un solo prompt, funciona mejor dividirlo: primero pide una estructura o esquema, revísala y ajústala, y luego pide que desarrolle cada sección. Tú mantienes el control de la dirección en cada paso, en vez de recibir un resultado final que hay que rehacer por completo si algo no te convence.</p>

<div class="tip">
💡 Piensa en la IA como un colaborador con quien trabajas en tiempo real, no como una máquina expendedora donde metes una moneda (el prompt) y sale un producto terminado.
</div>
`,
      quiz('¿Cuál es la mejor forma de mejorar una respuesta que no te convenció del todo?',
        ['Cerrar el chat y escribir un prompt completamente nuevo desde cero cada vez', 'Seguir en la misma conversación y darle retroalimentación específica sobre qué cambiar', 'Aceptar la primera respuesta siempre, sin corregir', 'Repetir exactamente el mismo prompt varias veces'], 1)),

    text('Pídele que piense paso a paso',
      'Por qué "razonar en voz alta" mejora tanto las respuestas a problemas complejos.',
      `
<h2>Un truco simple con base real</h2>
<p>Para problemas que requieren varios pasos de razonamiento (matemáticas, lógica, decisiones con varios factores), pedirle al modelo que <strong>explique su razonamiento paso a paso antes de dar la respuesta final</strong> suele mejorar notablemente la precisión. A esta técnica se le conoce, en la investigación de IA, como <em>chain-of-thought</em> ("cadena de pensamiento").</p>

<div class="example">
<strong>Antes:</strong> "¿Cuánto necesito ahorrar al mes para juntar $50,000 en 2 años si ya tengo $8,000?"<br>
<strong>Después:</strong> "Resuelve esto paso a paso, mostrando cada cálculo: ¿Cuánto necesito ahorrar al mes para juntar $50,000 en 2 años si ya tengo $8,000?"
</div>

<h2>¿Por qué funciona?</h2>
<p>Un modelo de lenguaje genera su respuesta palabra por palabra, sin "volver atrás" a corregirse una vez que empezó. Si le pides el razonamiento primero, cada paso intermedio queda escrito antes de la conclusión — y la conclusión se construye apoyándose en esos pasos ya expuestos, en vez de tener que "adivinar" el resultado final de un salto. Es parecido a por qué a los humanos también nos sirve mostrar el trabajo en un examen de matemáticas: pensar en voz alta reduce errores.</p>

<h2>Modelos de razonamiento: la versión "automática" de este truco</h2>
<p>Algunos modelos recientes (a veces llamados modelos de "razonamiento") ya hacen este proceso de pensar paso a paso internamente, antes de responder, sin que tengas que pedirlo explícitamente — útil especialmente para matemáticas, código o problemas lógicos complejos, aunque suelen tardar un poco más en responder que un modelo estándar.</p>

<h2>Cuándo NO hace falta este truco</h2>
<p>Para preguntas simples ("¿cuál es la capital de Francia?"), pedir razonamiento paso a paso es innecesario y solo alarga la respuesta. Resérvalo para problemas donde de verdad hay varios pasos lógicos o numéricos involucrados.</p>

<div class="tip">
💡 Frase simple para recordar: <strong>"resuélvelo paso a paso"</strong> o <strong>"explica tu razonamiento antes de la respuesta final"</strong> — dos de las frases con más impacto real en la calidad de respuestas complejas.
</div>
`,
      quiz('¿Por qué pedirle a la IA que "piense paso a paso" mejora las respuestas a problemas complejos?',
        ['Porque hace que el modelo se conecte a internet', 'Porque cada paso intermedio queda escrito y la respuesta final se apoya en ellos, en vez de "adivinar" el resultado de un salto', 'Porque cuesta más dinero', 'No tiene ningún efecto real'], 1)),

    text('Verifica: la IA puede inventar con total confianza',
      'Qué son las "alucinaciones" y cómo detectarlas antes de que te causen un problema.',
      `
<h2>¿Qué es una "alucinación" de IA?</h2>
<p>Se le llama <strong>alucinación</strong> a cuando un modelo de IA genera información que suena convincente y segura, pero es <strong>falsa</strong> — una cita que no existe, una fecha incorrecta, una función de programación que no existe en esa librería. No es que el modelo "mienta" a propósito: predice la secuencia de palabras más probable según lo que aprendió, y a veces esa secuencia probable no corresponde a un hecho real.</p>

<h2>¿Por qué pasa esto?</h2>
<p>Un modelo de lenguaje no tiene una base de datos donde "consulta" hechos como lo haría una enciclopedia — genera texto prediciendo la siguiente palabra más probable, entrenado en enormes cantidades de texto. Para temas muy documentados, esa predicción suele ser correcta. Para detalles muy específicos, poco comunes, o simplemente inventados por el usuario en la pregunta, el modelo puede generar algo que suena igual de seguro sin serlo.</p>

<h2>Dónde el riesgo es mayor</h2>
<table>
<tr><th>Situación de alto riesgo</th><th>Por qué</th></tr>
<tr><td>Citas, referencias y fuentes exactas</td><td>Es fácil que el modelo "arme" una cita creíble pero inexistente.</td></tr>
<tr><td>Fechas, cifras y estadísticas precisas</td><td>Los números específicos son fáciles de inventar de forma convincente.</td></tr>
<tr><td>Eventos recientes</td><td>Los modelos tienen una fecha de corte de conocimiento y pueden no saber (o inventar) sobre algo posterior.</td></tr>
<tr><td>Código con funciones muy específicas</td><td>Puede inventar nombres de funciones que no existen en esa versión de la librería.</td></tr>
</table>

<h2>Cómo verificar sin volverte paranoico</h2>
<ul>
<li>Para datos importantes (cifras, citas, fechas), pide la fuente y compruébala tú mismo.</li>
<li>Si algo suena "demasiado perfecto" para tu pregunta, sospecha un poco más.</li>
<li>Pregúntale directamente: <em>"¿estás seguro de este dato, o podrías estar equivocándote?"</em> — a veces el modelo reconoce la incertidumbre si se lo preguntas explícitamente.</li>
<li>Para decisiones importantes (médicas, legales, financieras), usa la IA como punto de partida, nunca como única fuente.</li>
</ul>

<div class="warn">
⚠️ Cuanto más segura de sí misma <em>suena</em> una respuesta, no significa que sea más correcta. El tono confiado de un modelo de IA no es una señal fiable de precisión.
</div>
`,
      quiz('¿Qué es una "alucinación" en el contexto de la IA?',
        ['Un error del navegador', 'Cuando el modelo genera información falsa que suena convincente y segura, sin darse cuenta de que es incorrecta', 'Un tipo de imagen generada por IA', 'Un límite en el número de mensajes por día'], 1)),

    text('Escribir, editar y estudiar con IA',
      'Usos concretos donde la IA rinde muy bien, con ejemplos listos para copiar.',
      `
<h2>Como compañero de escritura</h2>
<table>
<tr><th>Tarea</th><th>Cómo pedirlo</th></tr>
<tr><td>Superar el "folio en blanco"</td><td>"Dame 5 formas distintas de empezar un texto sobre ___."</td></tr>
<tr><td>Mejorar claridad</td><td>"Reescribe este párrafo para que sea más claro, sin cambiar el significado: [pega tu texto]"</td></tr>
<tr><td>Ajustar el tono</td><td>"Reescribe esto con un tono más formal / más cercano / más directo."</td></tr>
<tr><td>Recibir crítica honesta</td><td>"Actúa como un editor exigente y dime los 3 puntos más débiles de este texto."</td></tr>
</table>

<h2>Como ayuda de estudio</h2>
<ul>
<li><strong>Explicaciones a tu medida:</strong> "Explícame la fotosíntesis como si nunca hubiera estudiado biología" vs. "...como si ya supiera química básica" — mismo tema, dos niveles distintos.</li>
<li><strong>Autoevaluación:</strong> "Hazme 5 preguntas de opción múltiple sobre este tema para comprobar si lo entendí" — y luego pide que te explique por qué una respuesta era incorrecta si fallas.</li>
<li><strong>La técnica Feynman con IA:</strong> explícale tú el tema con tus propias palabras y pídele que señale qué parte de tu explicación es confusa o incorrecta — obliga a tu cerebro a procesar el tema activamente, en vez de solo leer una respuesta pasivamente.</li>
</ul>

<h2>Como ayuda para programar</h2>
<ul>
<li>Pide que explique un error exacto (pega el mensaje de error completo, no solo "no funciona").</li>
<li>Pide que comente el código línea por línea si estás aprendiendo, no solo que lo genere.</li>
<li>Verifica siempre el código antes de ejecutarlo — un modelo puede inventar el nombre de una función que no existe (ver la clase anterior).</li>
</ul>

<div class="tip">
💡 Regla general: la IA es excelente para <strong>generar un primer borrador</strong> y para <strong>reaccionar a algo que ya escribiste</strong> — es menos confiable cuando le pides "la verdad definitiva" sobre un dato muy específico sin que tú lo revises.
</div>
`,
      quiz('Según la técnica Feynman aplicada con IA, ¿qué deberías hacer tú, en vez de solo pedirle una explicación?',
        ['Pedirle siempre la respuesta más larga posible', 'Explicarle el tema TÚ con tus propias palabras y pedirle que señale qué parte es confusa o incorrecta', 'Copiar y pegar la respuesta sin leerla', 'Nunca usar IA para estudiar'], 1)),

    text('Errores comunes que le restan valor a la IA',
      'Lo que hace que la gente diga "la IA no sirve" cuando el problema era cómo la usaban.',
      `
<h2>Los errores más frecuentes</h2>
<table>
<tr><th>Error</th><th>Por qué pasa</th><th>Cómo evitarlo</th></tr>
<tr><td>Prompts demasiado vagos</td><td>Sin contexto, la respuesta es genérica.</td><td>Ver la clase de contexto: audiencia, formato, objetivo.</td></tr>
<tr><td>Aceptar la primera respuesta siempre</td><td>Se pierde la oportunidad de iterar.</td><td>Trátalo como conversación, no como consulta única.</td></tr>
<tr><td>Confiar ciegamente en cifras y citas</td><td>No todos saben que existen las alucinaciones.</td><td>Verifica datos importantes con una fuente real.</td></tr>
<tr><td>No decirle qué NO quieres</td><td>El modelo no sabe qué evitar si no se lo dices.</td><td>"No uses jerga técnica", "sin emojis", "máximo 100 palabras".</td></tr>
<tr><td>Pedir todo en un solo mensaje gigante</td><td>Tareas complejas se benefician de pasos.</td><td>Divide en partes, como viste en la clase de iteración.</td></tr>
<tr><td>No aprovechar el historial de la conversación</td><td>Repetir contexto que ya diste antes.</td><td>Refiérete a lo ya dicho: "como mencioné arriba..."</td></tr>
</table>

<h2>El error de fondo: tratarla como oráculo, no como herramienta</h2>
<p>La actitud que más limita el valor de la IA es esperar que "adivine" exactamente lo que necesitas sin dártelo, y luego frustrarse cuando no lo hace. La actitud que más lo multiplica es tratarla como una herramienta poderosa pero imperfecta, con la que <strong>colaboras activamente</strong>: das contexto, revisas, corriges, verificas.</p>

<h2>Un chequeo rápido antes de dar por buena una respuesta</h2>
<ol>
<li>¿Esta respuesta contiene datos, cifras o citas específicas que debería verificar?</li>
<li>¿Le di suficiente contexto para que entendiera exactamente lo que necesito?</li>
<li>¿Podría mejorarla pidiendo una iteración más, en vez de aceptarla tal cual?</li>
<li>¿Es esta una decisión importante (salud, dinero, legal) donde necesito una fuente humana además de la IA?</li>
</ol>

<div class="tip">
💡 Guarda esta lista de cuatro preguntas — es, en esencia, el resumen de todo el curso.
</div>
`,
      quiz('¿Cuál es la actitud que más limita el valor que se obtiene de la IA?',
        ['Colaborar activamente, dando contexto y corrigiendo', 'Esperar que "adivine" exactamente lo que necesitas sin dárselo, y frustrarse cuando no lo hace', 'Verificar datos importantes', 'Iterar sobre las respuestas'], 1)),

    text('Combina herramientas: la IA no está sola',
      'Cómo se ve un flujo de trabajo real que combina varias herramientas de IA y no-IA.',
      `
<h2>Nadie usa "solo un chatbot" para todo</h2>
<p>Las personas que más aprovechan la IA no dependen de una sola herramienta para todo — combinan varias, cada una para lo que hace mejor.</p>

<h2>Ejemplo de flujo: preparar una exposición</h2>
<table>
<tr><th>Paso</th><th>Herramienta / técnica</th></tr>
<tr><td>1. Investigar el tema</td><td>Un asistente de IA con capacidad de buscar en internet (para temas actuales), o fuentes verificadas directamente.</td></tr>
<tr><td>2. Organizar las ideas</td><td>Pedirle a la IA una estructura/esquema, e iterar hasta que tenga sentido.</td></tr>
<tr><td>3. Escribir el contenido</td><td>Primer borrador con IA, editado por ti — nunca copiar y pegar sin revisar.</td></tr>
<tr><td>4. Generar apoyos visuales</td><td>Herramientas de generación de imágenes (ver el curso de <em>IA Generativa</em> de esta academia) para diagramas o portadas.</td></tr>
<tr><td>5. Practicar</td><td>Pedirle a la IA que actúe como tu audiencia y te haga preguntas difíciles antes de la exposición real.</td></tr>
</table>

<h2>Documentos y notas propias como contexto</h2>
<p>Herramientas como Google NotebookLM (ver el curso <em>Domina Google NotebookLM</em> de esta academia) te dejan subir tus propios documentos para que la IA responda <strong>solo</strong> con base en ellos, en vez de con conocimiento general de internet — útil cuando necesitas precisión sobre una fuente específica (tus apuntes, un libro, un manual).</p>

<h2>Automatizar lo repetitivo</h2>
<p>Cuando haces la misma tarea con IA una y otra vez (por ejemplo, resumir el mismo tipo de documento cada semana), vale la pena guardar tu prompt ya afinado como plantilla, en vez de reescribirlo desde cero cada vez. Algunas plataformas de IA permiten guardar "instrucciones personalizadas" que se aplican automáticamente a cada conversación nueva.</p>

<div class="example">
<strong>Idea de plantilla guardada:</strong> "Cuando te pida resumir un texto, dame siempre: 1) un resumen de 3 líneas, 2) los 3 puntos más importantes en viñetas, 3) una pregunta que aún queda sin responder."
</div>
`,
      quiz('¿Qué ventaja tiene una herramienta como Google NotebookLM frente a un chat de IA general?',
        ['Es más rápida en todos los casos', 'Responde solo con base en los documentos que tú subiste, en vez de con conocimiento general de internet', 'No requiere ningún tipo de cuenta', 'Genera imágenes con más calidad'], 1)),

    text('Privacidad y buen juicio: lo que no le compartes a la IA',
      'La IA es una herramienta poderosa, no un lugar donde poner cualquier información.',
      `
<h2>Antes de pegar algo, pregúntate esto</h2>
<p>Cuando escribes en un chat de IA, ese texto puede quedar almacenado por el proveedor del servicio (para mejorar el producto, dar soporte, o según sus políticas de privacidad) — no lo trates como algo que desaparece sin dejar rastro.</p>

<table>
<tr><th>Evita compartir</th><th>Por qué</th></tr>
<tr><td>Contraseñas, llaves de API, tokens</td><td>Son credenciales reales — nunca deben aparecer en un chat.</td></tr>
<tr><td>Datos médicos o financieros de otras personas</td><td>No es tu información para compartir con un tercero.</td></tr>
<tr><td>Información confidencial de tu trabajo o escuela</td><td>Revisa las políticas de tu institución antes de subir documentos internos.</td></tr>
<tr><td>Documentos de identidad completos</td><td>Números de identificación oficial, pasaporte, etc.</td></tr>
</table>

<h2>Un buen hábito: anonimiza cuando puedas</h2>
<p>Si necesitas ayuda con un texto que menciona nombres reales o datos sensibles, reemplázalos por placeholders ("Persona A", "Empresa X") antes de pegarlo, y solo vuelve a poner los datos reales en tu propia versión final, fuera del chat.</p>

<h2>La IA no reemplaza al criterio humano en decisiones importantes</h2>
<p>Para decisiones médicas, legales o financieras, usa la IA como un punto de partida para entender opciones y hacer mejores preguntas — no como la fuente final de la decisión. Un profesional humano tiene contexto sobre tu caso específico que un chat no tiene, y carga con una responsabilidad legal y ética que la IA no tiene.</p>

<h2>Resumen del curso completo</h2>
<ol>
<li><strong>Dale contexto</strong> — audiencia, formato, objetivo.</li>
<li><strong>Itera</strong> — no aceptes la primera respuesta sin más.</li>
<li><strong>Pide razonamiento</strong> en problemas complejos.</li>
<li><strong>Verifica</strong> datos importantes; cuidado con las alucinaciones.</li>
<li><strong>Combina herramientas</strong>, no dependas de una sola.</li>
<li><strong>Cuida tu privacidad</strong> — piensa antes de pegar información sensible.</li>
</ol>

<div class="tip">
💡 Con estos seis hábitos, ya usas la IA mejor que la mayoría de la gente que la prueba una vez y se queda con la primera impresión.
</div>
`,
      quiz('¿Qué deberías evitar compartir en un chat de IA?',
        ['Preguntas sobre temas generales', 'Contraseñas, llaves de API y datos médicos o financieros de otras personas', 'El contexto de lo que necesitas', 'Textos que quieres que te ayude a mejorar'], 1)),
  ],
}
