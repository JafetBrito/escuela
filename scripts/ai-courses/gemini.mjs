// Curso "Domina Gemini: Guía Completa". Solo texto + quizzes.
import { quiz, text } from '../linux-courses/helpers.mjs'

export const gemini = {
  id: 'course-domina-gemini',
  title: 'Domina Gemini: Guía Completa',
  description: 'Todo lo que necesitas para sacarle el máximo provecho a Gemini, el asistente de IA de Google: la app, Google AI Studio, Gems personalizados, su integración con Gmail/Docs/Sheets, su ventana de contexto enorme, y cómo se compara honestamente con Claude y GPT.',
  ai_instructions: 'Eres Ada, profesora de la Academia de IA de Oliver Academy, guiando el curso "Domina Gemini". Conoces a fondo las funciones de Gemini (Gems, Google AI Studio, integración con Workspace, Deep Research) y explicas con ejemplos concretos. Sé estrictamente neutral y objetiva — este curso está en la misma academia que "Domina Claude" y debe tratar a Gemini con el mismo rigor y respeto, sin comparaciones sesgadas. Sé honesta sobre que las funciones y planes disponibles pueden cambiar, y anima siempre al alumno a confirmar detalles actuales en la documentación oficial de Google.',
  icon: '♊',
  color: '#4285f4',
  category: 'Inteligencia Artificial',
  subcategory: 'Herramientas de IA',
  difficulty: 'principiante',
  locked: false,
  modules: [
    text('Bienvenida: qué es Gemini y de dónde viene',
      'El asistente de IA de Google, construido sobre décadas de investigación en DeepMind.',
      `
<h2>Qué es Gemini, en una frase</h2>
<p><strong>Gemini</strong> es la familia de modelos de inteligencia artificial de <strong>Google DeepMind</strong>, diseñada desde su origen para ser <strong>multimodal</strong> — es decir, pensada desde el principio para procesar texto, imágenes, audio y video de forma integrada, no como sistemas separados conectados después. Como viste en <em>Panorama de Modelos de IA</em>, Google DeepMind nació de la fusión (2023) de DeepMind (fundada en Londres en 2010, responsable de AlphaGo y AlphaFold) con Google Brain, el otro gran equipo de IA de Google.</p>

<h2>Por qué un curso dedicado solo a Gemini</h2>
<p>Ya viste a <em>Domina Claude</em> como el curso insignia de esta academia. Este curso le da el mismo trato a fondo a Gemini: no solo "escribir en un chat", sino Gems (personas personalizadas), Google AI Studio, su integración con el ecosistema completo de Google (Gmail, Docs, Sheets, Drive), y su capacidad distintiva de manejar contextos extremadamente largos.</p>

<h2>El mapa del curso</h2>
<table>
<tr><th>Parte</th><th>Qué vas a aprender</th></tr>
<tr><td>1. Primeros pasos</td><td>La app de Gemini, los modelos disponibles, y Google AI Studio.</td></tr>
<tr><td>2. Gems y personalización</td><td>Crear tus propios asistentes especializados dentro de Gemini.</td></tr>
<tr><td>3. Integración con Google</td><td>Cómo Gemini se conecta con Gmail, Docs, Sheets y Drive.</td></tr>
<tr><td>4. Contexto largo y multimodalidad</td><td>Lo que distingue técnicamente a Gemini.</td></tr>
<tr><td>5. Comparación honesta y cierre</td><td>Cuándo Gemini es la mejor opción frente a Claude o GPT.</td></tr>
</table>

<div class="tip">
💡 Si ya tomaste <em>Domina Claude</em>, vas a notar patrones parecidos (un chat conversacional, una forma de organizar contexto, integración con documentos) — es una buena oportunidad para comparar cómo distintas empresas resuelven problemas similares de formas distintas.
</div>
`,
      quiz('¿Qué caracteriza a Gemini desde su diseño, según viste en esta clase?',
        ['Solo funciona con texto, nunca con imágenes', 'Es multimodal desde su origen: pensado para procesar texto, imagen, audio y video de forma integrada', 'Es un producto completamente independiente de Google DeepMind', 'No tiene ninguna relación con AlphaGo ni AlphaFold'], 1)),

    text('Primeros pasos: la app de Gemini y sus modelos',
      'Dónde vive Gemini, y los distintos "tamaños" pensados para necesidades distintas.',
      `
<h2>Dónde usar Gemini</h2>
<table>
<tr><th>Forma de acceso</th><th>Para quién</th></tr>
<tr><td><strong>La app de Gemini</strong> (web y móvil, gemini.google.com)</td><td>Uso conversacional directo, la puerta de entrada más común.</td></tr>
<tr><td><strong>Integrado en productos de Google</strong></td><td>Dentro de Gmail, Docs, Sheets, Android, y la Búsqueda de Google (AI Overviews / Modo IA).</td></tr>
<tr><td><strong>Google AI Studio</strong></td><td>Una herramienta gratuita para experimentar con los modelos de forma más técnica, pensada para desarrolladores y gente curiosa — la verás en detalle más adelante en el curso.</td></tr>
<tr><td><strong>La API de Gemini</strong></td><td>Para que desarrolladores integren Gemini en sus propias aplicaciones.</td></tr>
<tr><td><strong>Vertex AI</strong></td><td>La plataforma de IA de Google Cloud, para uso empresarial a mayor escala.</td></tr>
</table>

<h2>Una familia, distintos tamaños</h2>
<p>Al igual que viste con Claude en el curso anterior, Google publica varias versiones de Gemini en cada generación: una <strong>rápida y ligera</strong> (pensada para tareas cotidianas y alto volumen), y otra más <strong>capaz</strong> para razonamiento complejo, con puntos intermedios entre ambas. Los nombres exactos cambian con cada generación — lo estable es el concepto de elegir según la tarea.</p>

<h2>Gemini en tu teléfono Android</h2>
<p>En dispositivos Android, Gemini puede reemplazar al asistente de voz tradicional y integrarse directamente con las apps que ya usas — puedes pedirle que resuma una app abierta, que redacte un mensaje, o que te ayude con lo que ves en pantalla, sin cambiar de aplicación.</p>

<h2>Un primer hábito, igual que con cualquier IA</h2>
<p>Como viste en <em>Trucos y Consejos</em>, el contexto lo cambia casi todo, sin importar qué asistente uses. Empieza conversaciones importantes con Gemini explicando quién eres, qué necesitas lograr y qué formato esperas — el mismo hábito que ya conoces, aplicado aquí.</p>
`,
      quiz('¿Qué es Google AI Studio?',
        ['Un curso de diseño gráfico de Google', 'Una herramienta gratuita de Google para experimentar con los modelos Gemini de forma más técnica', 'El nombre antiguo de la app de Gemini', 'Un servicio exclusivo para empresas grandes'], 1)),

    text('Gems: crea tus propios asistentes especializados',
      'Cómo darle a Gemini una personalidad e instrucciones fijas para una tarea específica.',
      `
<h2>El problema que resuelven los Gems</h2>
<p>Si usas Gemini para varias tareas distintas de forma recurrente (revisar tu escritura, ayudarte a estudiar un tema específico, actuar como entrenador de una habilidad), repetir las mismas instrucciones de contexto cada vez es tedioso. Los <strong>Gems</strong> resuelven esto: son versiones personalizadas de Gemini, con instrucciones y contexto fijos que defines una sola vez, listas para usar cuando las necesites.</p>

<h2>Cómo crear un Gem</h2>
<ol>
<li>Le das un nombre y una descripción a tu Gem.</li>
<li>Escribes instrucciones detalladas sobre cómo debe comportarse (tono, formato de respuesta, qué debe evitar).</li>
<li>Opcionalmente, le agregas archivos de referencia que debe conocer siempre.</li>
<li>Guardas el Gem, y aparece en tu lista para usarlo cuando quieras, sin repetir el contexto.</li>
</ol>

<h2>Ejemplos de Gems útiles</h2>
<table>
<tr><th>Gem</th><th>Instrucciones de ejemplo</th></tr>
<tr><td>Editor de textos exigente</td><td>"Revisa cualquier texto que te dé señalando claridad, tono y errores gramaticales. Sé directo, no elogies innecesariamente."</td></tr>
<tr><td>Tutor de un curso específico</td><td>"Ayúdame a estudiar para el curso de Historia de la IA. Hazme preguntas de repaso y explica con analogías simples."</td></tr>
<tr><td>Asistente de planificación semanal</td><td>"Ayúdame a organizar mi semana en bloques de tiempo, preguntando primero qué tengo pendiente."</td></tr>
</table>

<h2>Gems vs. Proyectos de Claude: la misma idea, distinta forma</h2>
<p>Si tomaste <em>Domina Claude</em>, notarás que los Gems resuelven un problema parecido al de los <strong>Proyectos</strong> de Claude: mantener contexto fijo sin repetirlo. La diferencia principal es el énfasis: un Gem se centra en definir una <strong>personalidad y comportamiento</strong> reutilizable (como un "modo" especializado de Gemini), mientras que un Proyecto de Claude se centra más en agrupar <strong>conversaciones y documentos</strong> de un trabajo en curso. En la práctica, ambos te ahorran repetir contexto una y otra vez.</p>

<div class="tip">
💡 Un buen primer Gem para practicar: crea uno que actúe como tutor de un curso de esta misma academia, con instrucciones que digan exactamente cómo quieres que te explique las cosas.
</div>
`,
      quiz('¿Cuál es la diferencia principal de énfasis entre un Gem de Gemini y un Proyecto de Claude?',
        ['No hay ninguna diferencia, son idénticos', 'El Gem se centra en definir una personalidad y comportamiento reutilizable; el Proyecto se centra más en agrupar conversaciones y documentos de un trabajo en curso', 'Los Gems solo sirven para generar imágenes', 'Los Proyectos de Claude no existen'], 1)),

    text('Gemini y el ecosistema de Google: Gmail, Docs, Sheets y Drive',
      'La ventaja distintiva de estar integrado en las herramientas que ya usas todos los días.',
      `
<h2>Una ventaja estructural de Gemini</h2>
<p>A diferencia de un asistente independiente, Gemini está integrado directamente dentro de las aplicaciones de Google Workspace que millones de personas ya usan a diario — lo que le da acceso directo, con tu permiso, a tu correo, tus documentos y tus hojas de cálculo, sin necesidad de copiar y pegar información manualmente entre aplicaciones.</p>

<h2>Dónde aparece la integración</h2>
<table>
<tr><th>Aplicación</th><th>Lo que Gemini puede hacer ahí</th></tr>
<tr><td>Gmail</td><td>Resumir hilos de correo largos, redactar respuestas con el tono que le pidas, y buscar información específica dentro de tu bandeja.</td></tr>
<tr><td>Google Docs</td><td>Redactar, resumir o reescribir directamente dentro del documento en el que estás trabajando.</td></tr>
<tr><td>Google Sheets</td><td>Generar fórmulas, analizar datos, y crear tablas o clasificaciones a partir de una descripción en lenguaje natural.</td></tr>
<tr><td>Google Drive</td><td>Buscar y resumir el contenido de tus propios archivos guardados.</td></tr>
<tr><td>Google Meet</td><td>Tomar notas y generar resúmenes de reuniones en video.</td></tr>
</table>

<h2>Un ejemplo práctico completo</h2>
<div class="example">
Tienes un hilo de correo de 15 mensajes sobre la planeación de un evento. En vez de leerlo todo, le pides a Gemini dentro de Gmail: "Resume las decisiones tomadas y las tareas pendientes de este hilo, organizadas por persona responsable." Obtienes un resumen accionable sin abrir cada mensaje.
</div>

<h2>Lo que esto significa para ti como estudiante</h2>
<p>Si ya usas cuentas de Google para la escuela o el trabajo (Docs para tareas, Sheets para organizar datos, Gmail para comunicarte con profesores), la ventaja de Gemini es que no necesitas cambiar de herramienta ni copiar y pegar contenido — trabaja directamente donde ya estás.</p>

<div class="warn">
⚠️ Como con cualquier integración de IA con tus datos personales (correo, documentos), revisa siempre qué permisos le estás dando y qué configuración de privacidad aplica — el mismo hábito de precaución que viste en <em>Trucos y Consejos</em> para cualquier asistente de IA.
</div>
`,
      quiz('¿Cuál es la ventaja estructural de Gemini frente a un asistente de IA independiente?',
        ['Es el único modelo de IA que existe', 'Está integrado directamente dentro de Gmail, Docs, Sheets y Drive, con acceso directo a esas herramientas sin copiar y pegar', 'Es gratuito en todos los casos, sin excepción', 'No requiere ningún tipo de permiso de privacidad'], 1)),

    text('Contexto largo: la especialidad técnica de Gemini',
      'Por qué la capacidad de "leer" documentos enormes de una sola vez es tan valiosa.',
      `
<h2>Recordando la ventana de contexto</h2>
<p>Como viste en <em>Panorama de Modelos de IA</em>, la <strong>ventana de contexto</strong> es la cantidad de texto que un modelo puede considerar a la vez. Gemini se ha distinguido consistentemente por ofrecer ventanas de contexto muy grandes en comparación con buena parte de la competencia — suficiente para procesar libros completos, horas de transcripción de audio, o bases de código enteras en una sola conversación.</p>

<h2>Qué habilita un contexto tan grande</h2>
<table>
<tr><th>Caso de uso</th><th>Por qué el contexto largo importa aquí</th></tr>
<tr><td>Analizar un libro o reporte completo</td><td>No hace falta dividirlo en fragmentos — Gemini lo procesa de una sola vez, manteniendo las conexiones entre el principio y el final.</td></tr>
<tr><td>Revisar una base de código completa</td><td>Entender cómo se relacionan varios archivos entre sí, no solo uno aislado.</td></tr>
<tr><td>Transcribir y analizar videos largos</td><td>Procesar una hora o más de contenido de video, aprovechando su capacidad multimodal nativa.</td></tr>
<tr><td>Conversaciones muy extensas</td><td>Mantener el hilo de una conversación larga sin que el modelo "olvide" el contexto inicial.</td></tr>
</table>

<h2>Un límite que sigue existiendo</h2>
<div class="warn">
⚠️ Una ventana de contexto grande no es garantía de que el modelo use <strong>toda</strong> esa información con la misma atención — en la práctica, el desempeño puede variar según en qué parte del texto esté la información relevante. Y como viste en <em>Trucos y Consejos</em>, un contexto más grande no elimina el riesgo de alucinaciones — sigue siendo importante verificar datos importantes.
</div>

<h2>Multimodalidad nativa, en la práctica</h2>
<p>Gemini puede recibir texto, imágenes, audio y video como entrada dentro de la misma conversación — por ejemplo, puedes subir un video de una clase y pedirle un resumen con marcas de tiempo de los puntos clave, combinando lo que "ve" y lo que "escucha" en el video de forma integrada.</p>

<div class="tip">
💡 Si tu tarea implica documentos muy largos o contenido multimedia extenso, Gemini es una opción particularmente fuerte para probar, precisamente por estas dos capacidades combinadas.
</div>
`,
      quiz('¿Por qué una ventana de contexto muy grande es útil para analizar un libro completo?',
        ['Porque hace que el libro se lea más rápido', 'Porque el modelo puede procesarlo de una sola vez, sin dividirlo en fragmentos, manteniendo las conexiones entre el principio y el final', 'Porque reduce el precio del servicio a cero', 'No tiene ninguna utilidad real'], 1)),

    text('Deep Research y las funciones de búsqueda de Gemini',
      'Cuando el modelo no solo responde de memoria, sino que investiga por ti.',
      `
<h2>Más allá de responder con conocimiento entrenado</h2>
<p>Como viste en <em>Actualidad de la IA</em>, una tendencia importante es que los modelos usen herramientas (como buscar en internet) en vez de depender solo de su conocimiento con fecha de corte. Gemini, al ser de Google, tiene una integración particularmente estrecha con la búsqueda web.</p>

<h2>La función de investigación profunda</h2>
<p>Funciones como <strong>Deep Research</strong> le piden a Gemini que, ante una pregunta compleja, planifique una investigación de varios pasos: busca en múltiples fuentes en internet, lee y sintetiza la información encontrada, y te entrega un reporte estructurado con referencias — un proceso que puede tardar varios minutos, a diferencia de una respuesta instantánea, precisamente porque está investigando de verdad en tiempo real.</p>

<h2>Cuándo usar este tipo de función</h2>
<table>
<tr><th>Buena para</th><th>No tan necesaria para</th></tr>
<tr><td>Comparar varias opciones con información actual (por ejemplo, investigar un tema para un trabajo escolar)</td><td>Preguntas simples con una respuesta directa y conocida</td></tr>
<tr><td>Temas donde necesitas fuentes citables, no solo una respuesta</td><td>Conversación casual o generación creativa</td></tr>
<tr><td>Investigación inicial antes de profundizar tú mismo en un tema</td><td>Cuando ya sabes exactamente qué fuente necesitas consultar</td></tr>
</table>

<h2>Sigue aplicando la regla de verificación</h2>
<p>Aunque estas funciones citan fuentes (una mejora real sobre depender solo de memoria del modelo), el hábito de <em>Trucos y Consejos</em> sigue aplicando: revisa las fuentes citadas tú mismo para temas importantes, en vez de asumir que el resumen generado capturó todos los matices correctamente.</p>

<div class="tip">
💡 Piensa en estas funciones de investigación como un asistente que te ahorra el trabajo inicial de buscar y organizar fuentes — no como un reemplazo de la lectura crítica final que tú mismo debes hacer.
</div>
`,
      quiz('¿Qué hace una función como "Deep Research" que la distingue de una respuesta normal e instantánea?',
        ['Nada distinto, responde igual de rápido', 'Planifica una investigación de varios pasos, busca en múltiples fuentes en internet y sintetiza un reporte con referencias, por eso tarda más', 'Solo funciona con preguntas de matemáticas', 'Reemplaza por completo la necesidad de verificar información'], 1)),

    text('Programar con Gemini',
      'De autocompletar código a proyectos completos, dentro del ecosistema de herramientas de Google.',
      `
<h2>Gemini como asistente de programación</h2>
<p>Al igual que viste con Claude Code en el curso anterior, Gemini tiene capacidades diseñadas específicamente para programar: puede generar, explicar y depurar código directamente en el chat, y está integrado en entornos de desarrollo a través de extensiones y herramientas de Google pensadas para asistir en flujos de trabajo de programación completos, no solo sugerir líneas sueltas.</p>

<h2>Dónde se usa para programar</h2>
<table>
<tr><th>Contexto</th><th>Qué ofrece</th></tr>
<tr><td>Chat conversacional</td><td>Explicar, generar y depurar fragmentos de código, con el mismo flujo de iteración que viste en <em>Trucos y Consejos</em>.</td></tr>
<tr><td>Google AI Studio</td><td>Experimentar directamente con la API de Gemini, útil para desarrolladores que están prototipando aplicaciones con IA.</td></tr>
<tr><td>Extensiones para editores de código</td><td>Sugerencias y generación de código dentro de tu propio entorno de desarrollo, similar en espíritu a otras herramientas de asistencia de código que ya conoces.</td></tr>
</table>

<h2>La misma regla de siempre</h2>
<div class="warn">
⚠️ Como viste con Claude Code: entender qué hace tu código, probarlo, y revisar los cambios antes de aceptarlos sigue siendo indispensable — ninguna herramienta de generación de código, sin importar el proveedor, elimina la necesidad de criterio técnico humano en proyectos reales.
</div>

<h2>Un punto a favor si ya programas en el ecosistema de Google</h2>
<p>Si tu proyecto ya usa servicios de Google Cloud, Firebase, o herramientas del ecosistema de Google, Gemini tiene una ventaja natural de integración — de la misma forma en que Claude Code brilla especialmente en flujos de trabajo centrados en la terminal y Git.</p>
`,
      quiz('¿Qué sigue siendo indispensable al usar Gemini (o cualquier otra IA) para programar, según esta clase?',
        ['Nada, se puede aceptar cualquier código generado sin revisión', 'Entender qué hace el código, probarlo y revisarlo antes de aceptar los cambios', 'Nunca usar IA para programar', 'Programar siempre sin ningún tipo de herramienta'], 1)),

    text('Comparación honesta: Gemini frente a Claude y GPT',
      'Sin marketing, sin favoritismos — las diferencias reales que puedes usar para decidir.',
      `
<h2>Recordando el marco de decisión</h2>
<p>Como viste en <em>Panorama de Modelos de IA</em>, no existe "el mejor modelo" en abstracto — la pregunta correcta es cuál se ajusta mejor a tu tarea específica. Esta clase te da puntos de comparación concretos entre las tres familias que más se mencionan en esta academia.</p>

<h2>Fortalezas relativas de cada familia (conceptual, no un ranking fijo)</h2>
<table>
<tr><th>Si tu prioridad es...</th><th>Vale la pena considerar</th><th>Por qué</th></tr>
<tr><td>Integración con correo, documentos y hojas de cálculo que ya usas</td><td>Gemini</td><td>Integración nativa en todo Google Workspace.</td></tr>
<tr><td>Documentos o videos extremadamente largos</td><td>Gemini</td><td>Ventana de contexto consistentemente grande.</td></tr>
<tr><td>Un enfoque explícito en seguridad y alineación como principio de diseño</td><td>Claude</td><td>IA Constitucional, enfoque fundacional de Anthropic en seguridad.</td></tr>
<tr><td>Programación agentic avanzada en un proyecto completo</td><td>Claude (Claude Code) o Gemini, según tu ecosistema</td><td>Ambos tienen herramientas dedicadas fuertes; la elección depende de tu stack.</td></tr>
<tr><td>El ecosistema de plugins y el producto más masivamente adoptado</td><td>ChatGPT (GPT)</td><td>Fue el primero en llegar al público masivo y mantiene un ecosistema enorme de integraciones de terceros.</td></tr>
</table>

<div class="warn">
⚠️ Esta tabla describe <strong>tendencias generales</strong>, no un ranking de rendimiento — como viste en <em>Actualidad de la IA</em>, cada nueva versión puede cambiar el panorama. Verifica siempre comparativas actualizadas antes de una decisión importante, y mejor aún: prueba tú mismo la tarea real en más de un modelo, como recomienda <em>Panorama de Modelos de IA</em>.
</div>

<h2>No es una decisión de "para siempre"</h2>
<p>Nada te obliga a usar un solo modelo para todo. Es perfectamente razonable usar Gemini para trabajo dentro de Google Workspace, Claude para tareas que requieren razonamiento cuidadoso o programación con Claude Code, y GPT para aprovechar su ecosistema de plugins — cambiando según la tarea, como recomienda <em>Panorama de Modelos de IA</em>.</p>

<h2>Repaso final del curso</h2>
<table>
<tr><th>Función</th><th>Cuándo brilla</th></tr>
<tr><td>Gems</td><td>Necesitas un "modo" reutilizable de Gemini con personalidad e instrucciones fijas.</td></tr>
<tr><td>Integración con Google Workspace</td><td>Ya trabajas dentro de Gmail, Docs o Sheets a diario.</td></tr>
<tr><td>Contexto largo</td><td>Documentos, código o videos extensos.</td></tr>
<tr><td>Deep Research</td><td>Investigación con fuentes citables sobre un tema complejo.</td></tr>
<tr><td>Google AI Studio</td><td>Experimentar técnicamente con los modelos, o programar con su API.</td></tr>
</table>

<div class="tip">
💡 Con este curso y <em>Domina Claude</em>, ya tienes una visión de primera mano de dos de los asistentes de IA más relevantes de hoy — suficiente para elegir con criterio propio en vez de por costumbre o por marketing.
</div>
`,
      quiz('¿Cuál es la actitud correcta al comparar Gemini, Claude y GPT según esta clase?',
        ['Elegir uno solo para siempre y no volver a considerar los demás', 'Entender las fortalezas relativas de cada uno, verificar comparativas actualizadas, y usar el que mejor se ajuste a cada tarea específica — sin lealtad obligada a una sola marca', 'Ignorar cualquier comparación porque todos son exactamente iguales', 'Confiar únicamente en el marketing de cada empresa'], 1)),
  ],
}
