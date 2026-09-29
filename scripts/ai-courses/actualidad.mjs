// Curso "Actualidad de la IA: El Estado del Arte". Solo texto + quizzes.
// Curso deliberadamente "perecedero" — con avisos explícitos sobre su fecha de corte.
import { quiz, text } from '../linux-courses/helpers.mjs'

export const actualidad = {
  id: 'course-actualidad-ia',
  title: 'Actualidad de la IA: El Estado del Arte',
  description: 'Una fotografía del panorama de la IA hasta principios de 2026: agentes que usan herramientas, modelos que razonan, IA multimodal, el auge del "vibe coding", la regulación que empieza a llegar, y por qué este curso, más que ningún otro, hay que leerlo sabiendo que la IA sigue moviéndose muy rápido.',
  ai_instructions: 'Eres Ada, profesora de la Academia de IA de Oliver Academy, guiando el curso "Actualidad de la IA". Este curso describe el estado de la IA hasta el conocimiento del propio modelo que responde (que tiene una fecha de corte, no información en tiempo real). SIEMPRE que el alumno pregunte por algo "más reciente" o "quién es el mejor modelo ahora mismo", aclara honestamente que tu conocimiento tiene una fecha de corte y que debe verificar información actual en fuentes en vivo. Nunca inventes lanzamientos o eventos posteriores a tu conocimiento como si fueran hechos confirmados.',
  icon: '📡',
  color: '#f472b6',
  category: 'Inteligencia Artificial',
  subcategory: 'Actualidad de la IA',
  difficulty: 'intermedio',
  locked: false,
  modules: [
    text('Bienvenida: un curso con fecha de caducidad, y eso está bien',
      'Por qué te lo decimos de frente, en vez de fingir que esto envejece bien.',
      `
<h2>El curso más honesto de la Academia</h2>
<p>Todos los cursos de esta escuela intentan ser precisos. Este además tiene que ser <strong>honesto sobre su propio vencimiento</strong>: describe el panorama de la inteligencia artificial hasta el conocimiento de quien lo escribió (un modelo de IA con una fecha de corte, no un oráculo en tiempo real). Para cuando tú lo leas, es casi seguro que algo aquí ya cambió: salió un modelo nuevo, una empresa lanzó una función, un precio bajó.</p>

<div class="warn">
⚠️ Trata este curso como una <strong>fotografía de un momento</strong>, no como una verdad eterna. Lo que sí sigue siendo útil con el tiempo son las <strong>tendencias de fondo</strong> que verás aquí — hacia dónde se mueve el campo — más que cualquier nombre de producto específico.
</div>

<h2>Lo que vas a ver</h2>
<table>
<tr><th>Tema</th><th>La tendencia de fondo</th></tr>
<tr><td>Agentes de IA</td><td>De "responder preguntas" a "completar tareas usando herramientas".</td></tr>
<tr><td>Modelos de razonamiento</td><td>Modelos que piensan más antes de responder, especialmente para problemas difíciles.</td></tr>
<tr><td>IA multimodal</td><td>Texto, imagen, audio y video cada vez más integrados en un solo modelo.</td></tr>
<tr><td>Programar con IA</td><td>De autocompletar código a construir aplicaciones completas con lenguaje natural.</td></tr>
<tr><td>Regulación</td><td>Los gobiernos empiezan a poner reglas al campo.</td></tr>
</table>

<div class="tip">
💡 Cómo mantenerte al día después de este curso: sigue los blogs oficiales de los laboratorios (Anthropic, OpenAI, Google DeepMind), y recuerda que le puedes preguntar directamente a tu mascota de IA — solo ten presente que, si su conocimiento también tiene una fecha de corte, para eventos muy recientes necesitará buscar en internet (si esa función está disponible) en vez de responder solo de memoria.
</div>
`,
      quiz('¿Por qué este curso se describe como "el más perecedero" de la Academia de IA?',
        ['Porque tiene errores a propósito', 'Porque describe el estado de la IA hasta una fecha de corte específica, y el campo cambia muy rápido después de eso', 'Porque no tiene quizzes', 'Porque solo habla del pasado, nunca del presente'], 1)),

    text('Agentes de IA: de responder a actuar',
      'La tendencia más importante del periodo reciente: modelos que hacen cosas, no solo que hablan.',
      `
<h2>Qué es un "agente" de IA</h2>
<p>Un chatbot tradicional responde texto con texto: le preguntas, te contesta, y ahí termina su participación. Un <strong>agente de IA</strong> va más allá: puede <strong>usar herramientas</strong> — navegar la web, ejecutar código, leer y escribir archivos, llamar a otras aplicaciones — de forma autónoma, encadenando varios pasos para completar una tarea completa, no solo responder una pregunta.</p>

<h2>Ejemplo concreto</h2>
<div class="example">
<strong>Chatbot tradicional:</strong> le pides "¿cómo organizo mis archivos de fotos por fecha?" y te explica los pasos, en texto, para que tú los hagas.<br>
<strong>Agente:</strong> le pides "organiza mis fotos por fecha" y él mismo escribe y ejecuta un script que revisa las fechas de cada archivo y los mueve a carpetas — sin que tú tengas que hacerlo manualmente.
</div>

<h2>Dónde ya se ve esto</h2>
<table>
<tr><th>Área</th><th>Ejemplo del tipo de comportamiento agentic</th></tr>
<tr><td>Programación</td><td>Herramientas como Claude Code pueden leer un proyecto completo, hacer cambios en varios archivos, ejecutar pruebas, y corregir errores que encuentran — no solo sugerir una línea de código.</td></tr>
<tr><td>Uso de la computadora</td><td>Capacidades de "computer use": el modelo puede ver la pantalla y controlar el mouse/teclado para completar tareas en cualquier aplicación, no solo las que tienen una API disponible.</td></tr>
<tr><td>Investigación</td><td>Modelos que buscan en internet, leen varias fuentes, y sintetizan un reporte, en vez de responder solo con conocimiento memorizado.</td></tr>
<tr><td>Automatización de trabajo</td><td>Agentes que procesan correos, agendan reuniones, o completan formularios de forma encadenada.</td></tr>
</table>

<h2>Por qué esto es un cambio de fondo, no solo una función más</h2>
<p>Pasar de "responder" a "actuar" cambia el tipo de confianza que hace falta: un chatbot que se equivoca te da información incorrecta que tú decides si usar; un agente que se equivoca puede <strong>ejecutar</strong> una acción incorrecta (borrar un archivo, enviar un mensaje, hacer una compra). Por eso el diseño de agentes incluye, cada vez más, pasos de confirmación humana antes de acciones irreversibles — el mismo principio de "pide permiso antes de una acción difícil de revertir" que probablemente ya conoces de otras herramientas de IA que usas.</p>

<div class="warn">
⚠️ Cuanta más autonomía le des a un agente de IA, más importante es revisar qué permisos le estás dando realmente, y supervisar acciones que no puedas deshacer fácilmente.
</div>
`,
      quiz('¿Cuál es la diferencia clave entre un chatbot tradicional y un agente de IA?',
        ['No hay ninguna diferencia real', 'El agente puede usar herramientas y ejecutar acciones de varios pasos de forma autónoma, no solo responder con texto', 'El agente siempre es más lento', 'El chatbot tradicional es más reciente que los agentes'], 1)),

    text('Modelos de razonamiento y la carrera por "pensar mejor"',
      'Cuando dar más tiempo de cómputo antes de responder se volvió una estrategia deliberada.',
      `
<h2>De "responder rápido" a "pensar antes de responder"</h2>
<p>Como viste en <em>Trucos y Consejos</em>, pedirle a un modelo que "piense paso a paso" mejora sus respuestas en problemas complejos. Una tendencia reciente importante: en vez de depender de que el usuario lo pida explícitamente, varios laboratorios entrenaron modelos que dedican <strong>más tiempo de cómputo internamente</strong> antes de dar una respuesta, especialmente en matemáticas, lógica y programación — a veces mostrando ese proceso de razonamiento, a veces ocultándolo.</p>

<h2>Por qué esto es significativo técnicamente</h2>
<p>Durante años, la forma principal de mejorar un modelo era entrenarlo más grande, con más datos y más cómputo <strong>durante el entrenamiento</strong>. Los modelos de razonamiento agregan otra palanca: gastar más cómputo <strong>al momento de responder</strong> (inferencia), no solo al entrenar. Esto abrió una nueva dimensión de mejora, además de simplemente hacer modelos más grandes.</p>

<h2>El costo de pensar más</h2>
<table>
<tr><th>Ventaja</th><th>Costo</th></tr>
<tr><td>Mejor precisión en problemas complejos (matemáticas, código, lógica)</td><td>Respuestas más lentas</td></tr>
<tr><td>Menos errores en tareas de varios pasos</td><td>Más costo computacional por respuesta</td></tr>
<tr><td>Puede mostrar su proceso de razonamiento, útil para verificar</td><td>No siempre necesario para preguntas simples</td></tr>
</table>

<h2>Cuándo usarlos (y cuándo no)</h2>
<p>Para preguntas cotidianas ("resume este correo", "dame ideas para un título"), un modelo estándar y rápido suele ser más que suficiente. Los modelos de razonamiento brillan en problemas donde de verdad hay varios pasos lógicos encadenados, matemáticas no triviales, o depuración de código complejo — usarlos para todo sería como usar un microscopio para leer un cartel en la calle: funciona, pero es más lento de lo necesario.</p>

<div class="tip">
💡 Muchas plataformas te dejan elegir entre un modo "rápido" y un modo "de razonamiento" para la misma familia de modelo — vale la pena aprender a elegir según la tarea, en vez de usar siempre el mismo por costumbre.
</div>
`,
      quiz('¿Qué palanca nueva de mejora agregaron los "modelos de razonamiento", además de entrenar modelos más grandes?',
        ['Reducir el tamaño del modelo al mínimo', 'Gastar más cómputo AL MOMENTO de responder (no solo durante el entrenamiento), dedicando más "tiempo de pensar" antes de dar la respuesta final', 'Eliminar por completo la necesidad de entrenamiento', 'Responder siempre en menos de un segundo'], 1)),

    text('IA multimodal: todo junto en un solo modelo',
      'Texto, imagen, audio y video dejando de ser sistemas separados.',
      `
<h2>De sistemas separados a un solo modelo</h2>
<p>Durante años, "IA para texto", "IA para imágenes" e "IA para audio" eran sistemas prácticamente independientes, cada uno con su propia arquitectura. La tendencia reciente es hacia modelos <strong>nativamente multimodales</strong>: un mismo modelo que procesa (y a veces genera) varios tipos de contenido de forma integrada, no mediante sistemas separados conectados entre sí.</p>

<h2>Casos de uso que esto habilita</h2>
<table>
<tr><th>Caso de uso</th><th>Ejemplo</th></tr>
<tr><td>Análisis visual</td><td>Mostrarle una foto de un diagrama, gráfica o problema escrito a mano y pedir que lo explique o resuelva.</td></tr>
<tr><td>Conversación por voz</td><td>Hablarle directamente a un modelo, en vez de escribir, con respuestas también en voz — cada vez con menor retraso y más naturalidad.</td></tr>
<tr><td>Análisis de video</td><td>Describir el contenido de un video, o responder preguntas sobre lo que ocurre en él.</td></tr>
<tr><td>Generación combinada</td><td>Pedir un texto acompañado de una imagen generada que lo ilustre, en una sola interacción.</td></tr>
</table>

<h2>El "modo de voz avanzado" como ejemplo</h2>
<p>Varias plataformas introdujeron modos de conversación por voz de baja latencia, donde puedes interrumpir al modelo mientras habla, y este capta matices de tono — un salto notable frente a los asistentes de voz más rígidos de años anteriores (Siri o Alexa en sus primeras versiones), que dependían de convertir voz a texto, procesar el texto, y convertir la respuesta de vuelta a voz como pasos separados y más lentos.</p>

<h2>Multimodal no significa "perfecto"</h2>
<p>Los modelos multimodales siguen teniendo las mismas limitaciones que viste en <em>Trucos y Consejos</em> (alucinaciones, errores en detalles específicos) — solo que ahora aplicadas también a imágenes y audio: un modelo puede "ver" mal un detalle de una imagen con la misma confianza con la que inventaría un dato en texto. La regla de verificar información importante sigue aplicando igual.</p>

<div class="tip">
💡 Esta tendencia conecta directo con el curso <em>IA Generativa: Imágenes, Audio y Video</em> de esta academia, que profundiza en las herramientas específicas de cada tipo de contenido.
</div>
`,
      quiz('¿Qué significa que un modelo sea "nativamente multimodal"?',
        ['Que solo funciona con texto en varios idiomas', 'Que un mismo modelo procesa (y a veces genera) varios tipos de contenido — texto, imagen, audio, video — de forma integrada, no mediante sistemas separados', 'Que necesita varias suscripciones distintas', 'Que solo existe en teoría, no en productos reales'], 1)),

    text('Programar con IA: del autocompletado al "vibe coding"',
      'Cómo cambió, en pocos años, la forma de escribir software.',
      `
<h2>Tres etapas, en poco tiempo</h2>
<table>
<tr><th>Etapa</th><th>Qué hacía la IA</th></tr>
<tr><td>Autocompletado inteligente</td><td>Sugerir la siguiente línea o función mientras programabas tú, dentro de tu editor.</td></tr>
<tr><td>Asistente conversacional</td><td>Pedirle en un chat que explique, genere o corrija fragmentos de código, copiando y pegando entre el chat y tu editor.</td></tr>
<tr><td>Agentes de código</td><td>Herramientas que leen un proyecto completo, hacen cambios en varios archivos, ejecutan pruebas, y corrigen sus propios errores — con supervisión humana, pero mucho más autónomas.</td></tr>
</table>

<h2>"Vibe coding": construir describiendo, no solo escribiendo</h2>
<p>Se popularizó el término informal <strong>"vibe coding"</strong> para describir la práctica de construir software describiendo en lenguaje natural lo que quieres, dejando que la IA escriba (y a menudo ejecute y pruebe) la mayor parte del código, con la persona guiando el resultado más que escribiendo cada línea a mano. Esto abrió la programación a personas sin formación técnica profunda para prototipos y proyectos personales — aunque para software en producción, con requisitos de seguridad y mantenibilidad serios, sigue haciendo falta criterio técnico humano para revisar lo que la IA genera.</p>

<h2>Lo que no cambió</h2>
<ul>
<li><strong>Entender qué hace tu código sigue importando</strong> — aceptar código generado sin revisarlo puede introducir errores o vulnerabilidades de seguridad.</li>
<li><strong>Las pruebas siguen siendo necesarias</strong> — que el código "se vea bien" no significa que funcione correctamente en todos los casos.</li>
<li><strong>El criterio de diseño sigue siendo humano</strong> — decidir la arquitectura correcta para un problema complejo sigue beneficiándose enormemente de experiencia real.</li>
</ul>

<div class="tip">
💡 Si te interesa este tema, la Academia de Programación de Oliver Academy tiene cursos dedicados a programar (incluido el de Git y GitHub); esta clase te da el panorama de cómo la IA está cambiando ese oficio, no un tutorial paso a paso de una herramienta específica.
</div>

<div class="warn">
⚠️ El "vibe coding" es excelente para prototipos y aprender rápido. Para cualquier proyecto que maneje datos reales de usuarios, dinero, o información sensible, la revisión humana experta sigue siendo indispensable — no opcional.
</div>
`,
      quiz('¿Qué es el "vibe coding"?',
        ['Un lenguaje de programación nuevo', 'Construir software describiendo en lenguaje natural lo que quieres, dejando que la IA escriba y pruebe la mayor parte del código', 'Un tipo de música para programar', 'Programar sin usar ninguna herramienta de IA'], 1)),

    text('La otra cara: regulación, costos y consumo energético',
      'Lo que no sale tanto en los titulares pero está dando forma al futuro del campo.',
      `
<h2>Los gobiernos empiezan a poner reglas</h2>
<p>Después de años de desarrollo prácticamente sin marco legal específico, distintos gobiernos empezaron a regular la IA de forma más activa:</p>
<table>
<tr><th>Región</th><th>Enfoque</th></tr>
<tr><td>Unión Europea</td><td>El <strong>Reglamento de Inteligencia Artificial</strong> (AI Act), aprobado en 2024, clasifica los sistemas de IA por nivel de riesgo y exige requisitos distintos según ese nivel, con aplicación gradual entre 2025 y 2027.</td></tr>
<tr><td>Estados Unidos</td><td>Un enfoque más fragmentado, con órdenes ejecutivas federales y leyes estatales específicas (por ejemplo, sobre transparencia o deepfakes), en vez de una sola ley federal integral.</td></tr>
<tr><td>China</td><td>Regulaciones específicas sobre contenido generado por IA y algoritmos de recomendación, con requisitos de etiquetado.</td></tr>
</table>

<h2>El costo real de entrenar modelos de punta</h2>
<p>Entrenar un modelo de frontera requiere una inversión que se mide en cientos de millones de dólares — en cómputo (miles de GPUs especializadas corriendo durante meses), energía, y talento especializado. Esto ha generado un debate real: ¿está la IA avanzada concentrándose en muy pocas empresas con el capital para pagarla? El caso de DeepSeek (ver la clase sobre modelos abiertos) mostró que, al menos en algunos casos, es posible acercarse a resultados competitivos con inversiones bastante menores — pero sigue siendo una excepción notable, no la norma.</p>

<h2>El consumo energético, un tema creciente</h2>
<p>Entrenar y, sobre todo, <strong>ejecutar</strong> modelos de IA a gran escala (cada vez que millones de personas hacen una consulta) consume una cantidad de electricidad considerable, lo que ha llevado a varias empresas de tecnología a firmar acuerdos de energía (incluida energía nuclear) específicamente para sostener sus centros de datos de IA — un tema con implicaciones ambientales reales que sigue generando debate.</p>

<h2>El mercado laboral</h2>
<p>El impacto de la IA en distintas profesiones es un tema activo de investigación y debate, sin conclusiones simples: algunas tareas dentro de muchos trabajos se automatizan o se aceleran, mientras surgen roles nuevos relacionados directamente con IA. No existe todavía un consenso claro sobre el efecto neto a largo plazo, y las proyecciones varían mucho según la fuente.</p>

<div class="tip">
💡 El curso <em>Ética e Impacto de la IA en la Sociedad</em> de esta academia profundiza en estos temas — empleo, sesgos, desinformación, seguridad — con más espacio del que cabe en esta clase de "panorama actual".
</div>
`,
      quiz('¿Qué es el "AI Act" de la Unión Europea?',
        ['Una empresa de IA europea', 'Un reglamento aprobado en 2024 que clasifica los sistemas de IA por nivel de riesgo y exige requisitos distintos según ese nivel', 'Un modelo de lenguaje europeo', 'Un impuesto sobre el uso de chatbots'], 1)),

    text('Cómo mantenerte actualizado después de este curso',
      'El campo cambiará antes de que termines de leer esta clase — así te preparas para eso.',
      `
<h2>Fuentes confiables para seguir aprendiendo</h2>
<table>
<tr><th>Tipo de fuente</th><th>Ejemplo</th></tr>
<tr><td>Blogs oficiales de los laboratorios</td><td>Anthropic, OpenAI, Google DeepMind publican anuncios directamente, sin intermediarios.</td></tr>
<tr><td>Documentación técnica</td><td>Las páginas de documentación de cada API suelen tener las especificaciones más actualizadas y precisas.</td></tr>
<tr><td>Periodismo especializado en tecnología</td><td>Cobertura con contexto, aunque conviene contrastar entre varias fuentes.</td></tr>
<tr><td>Comunidades técnicas</td><td>Espacios donde desarrolladores comparten experiencias reales de uso, útiles para separar el marketing de la realidad.</td></tr>
</table>

<h2>Preguntas para evaluar cualquier noticia nueva sobre IA</h2>
<ol>
<li>¿Esto viene de la empresa que lo anuncia (marketing), de una prueba independiente, o de ambas?</li>
<li>¿La afirmación es verificable, o es una promesa sobre el futuro?</li>
<li>¿Cambia algo respecto a lo que ya sabías, o es una mejora incremental presentada como revolucionaria?</li>
</ol>

<h2>Usa a tu propia mascota de IA como radar (con cuidado)</h2>
<p>Si tu asistente de IA tiene capacidad de buscar en internet, puedes preguntarle directamente por lanzamientos recientes — pero recuerda lo que viste en <em>Trucos y Consejos</em>: verifica cualquier dato específico (nombres, fechas, cifras) contra una fuente primaria antes de darlo por seguro, especialmente si el propio modelo te advierte que su conocimiento tiene una fecha de corte.</p>

<h2>Cierre del curso</h2>
<p>Este curso te dio un mapa de las tendencias de fondo: agentes que actúan, modelos que razonan más antes de responder, la fusión de texto/imagen/audio/video, una forma nueva de programar, y el contexto regulatorio y económico que envuelve todo esto. Los nombres de productos específicos cambiarán — el hábito de evaluar con criterio, no.</p>

<div class="tip">
💡 Siguiente paso natural en la Academia: si aún no lo tomaste, el curso <em>Domina Claude</em> te lleva de la teoría general a una herramienta específica, a fondo.
</div>
`,
      quiz('¿Cuál es la pregunta MÁS importante para evaluar una noticia nueva y llamativa sobre IA?',
        ['¿Cuántos "me gusta" tiene la publicación?', '¿Esto viene del marketing de la propia empresa, de una prueba independiente, o de ambas — y es verificable?', '¿Qué tan larga es la noticia?', '¿La escribió una persona famosa?'], 1)),
  ],
}
