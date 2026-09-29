// Curso "Historia de la Inteligencia Artificial". Solo texto + quizzes.
import { quiz, text } from '../linux-courses/helpers.mjs'

export const historia = {
  id: 'course-historia-ia',
  title: 'Historia de la Inteligencia Artificial',
  description: 'De Turing y el verano de Dartmouth de 1956 a ChatGPT: los dos "inviernos de la IA", el resurgimiento del aprendizaje automático, la revolución de las redes neuronales profundas y los transformers que hicieron posible a Claude, GPT y compañía.',
  ai_instructions: 'Eres Ada, profesora de la Academia de IA de Oliver Academy, guiando el curso "Historia de la Inteligencia Artificial". Cuenta la historia con personas y momentos reales (Turing, McCarthy, Minsky, Hinton, Vaswani y el paper de los transformers) y distingue siempre entre hechos documentados y simplificaciones didácticas. Explica los términos técnicos (red neuronal, backpropagation, transformer, parámetro) con analogías simples y nunca asumas que el alumno ya sabe programar o matemáticas avanzadas.',
  icon: '🧠',
  color: '#98ca3f',
  category: 'Inteligencia Artificial',
  subcategory: 'Historia de la IA',
  difficulty: 'principiante',
  locked: false,
  modules: [
    text('Bienvenida: la IA no nació ayer',
      'Setenta años de una idea que tardó décadas en funcionar de verdad.',
      `
<h2>Una historia más larga de lo que parece</h2>
<p>Es fácil pensar que la inteligencia artificial "apareció" con ChatGPT en 2022. En realidad, la idea de construir una máquina que piense tiene más de 70 años, y pasó por dos momentos de entusiasmo enorme seguidos de dos "inviernos" donde el dinero y la fe casi desaparecieron. Entender esa historia te da algo que las noticias de hoy no dan: perspectiva sobre qué tan rápido — y qué tan lento — avanza esto realmente.</p>

<h2>El mapa del curso</h2>
<table>
<tr><th>Parte</th><th>Qué vas a ver</th></tr>
<tr><td>1. Los orígenes</td><td>Turing, el verano de Dartmouth de 1956, y la IA simbólica.</td></tr>
<tr><td>2. Los inviernos</td><td>Por qué la IA decepcionó dos veces y casi se abandona.</td></tr>
<tr><td>3. El aprendizaje automático</td><td>Cuando se dejó de programar reglas y se empezó a entrenar con datos.</td></tr>
<tr><td>4. Deep learning</td><td>El "big bang" de 2012 y la explosión de redes neuronales profundas.</td></tr>
<tr><td>5. Los transformers y los LLM</td><td>El paper de 2017 que hizo posible a ChatGPT, Claude y Gemini.</td></tr>
</table>

<div class="tip">
💡 Este curso es la base para el resto de la Academia de IA: una vez que entiendes de dónde viene todo, cursos como <em>Panorama de Modelos de IA</em> o <em>Domina Claude</em> tienen mucho más sentido.
</div>
`,
      quiz('¿Qué tienen en común los dos "inviernos de la IA" que vas a estudiar?',
        ['Fueron años de máximo financiamiento', 'Fueron periodos de gran decepción donde el interés y el dinero en IA casi desaparecieron', 'Ocurrieron en la misma década', 'Nunca existieron, es un mito'], 1)),

    text('1950-1956: Turing y el nacimiento de un campo',
      'Una pregunta, una prueba, y un verano en Dartmouth que le puso nombre a todo.',
      `
<h2>"¿Pueden pensar las máquinas?"</h2>
<p>En 1950 el matemático británico <strong>Alan Turing</strong> publicó un artículo que empezaba con esa pregunta. En vez de intentar definir "pensar" (un debate filosófico sin fin), propuso una prueba práctica, hoy conocida como el <strong>Test de Turing</strong>: si una persona conversa por escrito con una máquina y con otra persona, sin saber cuál es cuál, y no logra distinguirlas de forma consistente, la máquina se puede considerar "inteligente" para efectos prácticos.</p>
<p>Turing murió en 1954 sin ver a dónde llegaría su pregunta, pero la disparó.</p>

<h2>Dartmouth, 1956: el nombre "inteligencia artificial"</h2>
<p>En el verano de 1956, un pequeño grupo de investigadores se reunió en el <strong>Dartmouth College</strong> (Estados Unidos) para un taller de dos meses. Entre los organizadores estaba <strong>John McCarthy</strong>, quien acuñó el término <strong>"inteligencia artificial"</strong> en la propuesta de esa reunión. También participaron <strong>Marvin Minsky</strong>, <strong>Claude Shannon</strong> (el padre de la teoría de la información) y <strong>Allen Newell</strong> y <strong>Herbert Simon</strong>, entre otros. La propuesta original decía, con un optimismo que hoy sorprende, que creían poder lograr un avance significativo "durante un verano" si el grupo correcto de científicos trabajaba junto. Ese verano no resolvió la IA — pero le dio nombre y comunidad a un campo nuevo.</p>

<h2>La IA simbólica: enseñar reglas, no ejemplos</h2>
<p>Los primeros programas de IA seguían un enfoque llamado <strong>IA simbólica</strong> (o "IA basada en reglas"): un humano escribía explícitamente las reglas lógicas que la máquina debía seguir. Ejemplos tempranos:</p>
<table>
<tr><th>Programa</th><th>Año</th><th>Qué hacía</th></tr>
<tr><td>Logic Theorist</td><td>1956</td><td>Demostraba teoremas matemáticos usando lógica simbólica (Newell y Simon).</td></tr>
<tr><td>General Problem Solver</td><td>1957</td><td>Intentaba resolver cualquier problema expresable como reglas y metas.</td></tr>
<tr><td>ELIZA</td><td>1966</td><td>Un "psicoterapeuta" de texto que reconocía patrones de palabras — sorprendentemente convincente para algunas personas, aunque no "entendía" nada.</td></tr>
</table>

<div class="tip">
💡 Diferencia clave que vas a usar en todo el curso: la IA simbólica funciona con <strong>reglas escritas a mano</strong>. El aprendizaje automático (que verás más adelante) funciona <strong>aprendiendo patrones de datos</strong>, sin que nadie escriba las reglas directamente. Esa diferencia explica casi toda la historia que sigue.
</div>
`,
      quiz('¿Qué caracteriza a la IA simbólica de los años 50 y 60?',
        ['Aprendía sola de millones de ejemplos', 'Un humano escribía explícitamente las reglas lógicas que el programa debía seguir', 'Usaba redes neuronales profundas', 'No existía todavía en esa época'], 1)),

    text('El primer invierno de la IA (años 70)',
      'Promesas que no se cumplieron, un informe demoledor y el dinero que desapareció.',
      `
<h2>Optimismo que chocó con la realidad</h2>
<p>Durante los años 60, varios pioneros hicieron predicciones muy optimistas: que en pocos años las máquinas igualarían la inteligencia humana. La realidad fue mucho más lenta — los programas simbólicos funcionaban bien en problemas pequeños y controlados, pero se derrumbaban ante la complejidad y la ambigüedad del mundo real (por ejemplo, traducir idiomas con matices, o reconocer una imagen).</p>

<h2>El informe Lighthill (1973)</h2>
<p>En el Reino Unido, el científico James Lighthill publicó un informe encargado por el gobierno que criticaba duramente los avances de la IA, calificando muchos resultados de decepcionantes frente a las promesas hechas. El informe llevó a recortes importantes de financiamiento en universidades británicas. En Estados Unidos, agencias como DARPA también redujeron fondos a proyectos de IA que no mostraban resultados prácticos.</p>

<h2>El problema de fondo: poca potencia, pocos datos</h2>
<p>Con la perspectiva de hoy, el problema no era solo de ideas: las computadoras de los 70 tenían una fracción minúscula de la memoria y velocidad de una computadora actual, y no existían las enormes cantidades de datos digitales que hoy alimentan a los modelos de IA. Muchas ideas de esa época (incluidas versiones tempranas de redes neuronales) eran matemáticamente razonables, pero sencillamente no había con qué ejecutarlas a la escala necesaria.</p>

<div class="example">
<strong>Una lección que se repite:</strong> a lo largo de esta historia, varias ideas "fallidas" en su momento (como las redes neuronales) resultaron ser correctas — solo faltaba la potencia de cómputo y los datos para demostrarlo, décadas después.
</div>

<h2>Resultado: el término "IA" se evita</h2>
<p>Durante buena parte de los años 70, muchos investigadores evitaron usar la palabra "inteligencia artificial" en sus propuestas de financiamiento, prefiriendo términos como "sistemas basados en conocimiento" — la etiqueta se había vuelto tóxica para conseguir fondos. A este periodo de desilusión y recortes se le conoce como el <strong>primer invierno de la IA</strong>.</p>
`,
      quiz('¿Por qué se le llama "invierno de la IA" a los años 70?',
        ['Porque hacía frío en los laboratorios', 'Porque las promesas no se cumplieron, el financiamiento se recortó fuertemente y el interés cayó', 'Porque se inventó el término "inteligencia artificial" ese año', 'Porque las computadoras dejaron de fabricarse'], 1)),

    text('Los sistemas expertos y el segundo invierno (años 80-90)',
      'Un breve resurgimiento comercial, y una segunda caída aún más dura.',
      `
<h2>Los sistemas expertos: IA que sí vendía</h2>
<p>A principios de los 80 llegó un resurgimiento con los <strong>sistemas expertos</strong>: programas que codificaban el conocimiento de especialistas humanos en reglas del tipo "si pasa esto, entonces recomienda aquello", aplicados a dominios concretos (diagnóstico médico, configuración de equipos de cómputo). El más famoso, <strong>XCON</strong> (usado por la empresa Digital Equipment Corporation para configurar computadoras), llegó a ahorrarle a la empresa decenas de millones de dólares al año. Por primera vez, la IA generaba dinero real, y varias empresas se fundaron solo para venderla.</p>

<h2>Japón entra a la carrera</h2>
<p>En 1982, Japón lanzó el ambicioso <strong>Proyecto de la Quinta Generación de Computadoras</strong>, con fuerte inversión estatal para desarrollar computadoras basadas en IA e inferencia lógica. Estados Unidos y Europa respondieron con sus propios programas de inversión, temiendo quedarse atrás — un patrón de "carrera de IA entre países" que, como verás en el curso de <em>Actualidad de la IA</em>, sigue vivo hoy.</p>

<h2>La caída: hardware caro, mantenimiento imposible</h2>
<p>Hacia finales de los 80, los problemas se acumularon: las computadoras especializadas (como las "máquinas LISP", diseñadas específicamente para IA simbólica) eran carísimas y quedaron obsoletas frente a computadoras personales más baratas y versátiles. Los sistemas expertos eran difíciles y costosos de mantener: cada regla nueva había que agregarla a mano, y el sistema se volvía frágil ante situaciones que sus creadores no habían previsto. El mercado de hardware de IA prácticamente colapsó entre 1987 y principios de los 90. A este segundo colapso se le conoce como el <strong>segundo invierno de la IA</strong>.</p>

<div class="warn">
⚠️ El patrón se repitió: entusiasmo → inversión → expectativas infladas → resultados que no alcanzan → recorte de fondos. Vale la pena recordarlo cuando leas titulares muy optimistas sobre IA hoy.
</div>

<h2>Lo que sí quedó</h2>
<p>Aunque el negocio de los sistemas expertos colapsó, el conocimiento no se perdió: universidades y laboratorios pequeños siguieron investigando en silencio, incluyendo un área que en ese momento parecía marginal — las <strong>redes neuronales</strong>. Esa área silenciosa es la que, décadas después, cambiaría todo.</p>
`,
      quiz('¿Qué eran los sistemas expertos de los años 80?',
        ['Redes neuronales profundas', 'Programas con reglas "si-entonces" que codificaban el conocimiento de especialistas humanos en un dominio concreto', 'Chatbots como ChatGPT', 'Computadoras cuánticas'], 1)),

    text('El aprendizaje automático toma el relevo',
      'De escribir reglas a mano a que la máquina las descubra sola, con ejemplos.',
      `
<h2>Un cambio de enfoque radical</h2>
<p>Mientras la IA simbólica se estancaba, un enfoque distinto ganaba terreno poco a poco: el <strong>aprendizaje automático</strong> (<em>machine learning</em>). En vez de que un humano programe las reglas ("si el correo contiene la palabra X, es spam"), se le muestran a un algoritmo miles de ejemplos ya etiquetados (correos marcados como spam o no spam), y el algoritmo <strong>encuentra los patrones por sí mismo</strong>.</p>

<h2>Las redes neuronales: una idea antigua que no moría</h2>
<p>La idea de imitar, de forma muy simplificada, cómo funcionan las neuronas del cerebro viene de los años 40 y 50 (el "perceptrón" de Frank Rosenblatt, 1958). Pero en 1969, Marvin Minsky y Seymour Papert publicaron un libro que demostró matemáticamente las limitaciones severas de los perceptrones simples — un golpe que enfrió la investigación en redes neuronales durante años.</p>
<p>El renacimiento llegó en <strong>1986</strong>, cuando <strong>Geoffrey Hinton</strong> (junto con David Rumelhart y Ronald Williams) popularizó el algoritmo de <strong>retropropagación</strong> (<em>backpropagation</em>): una forma de entrenar redes neuronales con <strong>varias capas</strong>, ajustando automáticamente miles de "perillas" internas (parámetros) para que la red mejore poco a poco en una tarea. Esta es, en esencia, la misma técnica matemática que sigue entrenando a los modelos de IA más avanzados de hoy.</p>

<h2>Otras técnicas que también avanzaron</h2>
<table>
<tr><th>Técnica</th><th>Idea</th></tr>
<tr><td>Árboles de decisión</td><td>Una serie de preguntas tipo "sí/no" que llevan a una predicción.</td></tr>
<tr><td>Máquinas de vectores de soporte (SVM)</td><td>Encuentran la mejor "frontera" matemática para separar categorías de datos.</td></tr>
<tr><td>Redes neuronales</td><td>Capas de unidades simples conectadas que, juntas, aprenden patrones complejos.</td></tr>
</table>

<h2>¿Por qué no explotó de inmediato?</h2>
<p>Las redes neuronales de los 80 y 90 funcionaban, pero seguían limitadas: pocas capas (redes "poco profundas"), poca potencia de cómputo, y pocos datos digitales disponibles para entrenarlas. Faltaban dos ingredientes que llegarían en la década siguiente: <strong>muchísimos más datos</strong> (gracias a internet) y <strong>muchísima más potencia de cómputo</strong> (gracias, sorprendentemente, a las tarjetas gráficas de videojuegos).</p>

<div class="tip">
💡 Guarda este dato: el algoritmo de retropropagación de 1986 sigue siendo, con mejoras, el corazón matemático de cómo se entrenan Claude, GPT, Gemini y prácticamente todos los modelos de IA modernos.
</div>
`,
      quiz('¿Cuál es la diferencia fundamental entre la IA simbólica y el aprendizaje automático?',
        ['No hay diferencia real', 'En la simbólica un humano escribe las reglas; en el aprendizaje automático el algoritmo las descubre a partir de ejemplos', 'El aprendizaje automático es más antiguo', 'La IA simbólica usa redes neuronales'], 1)),

    text('2012: el "big bang" del deep learning',
      'Una competencia de reconocimiento de imágenes que cambió el rumbo de todo el campo.',
      `
<h2>ImageNet: el examen que puso a prueba a la IA</h2>
<p>Desde 2010 existía una competencia anual, <strong>ImageNet Large Scale Visual Recognition Challenge</strong>, donde distintos algoritmos competían por clasificar correctamente 1.2 millones de imágenes en mil categorías. Durante los primeros años, los mejores resultados usaban técnicas tradicionales de visión por computadora, con mejoras lentas y graduales.</p>

<h2>AlexNet, 2012: la sacudida</h2>
<p>En 2012, un equipo de la Universidad de Toronto — Alex Krizhevsky, Ilya Sutskever y Geoffrey Hinton (el mismo de la retropropagación de 1986) — presentó <strong>AlexNet</strong>, una red neuronal <strong>profunda</strong> (con varias capas) entrenada usando <strong>tarjetas gráficas (GPU)</strong> en vez de procesadores tradicionales. El resultado: redujo la tasa de error casi a la mitad respecto al segundo lugar, una diferencia enorme para el estándar de la competencia. Fue la prueba pública de que el deep learning, combinado con suficiente potencia de cómputo y datos, superaba por mucho a los métodos anteriores.</p>

<h2>¿Por qué las GPU? Un giro inesperado</h2>
<p>Las tarjetas gráficas (GPU) se diseñaron originalmente para videojuegos: renderizar millones de píxeles a la vez requiere hacer muchas operaciones matemáticas simples <strong>en paralelo</strong>. Resulta que entrenar una red neuronal necesita exactamente ese tipo de cálculo masivo y paralelo. La industria de los videojuegos, sin proponérselo, había construido durante años el hardware perfecto para el deep learning.</p>

<h2>Los tres ingredientes que por fin coincidieron</h2>
<table>
<tr><th>Ingrediente</th><th>Qué aportó en 2012</th></tr>
<tr><td>Datos</td><td>ImageNet: 1.2 millones de imágenes ya etiquetadas, gracias al auge de internet.</td></tr>
<tr><td>Cómputo</td><td>GPUs, mucho más rápidas que los procesadores tradicionales para este tipo de cálculo.</td></tr>
<tr><td>Algoritmos</td><td>Redes neuronales profundas, con décadas de investigación matemática detrás (Hinton, 1986 y antes).</td></tr>
</table>
<p>Ninguno de los tres era nuevo por sí solo — lo nuevo fue que <strong>por fin coincidieron a la vez</strong>, con suficiente escala.</p>

<div class="example">
<strong>El efecto dominó:</strong> tras AlexNet, prácticamente toda la investigación de visión por computadora migró a redes neuronales profundas en menos de dos años. Empresas como Google, Facebook y Microsoft empezaron a contratar masivamente a investigadores de deep learning, muchos de ellos antes considerados una rama marginal de la academia.
</div>
`,
      quiz('¿Qué tres ingredientes coincidieron en 2012 para hacer posible el "big bang" del deep learning?',
        ['Internet lenta, poca memoria y pocos datos', 'Muchos datos etiquetados (ImageNet), GPUs potentes y redes neuronales profundas', 'Solo una computadora más rápida', 'El invento de la palabra "inteligencia artificial"'], 1)),

    text('El deep learning sale del laboratorio',
      'De clasificar fotos a jugar Go, traducir idiomas y reconocer tu voz.',
      `
<h2>De 2012 a 2017: una década de resultados</h2>
<p>Tras AlexNet, el deep learning se aplicó a un problema tras otro, superando récords que llevaban años estancados:</p>
<table>
<tr><th>Año</th><th>Hito</th></tr>
<tr><td>2014</td><td>Redes neuronales mejoran drásticamente la traducción automática (traducción neuronal), superando a los sistemas estadísticos anteriores.</td></tr>
<tr><td>2015</td><td>Un sistema de Microsoft supera, en una prueba específica, la precisión humana de referencia en clasificación de imágenes de ImageNet.</td></tr>
<tr><td>2016</td><td><strong>AlphaGo</strong>, de la empresa DeepMind (hoy parte de Google), vence al campeón mundial Lee Sedol en Go — un juego considerado, hasta entonces, demasiado complejo e intuitivo para que una computadora lo dominara.</td></tr>
<tr><td>2011-2017</td><td>Los asistentes de voz (Siri 2011, Google Assistant, Alexa 2014) se vuelven mucho más precisos gracias al reconocimiento de voz basado en deep learning.</td></tr>
</table>

<h2>AlphaGo: por qué importó tanto</h2>
<p>El Go tiene más posiciones posibles que átomos hay en el universo observable, así que no se puede "fuerza bruta" como el ajedrez con Deep Blue en 1997. AlphaGo combinó redes neuronales profundas con una técnica de búsqueda (Monte Carlo Tree Search) y aprendizaje por refuerzo (aprender jugando contra sí mismo, millones de partidas). Su victoria en 2016 se consideró un hito comparable al de Deep Blue, pero en un dominio donde la intuición parecía indispensable.</p>

<h2>Las redes neuronales convolucionales (CNN)</h2>
<p>Gran parte de estos avances en imágenes usó un tipo especial de red llamada <strong>red neuronal convolucional</strong> (CNN), diseñada para "mirar" imágenes de forma parecida a como lo hace el sistema visual humano: detectando primero bordes y texturas simples, y combinándolos en capas sucesivas hasta reconocer objetos completos.</p>

<div class="tip">
💡 Nota algo importante: hasta este punto, cada red neuronal se entrenaba para <strong>una tarea específica</strong> (clasificar imágenes, o traducir, o jugar Go) — una red que jugaba Go no sabía traducir idiomas. La siguiente clase trata sobre la idea que rompió esa limitación.
</div>
`,
      quiz('¿Por qué la victoria de AlphaGo en Go (2016) se consideró tan significativa?',
        ['Porque el Go es un juego fácil de resolver por fuerza bruta', 'Porque el Go tiene tantas posiciones posibles que exige algo parecido a la intuición, algo que se creía fuera del alcance de una computadora', 'Porque fue la primera vez que una computadora ganó cualquier juego', 'Porque AlphaGo fue creado en los años 80'], 1)),

    text('2017: el paper que lo cambió todo — los Transformers',
      '"Attention Is All You Need": el artículo detrás de GPT, Claude, Gemini y prácticamente todo LLM moderno.',
      `
<h2>El problema de las redes anteriores con el lenguaje</h2>
<p>Antes de 2017, procesar texto con redes neuronales usaba principalmente <strong>redes recurrentes</strong> (RNN/LSTM): leían el texto palabra por palabra, en orden, arrastrando una "memoria" que se iba degradando en textos largos — como intentar recordar el principio de un párrafo muy largo mientras lees el final. Además, ese procesamiento secuencial era lento: no se podía paralelizar bien en GPUs.</p>

<h2>"Attention Is All You Need" (junio de 2017)</h2>
<p>Un equipo de investigadores de Google (entre ellos Ashish Vaswani, Noam Shazeer y varios coautores) publicó un artículo con ese título, presentando una arquitectura nueva: el <strong>Transformer</strong>. Su idea central era un mecanismo llamado <strong>autoatención</strong> (<em>self-attention</em>): en vez de leer palabra por palabra en orden, el modelo mira <strong>todo el texto a la vez</strong> y aprende a qué palabras debe "prestarle atención" para entender cada palabra en su contexto.</p>

<div class="example">
<strong>Ejemplo simple:</strong> en la frase "El banco estaba cerrado porque era domingo", para saber que "banco" es una institución financiera (y no un asiento) el modelo necesita prestar atención a "cerrado" y "domingo" — que pueden estar lejos en la oración. La autoatención permite conectar esas palabras directamente, sin importar la distancia.
</div>

<h2>Por qué esto fue tan importante</h2>
<table>
<tr><th>Ventaja del Transformer</th><th>Por qué importa</th></tr>
<tr><td>Paraleliza mucho mejor</td><td>Se puede entrenar en GPUs a una escala muchísimo mayor que las RNN.</td></tr>
<tr><td>Maneja mejor el contexto largo</td><td>La autoatención conecta palabras lejanas sin degradarse tanto.</td></tr>
<tr><td>Escala predeciblemente</td><td>Modelos más grandes, con más datos, siguen mejorando de forma bastante predecible — un hallazgo clave para justificar seguir invirtiendo en modelos cada vez más grandes.</td></tr>
</table>

<h2>Lo que vino después, muy rápido</h2>
<ul>
<li><strong>2018:</strong> Google presenta <strong>BERT</strong>, un Transformer que entiende contexto en ambas direcciones, mejorando buscadores y muchas tareas de lenguaje.</li>
<li><strong>2018:</strong> OpenAI presenta <strong>GPT</strong> (Generative Pre-trained Transformer), la primera de una familia que se volvería mucho más conocida después.</li>
<li><strong>2019 en adelante:</strong> Docenas de laboratorios (Google, OpenAI, Meta, y después Anthropic, entre otros) empiezan a construir sus propios Transformers cada vez más grandes.</li>
</ul>

<div class="tip">
💡 El nombre "GPT" en ChatGPT literalmente significa <strong>Generative Pre-trained Transformer</strong> — lleva el nombre de la arquitectura de este artículo de 2017. Prácticamente todo LLM de hoy, incluido Claude, es alguna variación de un Transformer.
</div>
`,
      quiz('¿Cuál fue la innovación central del artículo "Attention Is All You Need" (2017)?',
        ['Inventar el primer chatbot', 'El mecanismo de "autoatención": el modelo mira todo el texto a la vez en vez de leerlo palabra por palabra en orden', 'Crear las primeras GPUs', 'Eliminar la necesidad de entrenar los modelos'], 1)),

    text('2020-2022: de GPT-3 al momento ChatGPT',
      'Cuando los modelos de lenguaje dejaron el laboratorio y llegaron a cientos de millones de personas.',
      `
<h2>GPT-3 (2020): la escala sorprende</h2>
<p>En 2020, OpenAI presentó <strong>GPT-3</strong>, con 175 mil millones de parámetros — órdenes de magnitud más grande que sus predecesores. Lo sorprendente no fue solo su tamaño: GPT-3 mostró habilidades que nadie le había enseñado explícitamente (traducir, resumir, escribir código básico) con solo darle unos pocos ejemplos en el propio texto de entrada, un fenómeno al que se le llamó <em>"aprendizaje de pocos disparos"</em> (few-shot learning). El acceso, al inicio, fue limitado a través de una API de pago, sin una interfaz de chat pública.</p>

<h2>El eslabón que faltaba: enseñarle a seguir instrucciones</h2>
<p>Un modelo entrenado solo para "predecir la siguiente palabra" del internet no necesariamente responde preguntas de forma útil o sigue instrucciones — puede simplemente continuar el texto de formas inesperadas. La técnica que resolvió esto, popularizada hacia 2022, es el <strong>aprendizaje por refuerzo con retroalimentación humana</strong> (RLHF, por sus siglas en inglés): personas califican qué tan buenas son distintas respuestas del modelo, y esas calificaciones se usan para ajustarlo hacia respuestas más útiles, honestas e inofensivas. Este paso — afinar un modelo ya entrenado para que sea un buen asistente — es la diferencia entre "un modelo que predice texto" y "un asistente con el que puedes conversar", y es central en cómo Anthropic entrena a Claude.</p>

<h2>30 de noviembre de 2022: ChatGPT</h2>
<p>OpenAI lanzó <strong>ChatGPT</strong> como una demostración gratuita, con una interfaz de chat simple sobre un modelo afinado para conversar (basado en GPT-3.5). El crecimiento fue el más rápido que se había visto para un producto de consumo hasta ese momento, alcanzando decenas de millones de usuarios en semanas. De pronto, algo que llevaba años siendo tema de investigadores especializados se volvió una conversación de sobremesa en todo el mundo.</p>

<h2>La carrera se acelera</h2>
<table>
<tr><th>Año</th><th>Hito</th></tr>
<tr><td>2021</td><td>Anthropic se funda, con un enfoque explícito en la seguridad de la IA.</td></tr>
<tr><td>2022</td><td>Lanzamiento público de ChatGPT (noviembre).</td></tr>
<tr><td>2023</td><td>GPT-4 (OpenAI), Claude (Anthropic) y Gemini/Bard (Google) compiten abiertamente; explosión de modelos de código abierto como Llama (Meta).</td></tr>
<tr><td>2024-2026</td><td>Modelos multimodales (texto, imagen, audio, video), agentes que usan herramientas, y modelos de "razonamiento" que piensan paso a paso antes de responder.</td></tr>
</table>

<div class="tip">
💡 El curso <em>Actualidad de la IA</em> de esta academia retoma justo aquí, con el panorama más reciente — y como toda "actualidad", conviene revisarlo sabiendo que la IA sigue moviéndose muy rápido.
</div>
`,
      quiz('¿Qué papel jugó el RLHF (aprendizaje por refuerzo con retroalimentación humana) en la creación de asistentes como ChatGPT o Claude?',
        ['Sirvió para hacer los modelos más grandes', 'Ajustó un modelo ya entrenado, usando calificaciones humanas, para que fuera un asistente útil, honesto e inofensivo en vez de solo "predecir texto"', 'Eliminó la necesidad de entrenar con datos', 'Fue la primera técnica de IA de la historia'], 1)),

    text('Cierre: lo que esta historia te enseña sobre el presente',
      'Patrones que se repiten, y por qué la humildad es la actitud correcta frente a la IA.',
      `
<h2>Los patrones que se repiten</h2>
<ul>
<li><strong>El entusiasmo suele adelantarse a la capacidad real.</strong> Pasó en los 60 y en los 80; vale la pena leer las promesas de hoy con ese mismo ojo crítico.</li>
<li><strong>Los avances casi nunca vienen de una sola idea nueva</strong>, sino de que varios ingredientes (datos, cómputo, algoritmos) maduran a la vez — como en 2012 y 2017.</li>
<li><strong>Ideas "fallidas" pueden ser correctas antes de tiempo.</strong> Las redes neuronales fueron desechadas en los 70 y resultaron ser, décadas después, la base de todo.</li>
<li><strong>El acceso público cambia todo.</strong> La tecnología detrás de ChatGPT existía, en formas más limitadas, años antes — lo que cambió el mundo fue ponerla al alcance de cualquiera con una interfaz simple.</li>
</ul>

<h2>Una línea de tiempo para repasar</h2>
<table>
<tr><th>Año</th><th>Hito</th></tr>
<tr><td>1950</td><td>Turing propone su prueba.</td></tr>
<tr><td>1956</td><td>Taller de Dartmouth; nace el término "inteligencia artificial".</td></tr>
<tr><td>1973-1980</td><td>Primer invierno de la IA (informe Lighthill).</td></tr>
<tr><td>1980-1987</td><td>Auge de los sistemas expertos.</td></tr>
<tr><td>1986</td><td>Hinton populariza la retropropagación.</td></tr>
<tr><td>1987-1993</td><td>Segundo invierno de la IA.</td></tr>
<tr><td>2012</td><td>AlexNet: el "big bang" del deep learning.</td></tr>
<tr><td>2016</td><td>AlphaGo vence al campeón mundial de Go.</td></tr>
<tr><td>2017</td><td>"Attention Is All You Need": nacen los Transformers.</td></tr>
<tr><td>2020</td><td>GPT-3 sorprende por su escala.</td></tr>
<tr><td>2021</td><td>Se funda Anthropic.</td></tr>
<tr><td>2022</td><td>ChatGPT se lanza al público (30 de noviembre).</td></tr>
<tr><td>2023 en adelante</td><td>Claude, Gemini, Llama y decenas de modelos compiten y evolucionan rápido.</td></tr>
</table>

<h2>Hacia dónde seguir</h2>
<p>Con esta base histórica, el resto de la Academia de IA te lleva más profundo: cómo usar bien estas herramientas (<em>Trucos y Consejos</em>), cómo elegir entre ellas (<em>Panorama de Modelos de IA</em>), cómo escribirles mejor (<em>Prompt Engineering</em>), y un curso dedicado a fondo a <em>Claude</em>, el asistente detrás de buena parte de este mismo contenido.</p>
`,
      quiz('¿Cuál de estos patrones se repite a lo largo de la historia de la IA que estudiaste?',
        ['La IA siempre avanzó de forma lineal y predecible, sin sorpresas', 'El entusiasmo suele adelantarse a la capacidad real, y los avances grandes suelen venir de varios ingredientes madurando a la vez', 'Nunca hubo periodos de desilusión', 'Todas las ideas exitosas funcionaron desde el primer intento'], 1)),
  ],
}
