// Curso "IA Generativa: Imágenes, Audio y Video". Solo texto + quizzes.
import { quiz, text } from '../linux-courses/helpers.mjs'

export const generativa = {
  id: 'course-ia-generativa',
  title: 'IA Generativa: Imágenes, Audio y Video',
  description: 'Cómo funciona la IA que genera imágenes, música, voces y video a partir de una descripción de texto: modelos de difusión explicados sin fórmulas, cómo escribir mejores prompts visuales, las herramientas más conocidas, y las preguntas de autoría y desinformación que esta tecnología pone sobre la mesa.',
  ai_instructions: 'Eres Ada, profesora de la Academia de IA de Oliver Academy, guiando el curso "IA Generativa: Imágenes, Audio y Video". Explica los conceptos técnicos (modelos de difusión, prompts visuales) con analogías simples y sin fórmulas matemáticas. Sé honesta y balanceada sobre los debates de derechos de autor y desinformación (deepfakes) que rodean esta tecnología, sin tomar partido de forma tajante en temas que siguen legalmente sin resolver, y recuerda siempre el uso ético y con consentimiento de estas herramientas.',
  icon: '🎨',
  color: '#a78bfa',
  category: 'Inteligencia Artificial',
  subcategory: 'IA Generativa',
  difficulty: 'principiante',
  locked: false,
  modules: [
    text('Bienvenida: cuando la IA no solo escribe, también crea',
      'Del texto a imágenes, música, voces y video — un vistazo al panorama completo.',
      `
<h2>Un campo distinto del que ya conoces</h2>
<p>Los cursos anteriores de esta academia se enfocaron en modelos de <strong>texto</strong> (Claude, GPT, Gemini). Este curso te lleva a un terreno relacionado pero distinto: modelos entrenados específicamente para <strong>generar contenido visual y sonoro</strong> — imágenes a partir de una descripción, música original, voces sintéticas casi indistinguibles de una persona real, y clips de video generados desde cero.</p>

<h2>El mapa del curso</h2>
<table>
<tr><th>Parte</th><th>Qué vas a ver</th></tr>
<tr><td>1. Cómo funciona</td><td>Modelos de difusión, explicados sin matemáticas.</td></tr>
<tr><td>2. Imágenes</td><td>Las herramientas principales y cómo escribir mejores prompts visuales.</td></tr>
<tr><td>3. Audio y voz</td><td>Música generada y clonación de voz.</td></tr>
<tr><td>4. Video</td><td>El terreno más nuevo y más costoso computacionalmente.</td></tr>
<tr><td>5. Los debates reales</td><td>Autoría, derechos de autor y desinformación — sin evadir el tema.</td></tr>
</table>

<div class="warn">
⚠️ Este es un campo que evoluciona casi tan rápido como el de los modelos de lenguaje — los nombres de herramientas específicas de esta clase pueden cambiar; los conceptos de fondo (cómo funcionan, qué preguntas éticas generan) se mantienen mucho más estables.
</div>
`,
      quiz('¿En qué se diferencia este curso de los anteriores de la Academia de IA?',
        ['Es exactamente igual, solo repite el contenido', 'Se enfoca en modelos que generan contenido visual y sonoro (imágenes, audio, video), no solo texto', 'Solo habla de modelos de texto como Claude', 'No tiene ninguna relación con los cursos anteriores'], 1)),

    text('Modelos de difusión: cómo "nace" una imagen generada',
      'La idea central detrás de casi toda la IA de imágenes actual, sin una sola fórmula.',
      `
<h2>La idea, con una analogía</h2>
<p>Imagina una escultura hecha de mármol: el escultor no "agrega" la forma, la <strong>revela</strong> quitando piedra sobrante hasta que aparece la figura. Un <strong>modelo de difusión</strong> hace algo conceptualmente parecido, pero al revés: empieza con una imagen de puro ruido aleatorio (como la estática de un televisor viejo) y, paso a paso, va "quitando ruido" de forma guiada, hasta que emerge una imagen coherente que corresponde a tu descripción de texto.</p>

<h2>Cómo se entrena un modelo así</h2>
<ol>
<li>Se toman millones de imágenes reales (con sus descripciones de texto asociadas).</li>
<li>A cada imagen se le va agregando ruido gradualmente, paso a paso, hasta que queda irreconocible.</li>
<li>El modelo aprende a hacer el proceso <strong>inverso</strong>: predecir, en cada paso, cómo quitar un poquito de ruido para acercarse a una imagen real.</li>
<li>Al generar una imagen nueva, el modelo empieza de ruido puro y aplica ese proceso inverso muchas veces, guiado por tu descripción de texto en cada paso.</li>
</ol>

<h2>Por qué el mismo prompt da resultados distintos cada vez</h2>
<p>El punto de partida es <strong>ruido aleatorio</strong> — por eso, aunque uses exactamente el mismo prompt dos veces, normalmente obtienes imágenes distintas (a menos que fijes explícitamente una "semilla" de aleatoriedad, una opción que algunas herramientas ofrecen para reproducir el mismo resultado).</p>

<h2>Modelos de difusión más allá de imágenes</h2>
<p>La misma idea matemática de fondo (aprender a revertir un proceso de "agregar ruido") se aplica también a la generación de audio y, con adaptaciones, a video — por eso vas a ver el concepto de difusión reaparecer en las siguientes clases de este curso.</p>

<div class="tip">
💡 No necesitas entender las matemáticas exactas para usar estas herramientas bien — pero entender la idea de "partir de ruido y refinar guiado por tu descripción" te ayuda a entender por qué los resultados varían, y por qué describir mejor tu idea (siguiente clase) mejora tanto el resultado final.
</div>
`,
      quiz('¿Por qué el mismo prompt de texto suele dar una imagen distinta cada vez que lo usas en un modelo de difusión?',
        ['Porque el modelo tiene mala memoria', 'Porque el proceso empieza desde ruido aleatorio distinto cada vez, salvo que se fije explícitamente una "semilla" para reproducir el mismo resultado', 'Porque los servidores fallan constantemente', 'No es cierto, siempre da exactamente el mismo resultado'], 1)),

    text('Herramientas de generación de imágenes',
      'Quién hace qué, y las diferencias reales entre las opciones más conocidas.',
      `
<h2>Las herramientas principales</h2>
<table>
<tr><th>Herramienta</th><th>Empresa/origen</th><th>Rasgo distintivo</th></tr>
<tr><td>DALL-E</td><td>OpenAI</td><td>Integrado directamente en ChatGPT, fácil de usar conversacionalmente.</td></tr>
<tr><td>Midjourney</td><td>Midjourney, Inc.</td><td>Conocido por un estilo visual particularmente artístico y pulido "de fábrica".</td></tr>
<tr><td>Stable Diffusion</td><td>Stability AI</td><td>Con versiones de pesos abiertos — se puede ejecutar en tu propia computadora, y tiene una enorme comunidad de personalizaciones.</td></tr>
<tr><td>Imagen</td><td>Google DeepMind</td><td>Integrado en productos de Google.</td></tr>
</table>

<h2>Qué buscar al elegir una herramienta</h2>
<ul>
<li><strong>Facilidad de uso vs. control:</strong> algunas priorizan simplicidad (describe y listo); otras te dejan ajustar muchísimos parámetros técnicos para control fino.</li>
<li><strong>Estilo visual "de fábrica":</strong> cada herramienta tiende a un estilo característico, incluso con el mismo prompt.</li>
<li><strong>Licencia de uso:</strong> revisa siempre si puedes usar las imágenes generadas comercialmente, según los términos vigentes de cada herramienta.</li>
<li><strong>Costo:</strong> varía mucho entre niveles gratuitos limitados y planes de pago.</li>
</ul>

<h2>Funciones más allá de "texto a imagen"</h2>
<table>
<tr><th>Función</th><th>Qué hace</th></tr>
<tr><td>Imagen a imagen</td><td>Partir de una imagen existente y transformarla según una descripción.</td></tr>
<tr><td>Edición por regiones (inpainting)</td><td>Modificar solo una parte específica de una imagen, dejando el resto intacto.</td></tr>
<tr><td>Extensión de imagen (outpainting)</td><td>Ampliar una imagen más allá de sus bordes originales, generando contenido coherente con el resto.</td></tr>
<tr><td>Control de composición</td><td>Guiar la pose, el encuadre o la estructura con referencias adicionales, no solo con texto.</td></tr>
</table>

<div class="tip">
💡 No hay una herramienta "objetivamente mejor" — como viste en <em>Panorama de Modelos de IA</em>, la elección correcta depende de tu tarea, presupuesto y si necesitas control fino o simplemente una idea rápida.
</div>
`,
      quiz('¿Qué distingue a Stable Diffusion de herramientas como Midjourney o DALL-E?',
        ['Solo genera imágenes en blanco y negro', 'Tiene versiones de pesos abiertos que se pueden ejecutar en tu propia computadora', 'No puede generar ningún tipo de imagen realista', 'Es la única herramienta de este tipo que existe'], 1)),

    text('Cómo escribir mejores prompts visuales',
      'La descripción de texto es tu única herramienta de dirección — úsala bien.',
      `
<h2>La estructura de un buen prompt visual</h2>
<p>A diferencia de conversar con un chatbot de texto, un prompt de imagen suele funcionar mejor como una descripción densa y específica, más parecida a instrucciones para un fotógrafo o ilustrador que a una conversación.</p>

<table>
<tr><th>Elemento</th><th>Ejemplo</th></tr>
<tr><td>Sujeto principal</td><td>"Un zorro rojo sentado en un tronco"</td></tr>
<tr><td>Estilo artístico</td><td>"al estilo de una acuarela", "fotografía realista", "arte pixel"</td></tr>
<tr><td>Iluminación y ambiente</td><td>"luz dorada de atardecer", "niebla suave en el fondo"</td></tr>
<tr><td>Composición y encuadre</td><td>"primer plano", "vista aérea", "regla de los tercios"</td></tr>
<tr><td>Detalles técnicos (si aplica)</td><td>"alta resolución", "profundidad de campo"</td></tr>
</table>

<h2>Antes/después</h2>
<div class="example">
<strong>Antes:</strong> "Un gato."<br>
<strong>Después:</strong> "Un gato naranja atigrado durmiendo enroscado sobre un cojín de lana azul, luz suave de mañana entrando por una ventana, estilo fotografía realista, enfoque nítido en el gato con fondo ligeramente difuminado."
</div>

<h2>Prompts negativos</h2>
<p>Muchas herramientas permiten especificar qué <strong>NO</strong> quieres ver ("sin texto", "sin manos deformes", "sin marcas de agua") — un "prompt negativo" separado del prompt principal, útil para corregir errores comunes específicos de cada modelo.</p>

<h2>Itera igual que con texto</h2>
<p>Los mismos hábitos del curso <em>Trucos y Consejos</em> aplican aquí: genera una primera versión, identifica qué no funciona, y ajusta el prompt de forma específica (no reescribas todo desde cero) — muchas herramientas te dejan partir de una imagen generada y refinarla, en vez de empezar de nuevo cada vez.</p>

<div class="tip">
💡 Una limitación técnica conocida: los modelos de generación de imágenes históricamente han tenido dificultad para dibujar manos y texto legible de forma consistente — aunque esto ha mejorado notablemente con cada nueva generación de modelos.
</div>
`,
      quiz('¿Qué es un "prompt negativo" en la generación de imágenes?',
        ['Un prompt escrito con mal humor', 'Una especificación separada de lo que NO quieres que aparezca en la imagen generada', 'Un tipo de imagen en blanco y negro', 'Un error del sistema'], 1)),

    text('Audio generativo: música y voz sintética',
      'De componer una canción completa a clonar una voz — con enorme responsabilidad de por medio.',
      `
<h2>Generación de música</h2>
<p>Herramientas de IA pueden componer música original a partir de una descripción de texto ("una canción pop alegre sobre el verano", "instrumental de piano melancólico") — generando tanto la melodía como, en algunas herramientas, la letra y una voz cantada sintética completa. Esto plantea preguntas serias sobre derechos de autor cuando el modelo se entrenó con música protegida, un tema que retomamos en la clase de debates éticos.</p>

<h2>Transcripción: de voz a texto</h2>
<p>En la dirección opuesta, modelos como Whisper (OpenAI, con versiones de código abierto) transcriben audio hablado a texto con gran precisión, incluso en varios idiomas y con ruido de fondo — una tecnología que suele pasar más desapercibida que la generación, pero que está detrás de subtítulos automáticos, transcripción de reuniones, y asistentes de voz.</p>

<h2>Síntesis de voz (texto a voz)</h2>
<p>Herramientas como ElevenLabs generan voz sintética a partir de texto con una naturalidad muy alta — entonación, pausas y respiración que, en muchos casos, resulta difícil de distinguir de una grabación humana real.</p>

<h2>Clonación de voz: la función más delicada de este curso</h2>
<div class="warn">
⚠️ Algunas herramientas permiten <strong>clonar una voz específica</strong> a partir de solo unos segundos de audio de referencia, generando después cualquier texto nuevo con esa voz. Esta capacidad tiene usos legítimos importantes (doblaje, accesibilidad para personas que perdieron la capacidad de hablar, preservar la voz de alguien) — y también un riesgo real de suplantación y fraude si se usa sin consentimiento de la persona cuya voz se clona. Nunca clones la voz de alguien sin su permiso explícito, y sé escéptico ante audios que "suenan" a alguien conocido en un contexto sospechoso — la tecnología para falsificarlos de forma convincente ya existe y es accesible.
</div>

<h2>Cómo detectar (o sospechar) audio generado</h2>
<ul>
<li>Verifica la fuente: ¿de dónde salió el audio realmente, no solo quién lo comparte?</li>
<li>Desconfía de audios "filtrados" sin contexto verificable, especialmente si generan una reacción emocional fuerte o urgente.</li>
<li>Algunas plataformas ya incluyen marcas de agua o metadatos que identifican contenido generado por IA — aunque no todas, y no es un sistema infalible todavía.</li>
</ul>
`,
      quiz('¿Cuál es el riesgo principal de la clonación de voz sin consentimiento?',
        ['Que la voz suene poco natural', 'Suplantación de identidad y fraude, ya que se puede generar cualquier texto nuevo con la voz de una persona real sin su permiso', 'Que tarda demasiado tiempo en generarse', 'No existe ningún riesgo real'], 1)),

    text('Video generativo: el terreno más nuevo',
      'Generar movimiento coherente es mucho más difícil que generar una sola imagen.',
      `
<h2>Por qué el video es el reto más difícil</h2>
<p>Generar una imagen requiere que el modelo produzca un solo cuadro coherente. Generar video requiere que <strong>docenas de cuadros consecutivos</strong> sean coherentes entre sí — que un objeto no cambie de forma inexplicablemente de un cuadro al siguiente, que el movimiento sea físicamente plausible, que la iluminación se mantenga consistente. Esto hace que el video generativo sea, computacionalmente, mucho más costoso y complejo que la generación de imágenes.</p>

<h2>Herramientas principales</h2>
<table>
<tr><th>Herramienta</th><th>Empresa</th></tr>
<tr><td>Sora</td><td>OpenAI</td></tr>
<tr><td>Veo</td><td>Google DeepMind</td></tr>
<tr><td>Runway</td><td>Runway (independiente, pionera en el espacio)</td></tr>
</table>

<h2>Qué tan bien funciona hoy</h2>
<p>El video generativo avanzó extraordinariamente rápido entre 2024 y 2026, pasando de clips muy cortos y con artefactos visuales evidentes a videos de varios segundos con calidad notablemente más convincente. Aun así, sigue teniendo limitaciones: clips relativamente cortos, dificultad con movimientos físicos complejos o interacciones detalladas entre varios objetos, y un costo computacional considerablemente mayor por segundo generado que el de una imagen o un párrafo de texto.</p>

<h2>Usos actuales más comunes</h2>
<ul>
<li>Prototipos visuales rápidos para publicidad o cine, antes de una producción real.</li>
<li>Efectos visuales y animación de elementos específicos dentro de un proyecto más grande.</li>
<li>Contenido corto para redes sociales.</li>
<li>Visualización de conceptos que serían costosos de filmar de otra forma.</li>
</ul>

<div class="warn">
⚠️ El video generativo es también donde el riesgo de <strong>deepfakes</strong> (videos falsos que aparentan mostrar a una persona real diciendo o haciendo algo que nunca ocurrió) se vuelve más grave — un tema central de la siguiente clase.
</div>

<div class="tip">
💡 Este es el área de la IA generativa que probablemente cambie más rápido en los próximos años — lo que hoy es una limitación técnica clara (duración corta, movimientos torpes) es razonable esperar que mejore de forma significativa.
</div>
`,
      quiz('¿Por qué generar video es un reto técnico más difícil que generar una sola imagen?',
        ['Porque el video usa colores distintos', 'Porque requiere que muchos cuadros consecutivos sean coherentes entre sí (forma, movimiento, iluminación), no solo un cuadro aislado', 'Porque no existen herramientas para generar video', 'Porque el video no usa modelos de difusión'], 1)),

    text('Los debates reales: autoría, derechos de autor y desinformación',
      'Preguntas sin respuesta simple, que como usuario informado conviene entender.',
      `
<h2>¿De quién es una imagen generada por IA?</h2>
<p>Esta pregunta legal sigue sin una respuesta única y universal — varía según el país y sigue evolucionando. Algunos puntos que ya son relativamente claros en varias jurisdicciones (aunque sujetos a cambios):</p>
<table>
<tr><th>Pregunta</th><th>Panorama general (verifica las leyes vigentes de tu país)</th></tr>
<tr><td>¿Puedo tener derechos de autor sobre algo generado 100% por IA, sin edición humana?</td><td>En varias jurisdicciones, incluyendo Estados Unidos, la postura oficial ha sido que una obra necesita una contribución creativa humana significativa para tener derechos de autor.</td></tr>
<tr><td>¿Es legal entrenar un modelo con imágenes protegidas por derechos de autor, sin permiso de sus autores?</td><td>Es exactamente el centro de varias demandas activas contra empresas de IA — sin un veredicto único y definitivo aplicable a todos los casos todavía.</td></tr>
<tr><td>¿Puedo usar comercialmente una imagen generada por IA?</td><td>Depende de los términos de servicio específicos de la herramienta que uses — revísalos siempre antes de un uso comercial.</td></tr>
</table>

<h2>El debate de los artistas y creadores</h2>
<p>Muchos artistas, músicos y actores de voz han expresado una preocupación legítima: sus obras se usaron para entrenar estos modelos sin su consentimiento explícito ni compensación, y ahora esos mismos modelos pueden generar contenido "al estilo de" su trabajo. Es un debate genuino sobre justicia y compensación, no una simple resistencia al cambio tecnológico — y está activamente en disputa legal en varios países.</p>

<h2>Deepfakes y desinformación</h2>
<p>La combinación de imágenes, audio y video generativo hace posible crear contenido falso extremadamente convincente que aparenta mostrar a una persona real diciendo o haciendo algo que nunca ocurrió — con riesgos serios para la reputación de personas, el fraude, y la desinformación política y electoral.</p>

<h2>Qué puedes hacer como usuario responsable</h2>
<ul>
<li><strong>Nunca</strong> generes contenido que suplante a una persona real sin su consentimiento explícito.</li>
<li>Etiqueta claramente el contenido generado por IA cuando lo compartas, especialmente si podría confundirse con algo real.</li>
<li>Sé escéptico ante contenido audiovisual sorprendente sin fuente verificable, especialmente en temas sensibles o urgentes.</li>
<li>Revisa los términos de licencia antes de un uso comercial de cualquier contenido generado.</li>
</ul>

<div class="tip">
💡 El curso <em>Ética e Impacto de la IA en la Sociedad</em> de esta academia profundiza mucho más en estos temas, más allá de la generación de imágenes y video específicamente.
</div>
`,
      quiz('¿Cuál es una regla clara de uso responsable de la IA generativa que deberías seguir siempre?',
        ['Generar cualquier contenido sin restricciones, sin importar a quién represente', 'Nunca generar contenido que suplante a una persona real sin su consentimiento explícito', 'Nunca revisar los términos de licencia de las herramientas', 'Compartir cualquier video sorprendente sin verificar su fuente'], 1)),
  ],
}
