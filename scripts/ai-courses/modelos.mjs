// Curso "Panorama de Modelos de IA: Quién es Quién". Solo texto + quizzes.
import { quiz, text } from '../linux-courses/helpers.mjs'

export const modelos = {
  id: 'course-panorama-modelos-ia',
  title: 'Panorama de Modelos de IA: Quién es Quién',
  description: 'Claude, GPT, Gemini, Llama, DeepSeek y más: quién hace cada modelo, qué significan términos como "parámetros", "ventana de contexto" o "código abierto", y cómo elegir la herramienta correcta para cada tarea en vez de usar siempre la primera que conociste.',
  ai_instructions: 'Eres Ada, profesora de la Academia de IA de Oliver Academy, guiando el curso "Panorama de Modelos de IA". Sé estrictamente neutral y objetiva al comparar modelos de distintas empresas, incluyendo cuando se hable de Claude (de Anthropic) frente a sus competidores: presenta hechos verificables, evita afirmaciones de marketing sin sustento, y aclara siempre cuando algo puede haber cambiado desde que se escribió el curso, recomendando al alumno verificar información reciente sobre precios y capacidades específicas en las páginas oficiales de cada proveedor.',
  icon: '🧭',
  color: '#60a5fa',
  category: 'Inteligencia Artificial',
  subcategory: 'Modelos de IA',
  difficulty: 'intermedio',
  locked: false,
  modules: [
    text('Bienvenida: no existe "la mejor IA", existe la correcta para tu tarea',
      'Un mapa neutral de las familias de modelos más relevantes hoy.',
      `
<h2>La pregunta equivocada</h2>
<p>La pregunta que más se hace la gente — "¿cuál es la mejor IA?" — no tiene una sola respuesta correcta, porque distintos modelos son mejores en distintas cosas, cambian de posición constantemente en las comparativas, y "mejor" depende de qué necesitas: ¿velocidad? ¿costo? ¿razonamiento profundo? ¿que corra en tu propia computadora? Este curso te da el mapa para decidir tú mismo, con criterio, en vez de depender de qué modelo te tocó probar primero.</p>

<h2>Aviso importante sobre este curso</h2>
<div class="warn">
⚠️ Este es, quizás, el curso de la Academia con <strong>fecha de caducidad más corta</strong>: los modelos de IA cambian de nombre, capacidades y precios cada pocos meses. Aprende aquí los <strong>conceptos</strong> (qué es un parámetro, qué es código abierto, qué preguntas hacerte al elegir) — y verifica siempre las capacidades y precios actuales en la página oficial de cada proveedor antes de decidir.
</div>

<h2>El mapa del curso</h2>
<table>
<tr><th>Parte</th><th>Qué vas a ver</th></tr>
<tr><td>1. El vocabulario básico</td><td>Parámetros, ventana de contexto, multimodal, código abierto/cerrado.</td></tr>
<tr><td>2. Las familias principales</td><td>Quién hace cada modelo: OpenAI, Anthropic, Google, Meta y otros.</td></tr>
<tr><td>3. Código abierto vs. cerrado</td><td>Qué significa realmente, con ejemplos de cada lado.</td></tr>
<tr><td>4. Cómo elegir</td><td>Preguntas prácticas para decidir según tu tarea y presupuesto.</td></tr>
</table>
`,
      quiz('¿Por qué la pregunta "cuál es la mejor IA" no tiene una sola respuesta correcta?',
        ['Porque todos los modelos son exactamente iguales', 'Porque distintos modelos destacan en distintas tareas, y "mejor" depende de qué necesitas (velocidad, costo, razonamiento, privacidad...)', 'Porque no existen comparativas entre modelos', 'Porque solo hay un modelo de IA en el mundo'], 1)),

    text('El vocabulario básico que necesitas',
      'Parámetros, ventana de contexto y multimodalidad, explicados sin jerga.',
      `
<h2>Parámetros: el "tamaño" de un modelo</h2>
<p>Un modelo de IA se entrena ajustando millones o miles de millones de números internos llamados <strong>parámetros</strong> — piensa en ellos como perillas que el entrenamiento va afinando para que el modelo prediga mejor. En general, más parámetros suele significar más capacidad, pero no siempre significa mejor: un modelo más pequeño bien entrenado y afinado puede superar a uno más grande y mal ajustado en tareas específicas. Muchas empresas ya no publican el número exacto de parámetros de sus modelos más recientes.</p>

<h2>Ventana de contexto: cuánto puede "recordar" a la vez</h2>
<p>La <strong>ventana de contexto</strong> es la cantidad de texto (medida en "tokens", fragmentos de palabras) que un modelo puede tener en cuenta a la vez en una conversación — incluyendo tu prompt, el historial del chat, y cualquier documento que hayas subido. Una ventana más grande permite trabajar con documentos largos completos, código extenso, o conversaciones muy largas sin que el modelo "olvide" el principio.</p>

<h2>Multimodal: más allá del texto</h2>
<p>Un modelo <strong>multimodal</strong> puede procesar (y a veces generar) más de un tipo de contenido: texto, imágenes, audio, video. Por ejemplo, puedes mostrarle una foto de un problema de matemáticas escrito a mano y pedirle que lo resuelva, o pedirle que describa el contenido de una imagen.</p>

<h2>Modelos de "razonamiento"</h2>
<p>Como viste en <em>Trucos y Consejos</em>, algunos modelos están diseñados para "pensar" internamente antes de responder (una especie de chain-of-thought automático), lo que mejora resultados en matemáticas, lógica y código, a cambio de responder más lento.</p>

<h2>Tabla resumen</h2>
<table>
<tr><th>Término</th><th>En una frase</th></tr>
<tr><td>Parámetros</td><td>El "tamaño" interno del modelo — más no siempre es mejor.</td></tr>
<tr><td>Ventana de contexto</td><td>Cuánto texto puede considerar a la vez en una conversación.</td></tr>
<tr><td>Multimodal</td><td>Puede procesar texto, imágenes, audio o video, no solo texto.</td></tr>
<tr><td>Modelo de razonamiento</td><td>Piensa paso a paso antes de responder; más lento, más preciso en problemas complejos.</td></tr>
<tr><td>Token</td><td>La unidad mínima de texto que procesa un modelo (aprox. una palabra o fragmento de palabra).</td></tr>
</table>
`,
      quiz('¿Qué es la "ventana de contexto" de un modelo de IA?',
        ['El precio que cobra por cada mensaje', 'La cantidad de texto que puede tener en cuenta a la vez en una conversación (tu prompt, el historial, documentos subidos)', 'El número de idiomas que entiende', 'La velocidad con la que responde'], 1)),

    text('Anthropic y Claude',
      'Quién hace a Claude, y qué lo distingue como enfoque de empresa.',
      `
<h2>Quién es Anthropic</h2>
<p><strong>Anthropic</strong> es una empresa de investigación en inteligencia artificial fundada en 2021 por un grupo de exinvestigadores de OpenAI, entre ellos los hermanos Dario Amodei y Daniela Amodei. Se fundó con la misión explícita de asegurar que la IA a gran escala se desarrolle de forma segura y beneficiosa — la seguridad y la alineación no son un añadido posterior en su enfoque, sino parte del diseño desde el principio.</p>

<h2>La familia de modelos Claude</h2>
<p>El nombre <strong>Claude</strong> rinde homenaje a Claude Shannon, el matemático considerado el padre de la teoría de la información (y, como viste en el curso de Historia de la IA, uno de los organizadores del taller de Dartmouth de 1956). Anthropic ha publicado varias generaciones de Claude, generalmente organizadas en distintos "tamaños" dentro de cada generación (por ejemplo, versiones más rápidas y económicas junto a versiones más capaces para tareas complejas), pensadas para cubrir desde tareas simples y rápidas hasta razonamiento profundo.</p>

<h2>Un enfoque técnico propio: la IA Constitucional</h2>
<p>Anthropic desarrolló una técnica llamada <strong>IA Constitucional</strong> (Constitutional AI): en vez de depender únicamente de que humanos califiquen miles de respuestas a mano (como el RLHF que viste en el curso de Historia de la IA), se le da al modelo un conjunto de principios explícitos ("una constitución") y se entrena, en parte, usando al propio modelo para evaluar si sus respuestas siguen esos principios. La idea es hacer el proceso de alineación más transparente y escalable.</p>

<h2>Dónde se usa Claude</h2>
<ul>
<li><strong>claude.ai</strong> — la interfaz de chat directa, con funciones como Proyectos (para organizar conversaciones con contexto compartido) y Artefactos (documentos, código o visualizaciones que se generan y editan en un panel aparte del chat).</li>
<li><strong>La API de Anthropic</strong> — para que desarrolladores integren Claude en sus propias aplicaciones (así es, de hecho, como Oliver Academy conecta con la IA cuando tú usas tu propia llave).</li>
<li><strong>Claude Code</strong> — una herramienta pensada específicamente para programar, con capacidad de leer y modificar archivos de un proyecto completo.</li>
<li>Integrado también en plataformas de terceros, como Amazon Bedrock y Google Cloud Vertex AI.</li>
</ul>

<div class="tip">
💡 El curso <em>Domina Claude</em> de esta academia profundiza mucho más en cómo usar cada una de estas funciones. Aquí lo importante es entender de dónde viene y qué lo distingue como empresa.
</div>
`,
      quiz('¿Qué es la "IA Constitucional", la técnica de entrenamiento que desarrolló Anthropic?',
        ['Un sistema legal para regular la IA a nivel gubernamental', 'Un método donde se le dan al modelo principios explícitos y se usa al propio modelo para evaluar si sus respuestas los siguen, en vez de depender solo de calificaciones humanas manuales', 'El nombre comercial de Claude', 'Una ley aprobada en Estados Unidos'], 1)),

    text('OpenAI y Google DeepMind',
      'Los otros dos grandes laboratorios detrás de GPT y Gemini.',
      `
<h2>OpenAI y la familia GPT</h2>
<p><strong>OpenAI</strong> se fundó en 2015, originalmente como organización sin fines de lucro con la misión de asegurar que la inteligencia artificial general beneficie a toda la humanidad; en 2019 creó una estructura con un brazo con fines de lucro limitados para poder atraer la inversión masiva que requiere entrenar modelos de esta escala. Es la empresa detrás de la familia de modelos <strong>GPT</strong> (Generative Pre-trained Transformer) y de <strong>ChatGPT</strong>, el producto que, como viste en el curso de Historia de la IA, llevó los modelos de lenguaje al público masivo en noviembre de 2022. También desarrolla modelos de generación de imágenes (DALL-E) y de voz.</p>

<h2>Google DeepMind y la familia Gemini</h2>
<p><strong>DeepMind</strong> es un laboratorio de investigación en IA fundado en Londres en 2010 (adquirido por Google en 2014), responsable de hitos como AlphaGo (2016) y AlphaFold (que resolvió en gran medida el problema de predecir la estructura 3D de proteínas, reconocido con el Premio Nobel de Química en 2024 para sus creadores). En 2023, Google fusionó DeepMind con su otro equipo de IA (Google Brain) en una sola organización, <strong>Google DeepMind</strong>, que desarrolla la familia de modelos <strong>Gemini</strong>, multimodal desde su diseño, e integrada en productos de Google como Search, Workspace y Android.</p>

<h2>Un vistazo comparativo (conceptual, no de rendimiento)</h2>
<table>
<tr><th>Empresa</th><th>Familia de modelos</th><th>Fundada</th><th>Rasgo distintivo</th></tr>
<tr><td>Anthropic</td><td>Claude</td><td>2021</td><td>Enfoque explícito en seguridad e IA Constitucional</td></tr>
<tr><td>OpenAI</td><td>GPT / ChatGPT</td><td>2015</td><td>El producto que popularizó los chatbots de IA masivamente</td></tr>
<tr><td>Google DeepMind</td><td>Gemini</td><td>2010 (DeepMind) / 2023 (fusión)</td><td>Multimodal desde el diseño, integrado en el ecosistema Google</td></tr>
</table>

<div class="warn">
⚠️ No incluimos aquí una tabla de "quién es mejor" a propósito — esas comparativas cambian cada pocos meses con cada lanzamiento nuevo. Lo que sí se mantiene estable es entender quién es cada empresa y qué la distingue como organización.
</div>
`,
      quiz('¿Qué logro de Google DeepMind fue reconocido con un Premio Nobel en 2024?',
        ['La creación de ChatGPT', 'AlphaFold, por predecir la estructura 3D de proteínas', 'El lanzamiento de Gemini', 'La fundación de la empresa'], 1)),

    text('Meta, Mistral, DeepSeek y el auge de los modelos abiertos',
      'Cuando "descargar el modelo" se volvió una opción real, no solo usar una API.',
      `
<h2>Meta y Llama: código abierto a gran escala</h2>
<p><strong>Meta</strong> (la empresa detrás de Facebook, Instagram y WhatsApp) desarrolla la familia de modelos <strong>Llama</strong>, que a diferencia de Claude, GPT o Gemini, se publica con <strong>pesos abiertos</strong> (ver la siguiente clase para el significado exacto): cualquiera puede descargar el modelo y ejecutarlo en su propio hardware, o modificarlo, sujeto a los términos de su licencia. Esto ha impulsado una comunidad enorme de investigadores y desarrolladores que construyen sobre Llama sin depender de una API de pago.</p>

<h2>Mistral AI: el jugador europeo</h2>
<p><strong>Mistral AI</strong>, fundada en Francia en 2023, se ha posicionado como una alternativa europea relevante, con varios modelos publicados como pesos abiertos y otros disponibles solo por API, apostando por eficiencia (buen rendimiento con modelos relativamente más pequeños).</p>

<h2>DeepSeek: la sorpresa china</h2>
<p><strong>DeepSeek</strong>, una empresa china, generó un fuerte impacto en la industria a inicios de 2025 al publicar modelos de código/pesos abiertos con capacidades de razonamiento competitivas frente a modelos líderes, entrenados con un costo reportado significativamente menor al de sus competidores — lo que generó un debate amplio en la industria sobre cuánto realmente cuesta entrenar un modelo de punta.</p>

<h2>Otros nombres que vale la pena conocer</h2>
<table>
<tr><th>Organización</th><th>Nota</th></tr>
<tr><td>xAI (Elon Musk)</td><td>Desarrolla la familia de modelos Grok, integrada en la plataforma X.</td></tr>
<tr><td>Alibaba (Qwen)</td><td>Otra familia relevante de modelos abiertos con origen chino.</td></tr>
<tr><td>Hugging Face</td><td>No es un laboratorio que entrena su propio modelo insignia, sino la plataforma comunitaria más usada para alojar, compartir y descargar miles de modelos abiertos de código y pesos abiertos.</td></tr>
</table>

<div class="tip">
💡 El panorama de modelos abiertos cambia especialmente rápido — nuevos laboratorios y modelos competitivos aparecen constantemente. La clase siguiente te da el marco conceptual (abierto vs. cerrado) que sigue siendo útil sin importar qué modelo específico sea el más reciente cuando la leas.
</div>
`,
      quiz('¿Qué hizo particularmente notable a DeepSeek a inicios de 2025?',
        ['Fue la primera empresa de IA en existir', 'Publicó modelos abiertos con capacidades de razonamiento competitivas y un costo de entrenamiento reportado mucho menor al de sus competidores', 'Solo hace modelos de generación de imágenes', 'Es una división de Google'], 1)),

    text('Código abierto vs. cerrado: qué significa realmente',
      'Ni todo lo "abierto" es igual de abierto, ni "cerrado" significa lo que piensas.',
      `
<h2>El espectro, no una regla de dos opciones</h2>
<p>"Código abierto" en IA no es un simple sí/no — es un espectro, y los términos se usan con distinto rigor según quién los use.</p>

<table>
<tr><th>Nivel</th><th>Qué significa</th><th>Ejemplo típico</th></tr>
<tr><td>Cerrado (API únicamente)</td><td>Solo puedes usar el modelo a través de una API o interfaz del proveedor; no puedes descargarlo ni ver cómo está construido por dentro.</td><td>Claude, GPT-4/5, Gemini (los modelos más avanzados de cada familia, generalmente)</td></tr>
<tr><td>Pesos abiertos ("open weights")</td><td>Puedes descargar los parámetros ya entrenados y ejecutar el modelo tú mismo, pero no necesariamente los datos ni el código exacto de entrenamiento.</td><td>Llama (Meta), muchos modelos de Mistral, DeepSeek, Qwen</td></tr>
<tr><td>Verdaderamente abierto</td><td>Se publican también los datos de entrenamiento y el código completo, permitiendo reproducir el proceso desde cero — mucho menos común, por el costo y complejidad de compartir todo.</td><td>Algunos proyectos académicos y de organizaciones sin fines de lucro</td></tr>
</table>

<h2>Ventajas de los pesos abiertos</h2>
<ul>
<li><strong>Privacidad:</strong> puedes correr el modelo en tu propio servidor, sin enviar tus datos a ningún proveedor externo.</li>
<li><strong>Costo a largo plazo:</strong> sin pagar por cada llamada a una API, aunque necesitas tu propio hardware (a veces costoso).</li>
<li><strong>Personalización:</strong> se puede afinar (fine-tuning) el modelo para una tarea muy específica.</li>
<li><strong>Sin dependencia de un solo proveedor:</strong> si el modelo funciona hoy, seguirá funcionando aunque la empresa cambie sus términos.</li>
</ul>

<h2>Ventajas de los modelos cerrados</h2>
<ul>
<li>Suelen estar entre los más capaces disponibles en un momento dado (aunque esto cambia con cada lanzamiento).</li>
<li>No necesitas hardware propio potente — el proveedor se encarga de la infraestructura.</li>
<li>Actualizaciones y mejoras continuas sin que tú tengas que hacer nada.</li>
</ul>

<div class="warn">
⚠️ Un modelo de "pesos abiertos" no es necesariamente más seguro de usar ni más transparente en su comportamiento — la mayoría no publica los datos exactos con los que se entrenó. "Abierto" se refiere principalmente a poder descargar y ejecutar el modelo, no a un análisis completo de cómo se construyó.
</div>
`,
      quiz('¿Qué distingue a un modelo de "pesos abiertos" (open weights) de uno verdaderamente abierto?',
        ['No hay ninguna diferencia, son sinónimos', 'El de pesos abiertos permite descargar y ejecutar el modelo, pero no necesariamente incluye los datos de entrenamiento ni el código completo del proceso', 'El de pesos abiertos siempre es gratuito y el otro nunca lo es', 'Un modelo de pesos abiertos no se puede usar comercialmente bajo ninguna licencia'], 1)),

    text('Más allá del texto: modelos especializados',
      'Imágenes, audio, video y modelos científicos — no todo es un chatbot de texto.',
      `
<h2>Generación de imágenes</h2>
<table>
<tr><th>Modelo/herramienta</th><th>Empresa</th></tr>
<tr><td>DALL-E</td><td>OpenAI</td></tr>
<tr><td>Midjourney</td><td>Midjourney, Inc. (independiente)</td></tr>
<tr><td>Stable Diffusion</td><td>Stability AI (con versiones de pesos abiertos)</td></tr>
<tr><td>Imagen</td><td>Google DeepMind</td></tr>
</table>

<h2>Audio y voz</h2>
<p>Modelos como Whisper (OpenAI, transcripción de voz a texto, con versiones de código abierto) y ElevenLabs (síntesis de voz muy realista) representan otra rama completa de la IA, distinta de los modelos de lenguaje conversacionales.</p>

<h2>Video generativo</h2>
<p>Herramientas como Sora (OpenAI) o Veo (Google DeepMind) generan clips de video a partir de descripciones de texto — un área que avanzó muy rápido entre 2024 y 2026, aunque sigue siendo computacionalmente muy costosa comparada con generar texto o imágenes.</p>
<p>El curso <em>IA Generativa: Imágenes, Audio y Video</em> de esta academia profundiza en todo esto.</p>

<h2>Modelos científicos especializados</h2>
<p>No toda la IA relevante es "un chatbot": <strong>AlphaFold</strong> (DeepMind) predice la estructura tridimensional de proteínas a partir de su secuencia genética, acelerando drásticamente la investigación biomédica — un ejemplo de IA entrenada para un problema científico específico, no para conversar.</p>

<h2>Modelos "pequeños" para dispositivos</h2>
<p>Existe también una categoría de modelos deliberadamente pequeños y eficientes, diseñados para correr directamente en un teléfono o una computadora sin necesitar un servidor en la nube — con capacidades más limitadas, pero con ventajas de privacidad (los datos nunca salen del dispositivo) y de funcionamiento sin conexión a internet.</p>

<div class="tip">
💡 Cuando pienses en "IA", vale la pena recordar que el chat de texto es solo la punta del iceberg de un campo mucho más amplio.
</div>
`,
      quiz('¿Qué hace especial a AlphaFold frente a un modelo de lenguaje como Claude o GPT?',
        ['Es más rápido para escribir textos', 'Está entrenado para un problema científico específico — predecir la estructura 3D de proteínas — no para conversar', 'Es el modelo de lenguaje más grande que existe', 'Fue el primer modelo de IA de la historia'], 1)),

    text('Cómo elegir el modelo correcto para tu tarea',
      'Preguntas prácticas antes de decidir, sin depender de rankings que cambian cada mes.',
      `
<h2>Preguntas que importan más que "cuál es el mejor"</h2>
<table>
<tr><th>Pregunta</th><th>Por qué importa</th></tr>
<tr><td>¿Necesito velocidad o profundidad?</td><td>Un modelo más rápido y ligero puede bastar para tareas simples; uno de razonamiento profundo brilla en problemas complejos, pero tarda más.</td></tr>
<tr><td>¿Cuánto contexto necesito?</td><td>Documentos largos o código extenso requieren una ventana de contexto grande.</td></tr>
<tr><td>¿Necesito imágenes, audio o solo texto?</td><td>No todos los modelos son multimodales de la misma forma.</td></tr>
<tr><td>¿Me importa la privacidad de mis datos?</td><td>Un modelo de pesos abiertos corriendo en tu propio equipo mantiene tus datos localmente.</td></tr>
<tr><td>¿Cuál es mi presupuesto?</td><td>Los precios varían mucho entre proveedores y entre el modelo "rápido" y el "más capaz" de cada familia.</td></tr>
<tr><td>¿Necesito que use herramientas (buscar en internet, ejecutar código)?</td><td>No todas las interfaces ofrecen las mismas capacidades adicionales.</td></tr>
</table>

<h2>Un consejo práctico: prueba, no asumas</h2>
<p>Muchos proveedores ofrecen niveles gratuitos o de bajo costo — antes de comprometerte con uno solo, prueba la misma tarea real (no un ejemplo genérico) en dos o tres modelos distintos y compara tú mismo los resultados para <strong>tu</strong> caso de uso específico. Las comparativas generales publicadas en internet no siempre reflejan cómo se comporta un modelo con tus propias tareas.</p>

<h2>No tienes que elegir uno solo para siempre</h2>
<p>Es perfectamente razonable usar distintos modelos para distintas tareas: uno rápido y barato para preguntas cotidianas, uno de razonamiento para problemas complejos, uno de pesos abiertos si la privacidad es crítica para ese proyecto en particular. No existe una lealtad obligada a una sola marca.</p>

<h2>Cómo se conecta esto con Oliver Academy</h2>
<p>La plataforma funciona con el modelo <strong>BYOK</strong> (<em>bring your own key</em>, trae tu propia llave): tú decides qué proveedor de IA conectas para tu mascota y los personajes del campus — Claude, GPT, Gemini u otro compatible. Nada de lo que aprendiste en este curso es solo teoría: es exactamente la decisión que tomas al configurar tu cuenta.</p>

<div class="tip">
💡 Repaso final: <strong>vocabulario</strong> (parámetros, contexto, multimodal), <strong>quién hace qué</strong> (Anthropic/Claude, OpenAI/GPT, Google DeepMind/Gemini, Meta/Llama y más), <strong>abierto vs. cerrado</strong>, y ahora, cómo <strong>elegir con criterio</strong> en vez de por costumbre.
</div>
`,
      quiz('¿Cuál es el consejo práctico más importante de esta clase para elegir un modelo?',
        ['Usar siempre el modelo más famoso, sin importar la tarea', 'Probar la misma tarea real en dos o tres modelos distintos y comparar los resultados para tu caso específico, en vez de confiar solo en rankings generales', 'Nunca cambiar de modelo una vez elegido', 'Elegir siempre el modelo más caro disponible'], 1)),
  ],
}
