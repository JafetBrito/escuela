// Genera supabase/migration_039.sql: inserta el curso "Matemáticas de la
// Antigua Grecia: Axiomas y los Padres de la Geometría" en public.courses.
// Uso: node scripts/build_greek_math_course.mjs
import { writeFileSync } from 'node:fs'
import path from 'node:path'

const COURSE_ID = 'course-matematicas-griegas'

const modules = [
  {
    id: 0,
    order: 0,
    type: 'video',
    title: 'Bienvenida: el amanecer de la razón matemática',
    description: 'Qué cambió cuando los griegos dejaron de calcular y empezaron a demostrar.',
    videoId: 'aqz-KE-bpKQ',
    exercises: [],
    resources: [],
  },
  {
    id: 1,
    order: 1,
    type: 'text',
    title: 'De la receta a la demostración: qué cambió con los griegos',
    description: 'Egipto y Babilonia ya sabían calcular — los griegos inventaron preguntar "¿por qué es cierto?".',
    content: `
<h2>Las matemáticas antes de Grecia: recetas que funcionaban</h2>
<p>Mucho antes de Grecia, egipcios y babilonios ya hacían matemáticas sofisticadas: calculaban áreas de terrenos para cobrar impuestos, predecían eclipses, construían pirámides con una precisión asombrosa. Tenían tablas, fórmulas y procedimientos que funcionaban una y otra vez.</p>
<p>Pero había algo que casi nunca hacían: <strong>explicar por qué funcionaban</strong>. Una tablilla babilónica te decía "para encontrar el área de un círculo, multiplica el radio al cuadrado por tres" — no te decía por qué ese número era el correcto, ni te ofrecía una forma de comprobarlo con lógica pura. Era conocimiento heredado, probado por la práctica, no demostrado con razonamiento.</p>

<div class="example">
Es la diferencia entre una receta de cocina que "siempre sale bien" y un experimento científico que explica exactamente por qué sale bien. Ambos funcionan — pero solo uno te permite predecir qué pasará en un caso que nunca has probado.
</div>

<h2>El giro griego: del "así es" al "así tiene que ser"</h2>
<p>A partir del siglo VI antes de nuestra era, un grupo de pensadores en las colonias griegas de Jonia (la actual costa de Turquía) empezó a hacer una pregunta distinta. No "¿cómo calculo esto?", sino "¿cómo sé, con total certeza, que esto es verdad para CUALQUIER caso, no solo para los que ya probé?".</p>
<p>Esa pregunta dio origen a la <strong>demostración matemática</strong>: una cadena de razonamientos lógicos que parte de cosas que aceptamos como ciertas (o que ya demostramos antes) y llega, paso a paso, a una conclusión que no puede ser de otra manera. No es "lo comprobé con 50 triángulos y siempre funcionó" — es "no existe absolutamente ningún triángulo, en ningún universo posible, donde esto sea falso".</p>

<div class="tip">
💡 Este invento —la demostración— es probablemente el aporte más importante de toda la historia de las matemáticas. No solo cambió las matemáticas: es la base de cómo hoy entendemos qué significa "saber" algo con certeza en cualquier campo formal, desde la lógica hasta la programación.
</div>

<h2>Lo que vas a recorrer en este curso</h2>
<p>En las próximas clases vas a conocer a cuatro figuras que, cada una a su manera, construyeron ese nuevo tipo de conocimiento:</p>
<ul>
<li><strong>Tales de Mileto</strong>, a quien se le atribuye la primera demostración matemática de la que tenemos noticia.</li>
<li><strong>Pitágoras y los pitagóricos</strong>, que llevaron los números al centro de su visión del universo — y se toparon con una crisis que casi los hace pedazos.</li>
<li><strong>Euclides</strong>, que en "Los Elementos" organizó siglos de conocimiento griego en un solo sistema, partiendo de un puñado de <strong>axiomas</strong>: verdades que se aceptan sin demostrar, porque son el punto de partida necesario para poder demostrar todo lo demás.</li>
<li><strong>Arquímedes</strong>, quien empujó esas herramientas hasta calcular el área bajo curvas y aproximar π con una precisión que no se superó en más de mil años.</li>
</ul>
<p>No es solo historia — es entender de dónde viene la forma misma en que hoy pensamos, demostramos y confiamos en que algo es verdad.</p>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Cuál fue el cambio central que introdujeron los griegos en las matemáticas?',
      options: [
        'Inventaron los números',
        'Empezaron a demostrar POR QUÉ algo es cierto, en vez de solo aplicar fórmulas que funcionaban en la práctica',
        'Fueron los primeros en usar matemáticas para cobrar impuestos',
        'Reemplazaron por completo el conocimiento egipcio y babilónico',
      ],
      correctIndex: 1,
    },
  },

  // ── Tales ────────────────────────────────────────────────────────────────
  {
    id: 2,
    order: 2,
    type: 'video',
    title: 'Tales de Mileto y la Primera Demostración',
    description: 'El comerciante que midió una pirámide con su sombra, y que inauguró el razonamiento deductivo.',
    videoId: 'aqz-KE-bpKQ',
    exercises: [],
    resources: [],
  },
  {
    id: 3,
    order: 3,
    type: 'text',
    title: 'Los teoremas de Tales',
    description: 'De medir sombras a demostrar verdades generales sobre cualquier triángulo o círculo.',
    content: `
<h2>¿Quién fue Tales?</h2>
<p>Tales de Mileto (circa 624–546 a.C.) fue comerciante, astrónomo, ingeniero y, según la tradición griega, el primero de los "Siete Sabios" de Grecia. Vivió en Mileto, una próspera ciudad griega en la costa de Jonia, con contacto comercial directo con Egipto y Babilonia — de ahí heredó buena parte de su conocimiento técnico, que transformó en algo nuevo.</p>

<h2>La leyenda de la pirámide</h2>
<p>La anécdota más famosa de Tales: los sacerdotes egipcios, orgullosos de sus pirámides, retaron a Tales a calcular la altura de la Gran Pirámide sin subirse a ella. Tales esperó al momento del día en que la longitud de su propia sombra era exactamente igual a su altura — y en ese instante, midió la sombra de la pirámide. Esa sombra medía exactamente lo mismo que la altura real de la pirámide.</p>

<div class="example">
La idea detrás del truco: en ese momento del día, el Sol forma el mismo ángulo con el suelo para todo lo que hay alrededor. Si tu sombra mide lo mismo que tu altura, es porque los rayos de luz forman un ángulo de 45°, y ese mismo ángulo aplica para la pirámide, para ti, y para cualquier otro objeto vertical en ese instante.
</div>

<p>Lo importante no es el truco en sí (los egipcios probablemente ya sabían usar sombras para medir). Lo importante es que Tales, según la tradición, no se quedó con "funcionó esta vez" — buscó la <strong>razón general</strong> detrás del método: la proporcionalidad entre triángulos semejantes.</p>

<h2>Los teoremas que llevan su nombre</h2>
<p>Se le atribuyen a Tales varios resultados geométricos, entre ellos:</p>
<ul>
<li><strong>Un círculo queda dividido en dos partes iguales por cualquiera de sus diámetros.</strong></li>
<li><strong>Los ángulos en la base de un triángulo isósceles (dos lados iguales) son iguales entre sí.</strong></li>
<li><strong>El ángulo inscrito en un semicírculo siempre es un ángulo recto</strong> (90°) — sin importar dónde, sobre el semicírculo, coloques el tercer punto del triángulo. Este resultado hoy se conoce como el <em>Teorema de Tales</em> en muchos países.</li>
<li><strong>El teorema de la proporcionalidad</strong> (a veces llamado "teorema de Tales" en otros contextos): si dos rectas se cortan por varias rectas paralelas, los segmentos que se forman son proporcionales. Es exactamente la idea que usó con la sombra de la pirámide.</li>
</ul>

<div class="tip">
💡 Ninguno de estos resultados era "nuevo" como observación — probablemente ya eran conocidos empíricamente. Lo revolucionario es que Tales (o la tradición que le atribuye esto) los presentó como verdades que se podían justificar con lógica, no solo con la experiencia repetida.
</div>

<h2>Por qué importa que haya sido "el primero"</h2>
<p>Los historiadores debaten cuánto de esto es literalmente cierto y cuánto es leyenda construida después por generaciones posteriores de griegos, que necesitaban un "padre fundador". Pero incluso como leyenda, cumple una función real: marca simbólicamente el momento en que las matemáticas griegas empezaron a distinguirse de todo lo anterior — el momento en que alguien dijo "no basta con que funcione, quiero saber por qué tiene que ser así".</p>
`,
    exercises: [
      {
        id: 'tales-sombra',
        type: 'challenge',
        prompt: 'Imagina que quieres medir la altura de un árbol sin subirte a él, usando el método de Tales. Describe paso a paso qué medirías y cómo calcularías la altura del árbol a partir de tu propia sombra.',
        solution: '',
      },
    ],
    resources: [],
    quiz: {
      question: 'Según el Teorema de Tales sobre el semicírculo, ¿qué es siempre cierto de un triángulo inscrito en un semicírculo (con un lado como diámetro)?',
      options: [
        'Siempre es equilátero',
        'El ángulo opuesto al diámetro siempre es un ángulo recto (90°)',
        'Nunca puede formarse un triángulo así',
        'Siempre tiene un área fija, sin importar el tamaño del círculo',
      ],
      correctIndex: 1,
    },
  },

  // ── Pitágoras ────────────────────────────────────────────────────────────
  {
    id: 4,
    order: 4,
    type: 'video',
    title: 'Pitágoras y los Pitagóricos',
    description: 'La secta que creía que el universo entero estaba hecho de números — hasta que un número los traicionó.',
    videoId: 'aqz-KE-bpKQ',
    exercises: [],
    resources: [],
  },
  {
    id: 5,
    order: 5,
    type: 'text',
    title: 'El teorema de Pitágoras y la crisis de los irracionales',
    description: 'Cómo una demostración perfecta llevó a un descubrimiento que los pitagóricos hubieran preferido no hacer.',
    content: `
<h2>Una hermandad, no solo una escuela</h2>
<p>Pitágoras (circa 570–495 a.C.) fundó en el sur de Italia una comunidad que era, a la vez, escuela filosófica, secta religiosa y sociedad secreta. Los pitagóricos creían que la realidad entera —música, astronomía, geometría, el alma— podía explicarse a través de los <strong>números</strong> y las proporciones entre ellos. "Todo es número" no era una metáfora para ellos: era literalmente su cosmovisión.</p>

<div class="example">
Descubrieron, por ejemplo, que las notas musicales que suenan armoniosas juntas corresponden a proporciones simples entre las longitudes de una cuerda vibrante (2:1 para la octava, 3:2 para la quinta). Para ellos, esto confirmaba que el universo entero estaba afinado matemáticamente.
</div>

<h2>El teorema que lleva su nombre</h2>
<p>El resultado más famoso asociado a esta escuela dice: en cualquier triángulo rectángulo (un triángulo con un ángulo de 90°), el cuadrado de la hipotenusa (el lado más largo, opuesto al ángulo recto) es igual a la suma de los cuadrados de los otros dos lados.</p>
<div class="example" style="font-family: monospace; font-size: 1.1em;">
a² + b² = c²
</div>
<p>Este resultado probablemente ya se conocía de forma práctica en Babilonia y Egipto (hay tablillas babilónicas con ternas de números que cumplen esta relación, siglos antes de Pitágoras). Lo que la tradición atribuye a la escuela pitagórica es una <strong>demostración general</strong>: una prueba de que esto es cierto para absolutamente cualquier triángulo rectángulo, no solo para los casos ya probados.</p>

<h2>La crisis: cuando la propia herramienta se vuelve en tu contra</h2>
<p>Aquí viene la parte más dramática de esta historia. Toma un triángulo rectángulo cuyos dos catetos midan exactamente 1. Según el propio teorema pitagórico, la hipotenusa mide <code>√2</code> (raíz de dos).</p>
<p>Un pitagórico —la tradición dice que fue Hipaso de Metaponto— demostró algo perturbador: <strong>√2 no se puede expresar como una fracción de dos números enteros</strong>. No importa qué tan grandes o pequeños sean los números que intentes, nunca vas a encontrar una fracción exacta que sea igual a √2. Hoy llamamos a estos números <strong>irracionales</strong>.</p>

<div class="warn">
⚠️ Para los pitagóricos, esto era una catástrofe filosófica, no solo matemática. Si "todo es número" significaba que todo se podía expresar como proporciones entre números enteros, y aquí había una longitud perfectamente real (la diagonal de un simple cuadrado) que NINGUNA proporción entre enteros podía capturar exactamente, entonces su visión completa del universo tenía una grieta.
</div>

<p>Según la leyenda (probablemente exagerada con los siglos), la hermandad intentó mantener este descubrimiento en secreto, y algunas versiones cuentan que Hipaso murió ahogado por revelarlo — un castigo divino, según se decía, por profanar algo que debía permanecer oculto. Sea o no literalmente cierta la leyenda, refleja lo perturbador que fue este hallazgo para quienes lo hicieron.</p>

<div class="tip">
💡 Esta es una de las primeras veces en la historia en que una demostración matemática rigurosa obliga a aceptar una conclusión incómoda, incluso en contra de lo que uno preferiría creer. Es un patrón que se va a repetir una y otra vez en la historia de las matemáticas — y de la ciencia en general.
</div>
`,
    exercises: [
      {
        id: 'pitagoras-verificar',
        type: 'challenge',
        prompt: 'Usa el teorema de Pitágoras para comprobar si un triángulo con lados 5, 12 y 13 es un triángulo rectángulo. Muestra tu cálculo y explica cómo lo supiste.',
        solution: '',
      },
    ],
    resources: [],
    quiz: {
      question: '¿Por qué el descubrimiento de que √2 es irracional fue una crisis para los pitagóricos?',
      options: [
        'Porque no sabían calcular raíces cuadradas',
        'Porque contradecía su creencia de que todo en el universo podía expresarse como proporciones entre números enteros',
        'Porque significaba que el teorema de Pitágoras estaba mal',
        'Porque los números irracionales no existen de verdad',
      ],
      correctIndex: 1,
    },
  },

  // ── Axiomas + Euclides ───────────────────────────────────────────────────
  {
    id: 6,
    order: 6,
    type: 'text',
    title: '¿Qué es un axioma?',
    description: 'Por qué toda demostración necesita, al final, un punto de partida que no se demuestra.',
    content: `
<h2>El problema de tener que demostrarlo todo</h2>
<p>Imagina que quieres demostrar la afirmación A. Para eso, usas la afirmación B, que ya demostraste antes. Pero para demostrar B, necesitaste C. ¿Y C? Necesitó D. Si este proceso nunca se detiene, tienes un problema real: una cadena infinita de demostraciones que nunca llega a un punto sólido desde donde empezar.</p>
<p>Los griegos —y Euclides en particular, como vas a ver en la próxima clase— resolvieron esto de una forma elegante: aceptar, desde el inicio, un pequeño conjunto de afirmaciones que <strong>no se demuestran</strong>, porque se consideran evidentes por sí mismas o porque son necesarias como punto de partida. A esas afirmaciones las llamamos <strong>axiomas</strong> (o postulados).</p>

<div class="example">
Es como las reglas de un juego de mesa: no tiene sentido preguntar "¿por qué el alfil se mueve en diagonal?" dentro del juego de ajedrez — esa regla simplemente ES el punto de partida que hace posible jugar. Los axiomas son las "reglas del juego" de un sistema matemático.
</div>

<h2>Axioma vs. teorema: la diferencia clave</h2>
<table>
<tr><th>Axioma (o postulado)</th><th>Teorema</th></tr>
<tr><td>Se acepta sin demostración</td><td>Se demuestra a partir de axiomas (y de otros teoremas ya demostrados)</td></tr>
<tr><td>Es el punto de partida del sistema</td><td>Es una consecuencia lógica del sistema</td></tr>
<tr><td>Hay muy pocos (unos cuantos, elegidos con cuidado)</td><td>Puede haber infinitos, derivados de los mismos axiomas</td></tr>
</table>

<h2>¿Un axioma es simplemente "verdadero"?</h2>
<p>Esta es la parte más sutil, y la que más ha evolucionado desde la época griega. Para los griegos, un axioma era una verdad evidente por sí misma sobre el mundo real — algo tan obvio que negarlo sería absurdo (por ejemplo: "el todo es mayor que cualquiera de sus partes").</p>
<p>Las matemáticas modernas ven los axiomas de forma distinta: no como "verdades del universo", sino como <strong>reglas que elegimos</strong> para definir un sistema. Cambia los axiomas, y obtienes un sistema matemático diferente (pero igualmente válido) — esto es exactamente lo que pasó siglos después con las geometrías no-euclidianas, cuando matemáticos cambiaron uno solo de los axiomas de Euclides y descubrieron geometrías completamente distintas, igual de consistentes.</p>

<div class="tip">
💡 No necesitas resolver aquí el debate filosófico sobre si los axiomas son "verdades" o "reglas elegidas" — lo importante para este curso es entender la estructura: unos pocos puntos de partida indemostrables, y todo lo demás construido rigurosamente encima de ellos.
</div>

<h2>Por qué esto no es solo un tecnicismo antiguo</h2>
<p>Este mismo patrón —unos axiomas mínimos, y todo lo demás derivado con reglas estrictas— es exactamente cómo funciona la lógica formal moderna, buena parte de las matemáticas actuales, y hasta cómo funciona un lenguaje de programación: un conjunto pequeño de reglas base (la sintaxis, las operaciones primitivas) a partir de las cuales se construye absolutamente todo lo demás.</p>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Cuál es la diferencia principal entre un axioma y un teorema?',
      options: [
        'No hay ninguna diferencia real',
        'Un axioma se acepta sin demostración, como punto de partida; un teorema se demuestra a partir de axiomas',
        'Un teorema siempre es más importante que un axioma',
        'Los axiomas solo existen en geometría',
      ],
      correctIndex: 1,
    },
  },
  {
    id: 7,
    order: 7,
    type: 'video',
    title: 'Los Elementos de Euclides y los 5 Postulados',
    description: 'El libro que organizó siglos de matemáticas griegas en un solo sistema — y que se siguió usando como libro de texto durante más de 2000 años.',
    videoId: 'aqz-KE-bpKQ',
    exercises: [],
    resources: [],
  },
  {
    id: 8,
    order: 8,
    type: 'text',
    title: 'Los 5 postulados de Euclides, uno por uno',
    description: 'El punto de partida completo desde el que se construye toda la geometría de "Los Elementos".',
    content: `
<h2>"Los Elementos": el libro más influyente de la historia de las matemáticas</h2>
<p>Euclides de Alejandría (activo circa 300 a.C.) no fue, casi con certeza, el descubridor original de la mayoría de los resultados que aparecen en su obra "Los Elementos" — muchos ya eran conocidos por matemáticos griegos anteriores, incluyendo a Tales y a los pitagóricos. Su logro fue distinto y quizás más importante: <strong>organizar todo ese conocimiento disperso en un solo sistema lógico</strong>, empezando desde definiciones y axiomas mínimos, y construyendo cientos de resultados (teoremas) rigurosamente encima de ellos.</p>
<p>"Los Elementos" se usó como libro de texto de geometría, casi sin cambios, durante más de <strong>2000 años</strong> — probablemente el libro de texto científico de mayor vigencia en toda la historia humana.</p>

<h2>Los 5 postulados</h2>
<p>Euclides comienza con definiciones (qué es un punto, una línea, un ángulo...), nociones comunes (ideas lógicas generales, como "cosas iguales a una misma cosa son iguales entre sí") y, lo más importante, <strong>cinco postulados</strong> específicos de la geometría:</p>

<div class="example">
<strong>1.</strong> Se puede trazar una línea recta entre dos puntos cualesquiera.<br/><br/>
<strong>2.</strong> Una línea recta se puede extender indefinidamente en cualquier dirección.<br/><br/>
<strong>3.</strong> Se puede trazar un círculo con cualquier centro y cualquier radio.<br/><br/>
<strong>4.</strong> Todos los ángulos rectos son iguales entre sí.<br/><br/>
<strong>5.</strong> (El "postulado de las paralelas"): si una línea cruza otras dos líneas y forma ángulos internos, del mismo lado, que suman menos de dos ángulos rectos, entonces esas dos líneas, si se extienden lo suficiente, se cruzarán del lado donde esa suma es menor.
</div>

<p>Los primeros cuatro son cortos, casi obvios de leer. El quinto es notablemente más largo y complicado — y esa diferencia no pasó desapercibida.</p>

<h2>El postulado incómodo</h2>
<p>Durante más de 2000 años, generaciones de matemáticos sospecharon que el quinto postulado no era un verdadero axioma —algo evidente por sí mismo— sino un <strong>teorema</strong> que debería poder demostrarse a partir de los otros cuatro. Muchos lo intentaron. Todos fracasaron, aunque algunos de esos intentos fallidos produjeron descubrimientos interesantes por su cuenta.</p>

<div class="tip">
💡 El quinto postulado tiene una versión equivalente, más fácil de recordar, formulada siglos después por el matemático escocés John Playfair: "por un punto fuera de una línea, se puede trazar exactamente una única línea paralela a esa línea". Suena obvio — pero nadie logró demostrarlo a partir de los otros cuatro postulados.
</div>

<p>El misterio no se resolvió hasta el siglo XIX, cuando matemáticos como Gauss, Lobachevsky y Bolyai se hicieron una pregunta distinta: ¿qué pasa si, en lugar de intentar demostrar el quinto postulado, simplemente lo <strong>cambiamos</strong>? El resultado fueron las geometrías no-euclidianas — sistemas completamente consistentes, tan válidos matemáticamente como el de Euclides, donde por un punto fuera de una línea pasan CERO o INFINITAS paralelas, no exactamente una. Ese es un capítulo que se sale del alcance de este curso — pero vale la pena saber que el "postulado incómodo" de Euclides terminó abriendo, dos milenios después, una puerta que nadie esperaba.</p>

<h2>De los postulados a cientos de teoremas</h2>
<p>A partir de solo estas pocas afirmaciones (más las definiciones y nociones comunes), Euclides demuestra, paso a paso, resultados como: la suma de los ángulos internos de un triángulo es 180°, cómo construir un cuadrado con la misma área que un rectángulo dado, o el propio teorema de Pitágoras — esta vez con una demostración geométrica completa y rigurosa, encajada dentro del sistema entero.</p>
`,
    exercises: [
      {
        id: 'euclides-postulados',
        type: 'challenge',
        prompt: 'Elige uno de los 5 postulados de Euclides y explica, con tus propias palabras, por qué te parece "evidente por sí mismo" (o, si no te lo parece, explica qué es lo que te genera duda).',
        solution: '',
      },
    ],
    resources: [
      { label: 'Los Elementos de Euclides (texto completo, dominio público)', url: 'https://www.gutenberg.org/ebooks/21076', type: 'link' },
    ],
    quiz: {
      question: '¿Por qué el quinto postulado de Euclides (el de las paralelas) fue especialmente controvertido durante más de 2000 años?',
      options: [
        'Porque estaba escrito en un idioma distinto a los otros cuatro',
        'Porque muchos matemáticos sospechaban que era en realidad un teorema demostrable, no un verdadero axioma, y nadie logró demostrarlo',
        'Porque contradecía directamente al teorema de Pitágoras',
        'Porque Euclides mismo dijo que era falso',
      ],
      correctIndex: 1,
    },
  },

  // ── Arquímedes ───────────────────────────────────────────────────────────
  {
    id: 9,
    order: 9,
    type: 'video',
    title: 'Arquímedes: π, el Infinito y la Palanca',
    description: 'El genio de Siracusa que se acercó al cálculo infinitesimal casi 2000 años antes de que existiera formalmente.',
    videoId: 'aqz-KE-bpKQ',
    exercises: [],
    resources: [],
  },
  {
    id: 10,
    order: 10,
    type: 'text',
    title: 'El método de exhaución y los inventos de Arquímedes',
    description: 'Cómo aproximar lo infinito con pasos finitos, siglos antes del cálculo integral.',
    content: `
<h2>El personaje</h2>
<p>Arquímedes de Siracusa (circa 287–212 a.C.) es, para muchos historiadores, el matemático más brillante de toda la Antigüedad — y uno de los más grandes de cualquier época. Combinó, como pocos en la historia, las matemáticas puras con la ingeniería aplicada: diseñó máquinas de guerra que ayudaron a defender Siracusa de Roma durante años, e hizo descubrimientos matemáticos que se adelantaron por siglos a su tiempo.</p>

<h2>"¡Eureka!": la corona y el principio de flotación</h2>
<p>La anécdota más famosa: el rey Hierón II le pidió a Arquímedes averiguar si su corona era de oro puro, sin dañarla. Según la leyenda, la solución se le ocurrió al meterse a una tina de baño y notar que el nivel del agua subía en proporción al volumen de su cuerpo sumergido — corrió desnudo por las calles gritando "¡Eureka!" ("¡lo encontré!"). Había descubierto que podía medir el volumen exacto de un objeto de forma irregular (como una corona) sumergiéndolo en agua, y comparar su densidad con la del oro puro.</p>

<h2>El método de exhaución: acorralando el infinito</h2>
<p>El aporte matemático más profundo de Arquímedes es el <strong>método de exhaución</strong>, una técnica para calcular áreas y volúmenes de figuras curvas —donde la geometría de líneas rectas de Euclides no alcanza— aproximándolas con figuras rectas cada vez más precisas.</p>

<div class="example">
Para calcular el área de un círculo, Arquímedes inscribió y circunscribió polígonos regulares (con lados rectos, que sí sabía medir con exactitud) cada vez con más lados: un hexágono, luego un polígono de 12 lados, luego 24, 48, hasta 96 lados. Cada vez, el polígono se acerca más y más a la forma del círculo, "exhauriendo" (agotando) la diferencia entre ambas figuras. Con esta técnica, calculó que π está entre 3.1408 y 3.1429 — una aproximación extraordinaria para su época, hecha completamente a mano.
</div>

<p>Esta idea —acercarse a un valor exacto mediante una secuencia de pasos que se aproximan cada vez más, sin necesariamente "llegar" nunca del todo en un número finito de pasos— es, en esencia, la misma idea detrás del <strong>concepto de límite</strong>, que casi 2000 años después se convertiría en la base formal del cálculo diferencial e integral, desarrollado por Newton y Leibniz en el siglo XVII.</p>

<div class="tip">
💡 Por esto muchos historiadores consideran a Arquímedes un precursor directo del cálculo infinitesimal — sin tener el lenguaje algebraico ni la notación que sí tuvieron Newton y Leibniz siglos después, logró resultados que dependen exactamente del mismo tipo de razonamiento sobre "acercarse al infinito".
</div>

<h2>La palanca y la ingeniería</h2>
<p>Arquímedes también formalizó matemáticamente la <strong>ley de la palanca</strong>: el equilibrio entre dos pesos depende del producto del peso por su distancia al punto de apoyo, no solo del peso en sí. Se le atribuye la frase (probablemente apócrifa, pero que capta bien su confianza en el poder de las matemáticas aplicadas): "Dame un punto de apoyo y moveré el mundo".</p>
<p>Aplicó estos principios a inventos reales: el tornillo de Arquímedes (todavía usado hoy para elevar agua), y máquinas de guerra —incluyendo grúas gigantes que, según los relatos, podían levantar barcos enemigos enteros— que ayudaron a Siracusa a resistir el asedio romano durante más de dos años.</p>

<h2>Su muerte</h2>
<p>Cuando Siracusa finalmente cayó ante Roma en 212 a.C., un soldado romano encontró a Arquímedes, según la tradición, absorto dibujando figuras geométricas en la arena. Se dice que sus últimas palabras fueron "no molestes mis círculos" — el soldado, sin reconocerlo, lo mató a pesar de que el general romano Marcelo había ordenado explícitamente respetar su vida.</p>
`,
    exercises: [
      {
        id: 'arquimedes-exhaucion',
        type: 'challenge',
        prompt: 'Explica con tus propias palabras la idea central del método de exhaución de Arquímedes: ¿por qué usar polígonos de MÁS lados da una mejor aproximación del área de un círculo? ¿Qué pasaría, en teoría, si pudieras usar un polígono con infinitos lados?',
        solution: '',
      },
    ],
    resources: [],
    quiz: {
      question: '¿Qué idea moderna anticipa el "método de exhaución" de Arquímedes?',
      options: [
        'El álgebra moderna',
        'El concepto de límite, base del cálculo diferencial e integral',
        'La estadística',
        'Los números negativos',
      ],
      correctIndex: 1,
    },
  },

  // ── Cierre ───────────────────────────────────────────────────────────────
  {
    id: 11,
    order: 11,
    type: 'text',
    title: 'Por qué el método axiomático sigue vivo hoy',
    description: 'De Euclides a la lógica moderna, las matemáticas actuales y la programación.',
    content: `
<h2>Un método que sobrevivió a sus propios contenidos</h2>
<p>Hoy sabemos que algunas de las afirmaciones específicas de la geometría de Euclides no son la única geometría posible (las geometrías no-euclidianas lo demuestran). Pero el <strong>método</strong> —partir de axiomas mínimos y explícitos, y construir todo lo demás con pasos lógicos rigurosos, sin atajos ni excepciones— resultó ser mucho más duradero que cualquier resultado particular.</p>

<h2>Dónde vive hoy el método axiomático</h2>
<ul>
<li><strong>Las matemáticas modernas:</strong> prácticamente cualquier rama seria de las matemáticas de hoy —desde la teoría de conjuntos hasta el álgebra abstracta— se construye formalmente a partir de axiomas explícitos, exactamente con el mismo espíritu que Euclides.</li>
<li><strong>La lógica formal:</strong> el estudio de qué argumentos son válidos y cuáles no, independientemente de su contenido, hereda directamente esta tradición.</li>
<li><strong>La programación:</strong> cuando escribes código, partes de un conjunto pequeño de "reglas base" del lenguaje (su sintaxis, sus operaciones primitivas) y construyes programas complejos combinándolas con reglas estrictas — la misma estructura, siglos después, aplicada a máquinas.</li>
<li><strong>El derecho y la filosofía:</strong> cualquier sistema que parte de principios explícitos (una constitución, un conjunto de axiomas éticos) para derivar conclusiones específicas, está usando —consciente o inconscientemente— la misma estructura que "Los Elementos" popularizó hace más de 2000 años.</li>
</ul>

<div class="tip">
💡 La próxima vez que veas un argumento bien construido — en matemáticas, en código, o en una discusión cualquiera — fíjate si tiene esta estructura: puntos de partida claros y aceptados, y pasos lógicos explícitos que llevan de ahí a la conclusión. Esa estructura tiene nombre y apellido: se llama método axiomático, y nació, tal como lo conocemos, en la Antigua Grecia.
</div>

<h2>Lo que te llevas de este curso</h2>
<ul>
<li>✅ Entiendes la diferencia entre "funciona en la práctica" y "está demostrado con lógica" — y por qué los griegos hicieron ese salto.</li>
<li>✅ Sabes qué es un axioma, y por qué toda demostración necesita, al final, un punto de partida indemostrable.</li>
<li>✅ Conoces los 5 postulados de Euclides y por qué el quinto fue especialmente polémico durante dos milenios.</li>
<li>✅ Entiendes la crisis de los números irracionales, y cómo una demostración rigurosa puede llevar a una conclusión incómoda que de todas formas hay que aceptar.</li>
<li>✅ Conoces el método de exhaución de Arquímedes, precursor directo del concepto de límite.</li>
</ul>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Qué es lo que realmente perduró del sistema de Euclides, incluso después de que se descubrieran las geometrías no-euclidianas?',
      options: [
        'Nada — todo el sistema quedó obsoleto',
        'El método: partir de axiomas explícitos y construir todo lo demás con pasos lógicos rigurosos',
        'Solo el quinto postulado',
        'Únicamente sus diagramas',
      ],
      correctIndex: 1,
    },
  },
]

const course = {
  id: COURSE_ID,
  title: 'Matemáticas de la Antigua Grecia: Axiomas y los Padres de la Geometría',
  description: 'De la primera demostración de Tales al método de exhaución de Arquímedes: cómo los griegos inventaron la demostración matemática, qué es un axioma, y por qué "Los Elementos" de Euclides se enseñó sin cambios durante más de 2000 años. Con videos narrados a fondo por tema.',
  ai_instructions: 'Eres el Mago Ancestral, profesor de la Escuela de Matemáticas de Oliver Academy, guiando el curso "Matemáticas de la Antigua Grecia". Explica con calma y con analogías claras (el juego de mesa para los axiomas, la maleta o la receta de cocina cuando ayude), profundiza en el POR QUÉ de cada demostración en vez de solo dar el resultado, y conecta cada tema griego con su relevancia moderna cuando el estudiante pregunte. Sé paciente con quien nunca ha visto una demostración formal antes.',
  icon: '🏛️',
  color: '#38bdf8',
  category: 'Matemáticas',
  subcategory: 'Historia de las Matemáticas',
  difficulty: 'principiante',
  locked: false,
  modules,
}

function sqlStr(js) {
  return `'${JSON.stringify(js).replace(/'/g, "''")}'`
}

