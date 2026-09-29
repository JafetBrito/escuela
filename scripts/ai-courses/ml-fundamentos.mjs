// Curso "Aprendizaje Automático: Cómo Piensa una Máquina". Solo texto + quizzes.
// Complementa a Historia de la IA (narrativa) con la mecánica técnica real.
import { quiz, text } from '../linux-courses/helpers.mjs'

export const mlFundamentos = {
  id: 'course-ml-fundamentos',
  title: 'Aprendizaje Automático: Cómo Piensa una Máquina',
  description: 'La mecánica real detrás de la IA, sin fórmulas complicadas: qué significa "entrenar" un modelo, aprendizaje supervisado/no supervisado/por refuerzo, cómo funciona una red neuronal por dentro, por qué un modelo puede "sobreajustarse", y cómo se mide si un modelo es realmente bueno. El complemento técnico de Historia de la Inteligencia Artificial.',
  ai_instructions: 'Eres Ada, profesora de la Academia de IA de Oliver Academy, guiando el curso "Aprendizaje Automático: Cómo Piensa una Máquina". Explica conceptos técnicos con analogías simples y ejemplos numéricos pequeños, sin asumir conocimientos de matemáticas avanzadas ni programación. Cuando uses un término técnico nuevo, defínelo la primera vez que aparece. Sé precisa: es mejor simplificar honestamente que dar una explicación técnicamente incorrecta.',
  icon: '⚙️',
  color: '#818cf8',
  category: 'Inteligencia Artificial',
  subcategory: 'Modelos de IA',
  difficulty: 'intermedio',
  locked: false,
  modules: [
    text('Bienvenida: de la historia a la mecánica',
      'Ya sabes qué pasó y cuándo — ahora vas a entender cómo funciona por dentro.',
      `
<h2>El complemento técnico de la Historia de la IA</h2>
<p>Si tomaste <em>Historia de la Inteligencia Artificial</em>, ya sabes <strong>cuándo</strong> pasó cada avance y <strong>quién</strong> lo hizo. Este curso responde una pregunta distinta: <strong>¿cómo funciona realmente</strong> un modelo de IA por dentro? No hace falta que sepas programar ni matemáticas avanzadas — cada concepto se explica con analogías y ejemplos pequeños, paso a paso.</p>

<h2>El mapa del curso</h2>
<table>
<tr><th>Parte</th><th>Qué vas a entender</th></tr>
<tr><td>1. Qué es "aprender" para una máquina</td><td>Datos, características, modelo, entrenamiento.</td></tr>
<tr><td>2. Los tres estilos de aprendizaje</td><td>Supervisado, no supervisado, por refuerzo.</td></tr>
<tr><td>3. Redes neuronales por dentro</td><td>Neuronas, capas, pesos — con un ejemplo numérico real.</td></tr>
<tr><td>4. Entrenar bien y medir resultados</td><td>Sobreajuste, y cómo se sabe si un modelo es bueno.</td></tr>
<tr><td>5. De redes neuronales a Transformers</td><td>La mecánica de la autoatención, más a fondo que en el curso de historia.</td></tr>
</table>

<div class="tip">
💡 Este curso no te va a enseñar a construir un modelo de IA tú mismo (eso requiere programación y matemáticas que están fuera del alcance de esta academia) — pero al terminar, vas a entender de verdad qué significa cuando alguien dice "entrenamos el modelo con estos datos", en vez de que sea una frase mágica.
</div>
`,
      quiz('¿En qué se diferencia este curso de "Historia de la Inteligencia Artificial"?',
        ['Es exactamente el mismo contenido', 'Este curso explica CÓMO funciona técnicamente el aprendizaje automático por dentro, mientras que Historia explica CUÁNDO y QUIÉN hizo cada avance', 'Este curso enseña a programar desde cero', 'No tienen ninguna relación entre sí'], 1)),

    text('Qué significa "aprender" para una máquina',
      'Datos, características (features), modelo y la diferencia entre entrenar y usar.',
      `
<h2>El ingrediente base: los datos</h2>
<p>Todo aprendizaje automático empieza con <strong>datos</strong>: ejemplos del problema que quieres resolver. Si quieres que un modelo distinga fotos de gatos y perros, necesitas muchas fotos ya etiquetadas como "gato" o "perro". Si quieres predecir el precio de una casa, necesitas datos de casas ya vendidas con su precio real.</p>

<h2>Características (features): qué "ve" el modelo</h2>
<p>Un modelo no ve una casa como tú — la ve como un conjunto de <strong>características</strong> (features): número de habitaciones, metros cuadrados, ubicación, antigüedad. Elegir bien qué características incluir es una de las decisiones más importantes al construir un modelo — características irrelevantes pueden confundirlo, y características importantes que faltan limitan qué tan bien puede predecir.</p>

<table>
<tr><th>Problema</th><th>Ejemplo de características (features)</th></tr>
<tr><td>Predecir el precio de una casa</td><td>Metros cuadrados, habitaciones, ubicación, antigüedad</td></tr>
<tr><td>Detectar correo spam</td><td>Palabras específicas, remitente, cantidad de enlaces</td></tr>
<tr><td>Reconocer una imagen</td><td>Los valores de color de cada píxel (el modelo aprende solo qué combinaciones importan)</td></tr>
</table>

<h2>El modelo: una función que aprende sus propias reglas</h2>
<p>Un <strong>modelo</strong> es, en esencia, una función matemática con muchos números internos ajustables (los <strong>parámetros</strong> que viste en <em>Panorama de Modelos de IA</em>). Al principio, esos números son aleatorios y el modelo predice mal. El <strong>entrenamiento</strong> es el proceso de ir ajustando esos números, poco a poco, usando los datos de ejemplo, hasta que las predicciones del modelo se acercan a las respuestas correctas conocidas.</p>

<h2>Entrenamiento vs. inferencia: dos momentos distintos</h2>
<table>
<tr><th>Fase</th><th>Qué pasa</th><th>Cuándo ocurre</th></tr>
<tr><td><strong>Entrenamiento</strong></td><td>El modelo ajusta sus parámetros usando datos de ejemplo con respuestas conocidas.</td><td>Una vez (o periódicamente), antes de publicar el modelo — consume muchísimo cómputo.</td></tr>
<tr><td><strong>Inferencia</strong></td><td>El modelo ya entrenado recibe una entrada nueva y genera una predicción.</td><td>Cada vez que tú usas el modelo (por ejemplo, cada mensaje que le mandas a un chatbot).</td></tr>
</table>

<div class="example">
<strong>Analogía:</strong> entrenar un modelo es como que un estudiante estudie miles de exámenes resueltos antes del examen real. La inferencia es el examen real: usar lo aprendido en una situación nueva, sin ver la respuesta correcta de antemano.
</div>
`,
      quiz('¿Cuál es la diferencia entre "entrenamiento" e "inferencia"?',
        ['Son exactamente lo mismo', 'El entrenamiento es cuando el modelo ajusta sus parámetros con datos de ejemplo; la inferencia es cuando el modelo ya entrenado genera una predicción para una entrada nueva', 'La inferencia ocurre antes que el entrenamiento', 'El entrenamiento solo ocurre una vez en la historia de toda la IA'], 1)),

    text('Aprendizaje supervisado: aprender con las respuestas correctas a la vista',
      'Clasificación y regresión, los dos tipos de problema más comunes.',
      `
<h2>La idea central</h2>
<p>En el <strong>aprendizaje supervisado</strong>, cada dato de entrenamiento viene con su respuesta correcta ya conocida (una "etiqueta"). El modelo aprende comparando su predicción con la respuesta real, y ajustando sus parámetros para acercarse cada vez más.</p>

<h2>Dos tipos de problemas supervisados</h2>
<table>
<tr><th>Tipo</th><th>Qué predice</th><th>Ejemplo</th></tr>
<tr><td><strong>Clasificación</strong></td><td>Una categoría entre varias opciones</td><td>¿Este correo es spam o no? ¿Esta imagen es un gato, un perro o ninguno de los dos?</td></tr>
<tr><td><strong>Regresión</strong></td><td>Un número continuo</td><td>¿Cuál será el precio de esta casa? ¿Cuántos grados hará mañana?</td></tr>
</table>

<h2>Un ejemplo numérico simple de regresión</h2>
<p>Imagina un modelo que predice el precio de una casa usando solo sus metros cuadrados. Empieza con una regla simple (por ejemplo, "precio = metros × 1,000"), y la compara con casas reales:</p>
<table>
<tr><th>Casa</th><th>Metros²</th><th>Predicción inicial</th><th>Precio real</th><th>Error</th></tr>
<tr><td>A</td><td>80</td><td>$80,000</td><td>$95,000</td><td>$15,000 de menos</td></tr>
<tr><td>B</td><td>120</td><td>$120,000</td><td>$110,000</td><td>$10,000 de más</td></tr>
</table>
<p>El proceso de entrenamiento ajusta la regla (por ejemplo, a "precio = metros × 950 + 5,000") para reducir estos errores en promedio, repitiendo este ajuste miles de veces con miles de casas.</p>

<h2>La "función de pérdida": cómo el modelo mide qué tan mal lo está haciendo</h2>
<p>A la medida numérica de "qué tan lejos está la predicción de la respuesta correcta" se le llama <strong>función de pérdida</strong> (<em>loss function</em>). El objetivo de todo el entrenamiento es, matemáticamente, encontrar los parámetros que hagan esta pérdida lo más pequeña posible — cuanto menor la pérdida, mejores las predicciones en promedio.</p>

<div class="tip">
💡 Cuando entrenas un modelo de lenguaje como Claude o GPT, en el fondo es una tarea de clasificación gigante: predecir cuál es la siguiente palabra (de entre decenas de miles posibles) más probable, dado el texto anterior — la misma idea de este módulo, a una escala mucho mayor.
</div>
`,
      quiz('¿Cuál es la diferencia entre un problema de clasificación y uno de regresión?',
        ['No hay ninguna diferencia', 'La clasificación predice una categoría entre varias opciones; la regresión predice un número continuo', 'La regresión solo se usa para imágenes', 'La clasificación no requiere datos de entrenamiento'], 1)),

    text('Aprendizaje no supervisado: encontrar patrones sin respuestas correctas',
      'Cuando no hay una etiqueta que te diga si el modelo acertó o no.',
      `
<h2>Sin respuestas correctas conocidas</h2>
<p>En el <strong>aprendizaje no supervisado</strong>, los datos <strong>no</strong> vienen con una respuesta correcta ya etiquetada — el objetivo es que el modelo encuentre <strong>patrones o estructura</strong> por sí mismo, sin que nadie le diga de antemano qué buscar.</p>

<h2>Clustering (agrupamiento): encontrar grupos naturales</h2>
<p>El <strong>clustering</strong> agrupa datos parecidos entre sí, sin que nadie defina las categorías de antemano. Por ejemplo, una tienda puede usar clustering sobre el historial de compras de sus clientes para descubrir grupos naturales (compradores frecuentes de bajo monto, compradores ocasionales de alto monto...) sin haber decidido esas categorías de antemano — el algoritmo las descubre a partir de los patrones en los datos.</p>

<div class="example">
<strong>Analogía:</strong> imagina que te dan una caja con cientos de botones de colores y formas distintas, sin ninguna instrucción, y te piden que los organices en grupos que "tengan sentido". Tú decidirías los grupos basándote en similitudes que notas (color, tamaño, forma) — eso es, conceptualmente, lo que hace un algoritmo de clustering con datos.
</div>

<h2>Reducción de dimensionalidad: simplificar sin perder lo esencial</h2>
<p>Cuando cada dato tiene muchísimas características (por ejemplo, cientos de variables sobre cada cliente), puede ser difícil de analizar o visualizar. La <strong>reducción de dimensionalidad</strong> busca resumir esa información en muchas menos variables, conservando la mayor parte del patrón importante — parecido a resumir un libro largo en sus ideas principales, sin perder el sentido central.</p>

<h2>Dónde se usa en la práctica</h2>
<table>
<tr><th>Aplicación</th><th>Técnica</th></tr>
<tr><td>Segmentación de clientes en marketing</td><td>Clustering</td></tr>
<tr><td>Sistemas de recomendación (productos, música)</td><td>Combinación de ambas técnicas</td></tr>
<tr><td>Detección de anomalías (fraude, fallos de equipos)</td><td>Clustering (lo que no encaja en ningún grupo es sospechoso)</td></tr>
<tr><td>Visualizar datos muy complejos en un gráfico simple</td><td>Reducción de dimensionalidad</td></tr>
</table>

<div class="tip">
💡 Una forma simple de distinguirlo del módulo anterior: en el aprendizaje supervisado, tú ya sabes la respuesta correcta y quieres que el modelo aprenda a predecirla. En el no supervisado, ni siquiera tú sabes qué patrones existen — quieres que el modelo te ayude a descubrirlos.
</div>
`,
      quiz('¿Cuál es la diferencia clave entre aprendizaje supervisado y no supervisado?',
        ['El supervisado es más rápido siempre', 'En el supervisado los datos vienen con la respuesta correcta ya conocida; en el no supervisado el modelo busca patrones sin ninguna respuesta correcta predefinida', 'El no supervisado no usa datos', 'No hay ninguna diferencia real'], 1)),

    text('Aprendizaje por refuerzo: aprender por prueba, error y recompensa',
      'Cómo aprendió AlphaGo a jugar mejor que cualquier humano — sin que nadie le enseñara "la jugada correcta".',
      `
<h2>Ni respuestas etiquetadas, ni patrones a descubrir — recompensas</h2>
<p>El <strong>aprendizaje por refuerzo</strong> es un tercer estilo, distinto a los dos anteriores: un <strong>agente</strong> (el sistema que aprende) toma acciones dentro de un entorno, y recibe una <strong>recompensa</strong> (positiva o negativa) según qué tan buena fue esa acción — sin que nadie le diga explícitamente cuál era "la jugada correcta" en cada momento. El agente aprende, por prueba y error repetida muchísimas veces, qué acciones tienden a llevar a mejores recompensas a largo plazo.</p>

<h2>El caso de AlphaGo, revisitado técnicamente</h2>
<p>Como viste en <em>Historia de la Inteligencia Artificial</em>, AlphaGo (2016) venció al campeón mundial de Go. Parte de su entrenamiento usó aprendizaje por refuerzo: el sistema jugó millones de partidas contra versiones de sí mismo, recibiendo una recompensa simple (ganar o perder la partida) al final de cada una. Con el tiempo, fue ajustando su comportamiento para favorecer las jugadas que, en promedio, llevaban a ganar más partidas — sin que ningún humano le hubiera enseñado explícitamente "esta jugada es buena en esta posición".</p>

<h2>Los tres elementos de todo problema de refuerzo</h2>
<table>
<tr><th>Elemento</th><th>Qué es</th><th>Ejemplo en Go</th></tr>
<tr><td>Agente</td><td>Quien toma las decisiones</td><td>El programa que juega</td></tr>
<tr><td>Entorno</td><td>Donde ocurre la acción</td><td>El tablero de Go y las reglas del juego</td></tr>
<tr><td>Recompensa</td><td>La señal de qué tan bien le fue</td><td>Ganar (+1) o perder (-1) la partida</td></tr>
</table>

<h2>El dilema de exploración vs. explotación</h2>
<p>Un reto central del aprendizaje por refuerzo: el agente debe decidir entre <strong>explotar</strong> lo que ya sabe que funciona bien, o <strong>explorar</strong> acciones nuevas que podrían ser incluso mejores (pero que no ha probado lo suficiente). Demasiada explotación puede quedarse atascado en una solución mediocre; demasiada exploración desperdicia tiempo probando cosas que ya sabe que no funcionan bien.</p>

<h2>Dónde más se usa</h2>
<ul>
<li><strong>Robótica:</strong> un robot aprende a caminar o manipular objetos por prueba y error en simulación.</li>
<li><strong>RLHF (que ya conoces):</strong> como viste en <em>Historia de la IA</em>, el ajuste de modelos de lenguaje con retroalimentación humana usa, en parte, principios de aprendizaje por refuerzo — las calificaciones humanas funcionan como la "recompensa".</li>
<li><strong>Optimización de sistemas:</strong> por ejemplo, ajustar automáticamente el uso de energía en centros de datos.</li>
</ul>
`,
      quiz('¿Cuáles son los tres elementos centrales de todo problema de aprendizaje por refuerzo?',
        ['Datos, features y modelo', 'Agente, entorno y recompensa', 'Clasificación, regresión y clustering', 'Entrenamiento, validación y prueba'], 1)),

    text('Redes neuronales por dentro: neuronas, capas y pesos',
      'La pieza técnica central de casi toda la IA moderna, con un ejemplo numérico real.',
      `
<h2>Una "neurona" artificial, en su forma más simple</h2>
<p>Una neurona artificial recibe varios números de entrada, multiplica cada uno por un <strong>peso</strong> (un número que indica qué tan importante es esa entrada), suma todo, y aplica una función simple para decidir su salida. No tiene nada de biológico literal — es solo una operación matemática, inspirada muy libremente en cómo se describía una neurona real.</p>

<h2>Un ejemplo numérico paso a paso</h2>
<p>Imagina una neurona diseñada para decidir "¿debería recomendar esta película?", con dos entradas simples: si le gustan las películas de acción (1 = sí, 0 = no) y si tiene más de 2 horas de duración (1 = sí, 0 = no).</p>
<table>
<tr><th>Entrada</th><th>Valor</th><th>Peso</th><th>Entrada × Peso</th></tr>
<tr><td>¿Le gusta acción?</td><td>1</td><td>0.8</td><td>0.8</td></tr>
<tr><td>¿Dura más de 2h?</td><td>0</td><td>-0.3</td><td>0</td></tr>
</table>
<p>Suma: 0.8 + 0 = 0.8. Si ese resultado pasa un cierto umbral (digamos, mayor a 0.5), la neurona "se activa" y recomienda la película. Los <strong>pesos</strong> (0.8 y -0.3 en este ejemplo) son exactamente los <strong>parámetros</strong> que el entrenamiento va ajustando — aquí decidimos que "le gusta la acción" importa mucho (peso alto) y "dura más de 2 horas" resta un poco (peso negativo).</p>

<h2>Capas: combinar muchas neuronas simples</h2>
<p>Una sola neurona solo puede aprender relaciones muy simples. Una <strong>red neuronal</strong> conecta miles o millones de neuronas en <strong>capas</strong>: la salida de una capa se vuelve la entrada de la siguiente. Las capas intermedias (llamadas <strong>capas ocultas</strong>) permiten que la red aprenda patrones mucho más complejos que una sola neurona jamás podría — cada capa combina y transforma lo que aprendió la capa anterior.</p>

<table>
<tr><th>Capa</th><th>Qué hace</th></tr>
<tr><td>Capa de entrada</td><td>Recibe los datos originales (por ejemplo, los píxeles de una imagen).</td></tr>
<tr><td>Capas ocultas</td><td>Combinan y transforman la información en representaciones cada vez más abstractas.</td></tr>
<tr><td>Capa de salida</td><td>Da el resultado final (por ejemplo, "gato" con 92% de confianza).</td></tr>
</table>

<h2>Retropropagación: cómo se ajustan los pesos, en una frase</h2>
<p>Como viste en <em>Historia de la IA</em>, la <strong>retropropagación</strong> (1986, Hinton y colegas) es el algoritmo que calcula, después de cada error, exactamente cuánto debería cambiar cada peso individual de la red para reducir ese error un poquito — y esto se repite millones de veces con millones de ejemplos, hasta que la red mejora consistentemente.</p>

<div class="tip">
💡 "Deep learning" (aprendizaje profundo) simplemente significa usar redes con <strong>muchas capas ocultas</strong> ("profundas") — cuantas más capas bien entrenadas, más patrones complejos puede llegar a representar la red, como viste con AlexNet en 2012.
</div>
`,
      quiz('¿Qué representan los "pesos" en una red neuronal?',
        ['El tamaño físico del archivo del modelo', 'Números ajustables que indican qué tan importante es cada entrada; el entrenamiento los va ajustando para reducir los errores', 'La cantidad de datos usados para entrenar', 'El nombre de cada neurona individual'], 1)),

    text('Entrenar bien: sobreajuste, subajuste y la división de datos',
      'Por qué un modelo que memoriza perfecto sus ejemplos puede ser, en realidad, un mal modelo.',
      `
<h2>El problema del sobreajuste (overfitting)</h2>
<p>Imagina un estudiante que memoriza las respuestas exactas de un examen de práctica, palabra por palabra, sin entender el concepto de fondo — le va perfecto en ESE examen específico, pero mal en cualquier examen distinto sobre el mismo tema. A esto, en un modelo de IA, se le llama <strong>sobreajuste</strong> (<em>overfitting</em>): el modelo "memoriza" los datos de entrenamiento en vez de aprender el patrón general, y por eso falla con datos nuevos que no ha visto antes.</p>

<h2>El problema opuesto: subajuste (underfitting)</h2>
<p>El <strong>subajuste</strong> (<em>underfitting</em>) es el problema contrario: el modelo es demasiado simple para capturar ni siquiera el patrón básico en los datos de entrenamiento — le va mal tanto con los datos que ya vio como con datos nuevos, porque nunca aprendió lo suficiente.</p>

<table>
<tr><th></th><th>Sobreajuste</th><th>Subajuste</th></tr>
<tr><td>Con datos de entrenamiento (ya vistos)</td><td>Le va muy bien (casi perfecto)</td><td>Le va mal</td></tr>
<tr><td>Con datos nuevos (no vistos)</td><td>Le va mal</td><td>Le va mal</td></tr>
<tr><td>Causa típica</td><td>Modelo demasiado complejo, o muy pocos datos de entrenamiento</td><td>Modelo demasiado simple, o entrenamiento insuficiente</td></tr>
</table>

<h2>La solución: dividir los datos en tres conjuntos</h2>
<p>Para detectar el sobreajuste a tiempo, los datos se dividen antes de entrenar:</p>
<table>
<tr><th>Conjunto</th><th>Para qué se usa</th><th>Analogía</th></tr>
<tr><td>Entrenamiento</td><td>El modelo aprende ajustando sus parámetros con estos datos.</td><td>Ejercicios de práctica que el estudiante SÍ ve resueltos.</td></tr>
<tr><td>Validación</td><td>Se revisa el progreso durante el entrenamiento, sin usarlo para ajustar los parámetros directamente.</td><td>Exámenes de práctica que el estudiante hace para saber cómo va, pero sin memorizar sus respuestas exactas.</td></tr>
<tr><td>Prueba (test)</td><td>La evaluación final, con datos que el modelo NUNCA vio durante el entrenamiento.</td><td>El examen real, con preguntas nunca vistas antes.</td></tr>
</table>
<p>Si un modelo tiene una precisión altísima con los datos de entrenamiento pero mucho más baja con los datos de prueba, esa brecha es la señal clásica de sobreajuste.</p>

<h2>Técnicas comunes para evitar el sobreajuste</h2>
<ul>
<li><strong>Más datos de entrenamiento:</strong> cuantos más ejemplos variados, más difícil que el modelo simplemente los memorice todos.</li>
<li><strong>Regularización:</strong> técnicas matemáticas que penalizan a los modelos por ser innecesariamente complejos.</li>
<li><strong>Detención temprana (early stopping):</strong> dejar de entrenar en el momento justo antes de que el modelo empiece a memorizar en vez de generalizar.</li>
</ul>

<div class="tip">
💡 Este es exactamente el motivo técnico por el que los laboratorios de IA necesitan cantidades gigantescas de datos para entrenar modelos de lenguaje como Claude o GPT: con muy pocos datos, un modelo tan grande memorizaría en vez de aprender patrones generales del lenguaje.
</div>
`,
      quiz('¿Qué es el "sobreajuste" (overfitting) de un modelo?',
        ['Cuando el modelo es demasiado simple para aprender cualquier patrón', 'Cuando el modelo memoriza los datos de entrenamiento en vez de aprender el patrón general, y por eso falla con datos nuevos', 'Cuando el modelo tarda demasiado en entrenarse', 'Cuando el modelo no tiene suficientes parámetros'], 1)),

    text('Cómo se mide si un modelo es realmente bueno',
      'Precisión no es suficiente — las métricas que cuentan la historia completa.',
      `
<h2>Por qué "precisión" sola puede engañar</h2>
<p>Imagina un modelo que detecta una enfermedad rara que afecta a 1 de cada 1,000 personas. Un modelo que simplemente dijera "nadie tiene la enfermedad" en TODOS los casos tendría un 99.9% de <strong>precisión general (accuracy)</strong> — y sería completamente inútil, porque nunca detecta ni un solo caso real. Este ejemplo muestra por qué hace falta ver más allá de una sola cifra.</p>

<h2>La matriz de confusión: las cuatro formas de acertar o fallar</h2>
<table>
<tr><th></th><th>El modelo predijo "sí"</th><th>El modelo predijo "no"</th></tr>
<tr><td><strong>Realmente era "sí"</strong></td><td>Verdadero positivo ✅</td><td>Falso negativo ❌ (lo pasó por alto)</td></tr>
<tr><td><strong>Realmente era "no"</strong></td><td>Falso positivo ❌ (falsa alarma)</td><td>Verdadero negativo ✅</td></tr>
</table>

<h2>Precisión (precision) y exhaustividad (recall)</h2>
<table>
<tr><th>Métrica</th><th>Responde a la pregunta</th><th>Importa más cuando...</th></tr>
<tr><td><strong>Precisión (precision)</strong></td><td>De todo lo que el modelo marcó como positivo, ¿cuánto era realmente correcto?</td><td>Una falsa alarma es costosa (por ejemplo, marcar un correo normal como spam y que se pierda).</td></tr>
<tr><td><strong>Exhaustividad (recall)</strong></td><td>De todos los casos positivos reales, ¿cuántos detectó el modelo?</td><td>Pasar por alto un caso real es costoso (por ejemplo, no detectar una enfermedad real).</td></tr>
</table>
<p>Casi siempre hay una tensión entre ambas: hacer un modelo más "cauteloso" (para no pasar por alto ningún caso positivo) suele generar más falsas alarmas, y viceversa. La métrica <strong>F1</strong> combina ambas en un solo número, útil cuando te importan las dos por igual.</p>

<h2>Aplicado a modelos de lenguaje: la evaluación es más difícil</h2>
<p>Para tareas de clasificación simples (spam sí/no), estas métricas son directas de calcular. Para un modelo de lenguaje como Claude o GPT, evaluar "qué tan buena" es una respuesta es mucho más complicado — no hay una única respuesta correcta para "escribe un poema sobre el otoño". Por eso la evaluación de estos modelos combina pruebas automatizadas (exámenes estandarizados de conocimiento, código que debe pasar pruebas específicas) con evaluación humana (personas calificando qué tan buena es una respuesta, el mismo proceso de RLHF que viste en <em>Historia de la IA</em>).</p>

<div class="warn">
⚠️ Cuando leas que "un modelo obtuvo 95% en tal benchmark (prueba estandarizada)", vale la pena preguntarte: ¿ese benchmark mide algo relevante para mi caso de uso específico? Un modelo puede ser excelente en pruebas académicas y mediocre en tu tarea particular, o viceversa.
</div>
`,
      quiz('¿Por qué la "precisión general" (accuracy) puede ser una métrica engañosa por sí sola?',
        ['Porque nunca se puede calcular', 'Porque en problemas donde una categoría es muy rara, un modelo inútil que siempre predice la categoría común puede tener una precisión general muy alta sin detectar ningún caso real', 'Porque solo aplica a redes neuronales', 'Porque siempre da el mismo resultado sin importar el modelo'], 1)),

    text('De redes neuronales a Transformers: la autoatención, más a fondo',
      'La mecánica técnica detrás del artículo de 2017, con más detalle que en el curso de historia.',
      `
<h2>Recordando el contexto</h2>
<p>En <em>Historia de la Inteligencia Artificial</em> viste que el artículo "Attention Is All You Need" (2017) introdujo el <strong>Transformer</strong>, con su mecanismo central de <strong>autoatención</strong>. Esta clase profundiza en cómo funciona esa mecánica, con las herramientas conceptuales que ya construiste en este curso.</p>

<h2>El problema, revisitado técnicamente</h2>
<p>Una red neuronal recurrente (RNN) procesa el texto palabra por palabra, en secuencia, arrastrando un resumen comprimido de todo lo anterior — ese resumen se va degradando en textos largos, y el procesamiento secuencial no se puede paralelizar bien en GPUs (no puedes calcular la palabra 50 sin haber terminado la palabra 49 primero).</p>

<h2>Autoatención: cada palabra "consulta" a todas las demás</h2>
<p>En vez de un resumen comprimido, la autoatención deja que cada palabra calcule directamente qué tan relevante es <strong>cada una de las demás palabras</strong> del texto para entenderla en su contexto — todo a la vez, no en secuencia. Técnicamente, esto se hace con tres representaciones de cada palabra:</p>
<table>
<tr><th>Representación</th><th>Rol (analogía)</th></tr>
<tr><td><strong>Query (consulta)</strong></td><td>"¿Qué estoy buscando?" — la pregunta que hace esta palabra.</td></tr>
<tr><td><strong>Key (llave)</strong></td><td>"¿Qué tengo para ofrecer?" — lo que cada palabra puede aportar.</td></tr>
<tr><td><strong>Value (valor)</strong></td><td>La información real que se pasa, una vez decidida la relevancia.</td></tr>
</table>
<p>Cada palabra compara su <em>query</em> con la <em>key</em> de todas las demás palabras, calculando qué tan relevante es cada una (una puntuación de atención), y combina sus <em>values</em> ponderados por esa relevancia — así "banco" presta más atención a "cerrado" y "domingo" (el ejemplo que viste en el curso de historia) que a palabras irrelevantes de la oración.</p>

<h2>"Multi-cabeza" (multi-head attention): varias perspectivas a la vez</h2>
<p>Los Transformers no calculan la atención una sola vez, sino varias veces en paralelo (varias "cabezas" de atención), cada una potencialmente enfocándose en un tipo distinto de relación entre palabras (una cabeza podría especializarse en relaciones gramaticales, otra en relaciones de significado) — y al final se combinan todas esas perspectivas.</p>

<h2>Por qué esto se paraleliza tan bien</h2>
<p>A diferencia de una RNN, calcular la atención de todas las palabras entre sí es una operación que las GPUs (diseñadas para cálculos masivos en paralelo, como viste en el "big bang" de 2012) pueden ejecutar de forma extremadamente eficiente — la razón técnica central de por qué los Transformers permitieron entrenar modelos muchísimo más grandes que antes.</p>

<div class="tip">
💡 Con este módulo, cierras el círculo completo: entendiste QUÉ es aprender (módulo 2), los estilos de aprendizaje (módulos 3-5), la mecánica de una red neuronal (módulo 6), cómo entrenarla bien (módulos 7-8), y ahora la arquitectura específica — el Transformer — que hace posible a Claude, GPT y Gemini.
</div>
`,
      quiz('¿Qué representan conceptualmente el "query" y la "key" en el mecanismo de autoatención?',
        ['Dos tipos distintos de GPU', 'El query es "qué está buscando" una palabra, y la key es "qué tiene para ofrecer" otra palabra — se comparan para calcular qué tan relevante es cada palabra para las demás', 'Nombres de dos modelos de IA distintos', 'Un tipo de error de entrenamiento'], 1)),
  ],
}