const sql = `-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 039 — Curso "Matemáticas de la Antigua Grecia: Axiomas y los
-- Padres de la Geometría" (course-matematicas-griegas)
-- ${modules.length} clases: Tales, Pitágoras, axiomas, Euclides y sus 5 postulados,
-- y Arquímedes — 5 videos narrados (1 corto de bienvenida + 4 largos de
-- 5-6+ minutos, uno por figura), lecciones de texto profundas, ejercicios
-- abiertos y quiz en cada tema. Curso nuevo y separado de
-- "Historia de las Matemáticas: Del Origen al Infinito" (course-historia-
-- matematicas), que ya cubre a estos mismos griegos pero de forma breve
-- dentro de un recorrido de 28 civilizaciones — este profundiza solo en
-- Grecia, a pedido explícito del dueño.
-- ════════════════════════════════════════════════════════════════════════

insert into public.courses
  (id, title, description, ai_instructions, icon, color, category, subcategory, difficulty, locked, modules)
values (
  '${course.id}',
  '${course.title.replace(/'/g, "''")}',
  '${course.description.replace(/'/g, "''")}',
  '${course.ai_instructions.replace(/'/g, "''")}',
  '${course.icon}',
  '${course.color}',
  '${course.category}',
  '${course.subcategory}',
  '${course.difficulty}',
  ${course.locked},
  ${sqlStr(course.modules)}
)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  ai_instructions = excluded.ai_instructions,
  icon = excluded.icon,
  color = excluded.color,
  category = excluded.category,
  subcategory = excluded.subcategory,
  difficulty = excluded.difficulty,
  locked = excluded.locked,
  modules = excluded.modules,
  updated_at = now();
`

writeFileSync(path.join(process.cwd(), 'supabase', 'migration_039.sql'), sql)
console.log('✓ supabase/migration_039.sql —', modules.length, 'módulos,', JSON.stringify(sql).length, 'bytes de SQL')
