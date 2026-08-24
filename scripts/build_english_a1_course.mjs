// Genera supabase/migration_042.sql: inserta el curso "Inglés desde Cero
// (A1): Tu Primer Paso" en public.courses. Primer curso real de la Academia
// de Idiomas (categoría "Idiomas", subcategoría "Inglés" — las siguientes
// clave A2/B1/etc se agregan como cursos nuevos en la misma subcategoría).
// Corre una vez, no forma parte de la app. Uso:
//   node scripts/build_english_a1_course.mjs
import { writeFileSync } from 'node:fs'
import path from 'node:path'

const COURSE_ID = 'course-ingles-a1'
const IMG = `<img src="/course-images/${COURSE_ID}/placeholder.svg" alt="Imagen de la clase (de prueba)" class="mb-5 w-full rounded-xl border border-border" />`

const modules = [
  // ── 0. Bienvenida ──────────────────────────────────────────────────────
  {
    id: 0,
    order: 0,
    type: 'text',
    title: 'Bienvenida: tu primer paso en inglés',
    description: 'Por qué este curso está pensado 100% desde el español, y qué vas a poder hacer al terminar el nivel A1.',
    content: `
${IMG}
<div class="tip">
🧭 Soy el <strong>Viajero Encapuchado</strong>, tu guía en la Academia de Idiomas de Oliver Academy. He aprendido y enseñado docenas de idiomas — y el inglés desde el español es uno de los caminos más agradecidos: comparten el alfabeto y muchísimas palabras parecidas ("información" / "information", "importante" / "important").
</div>

<h2>¿Qué es el nivel A1?</h2>
<p>A1 es el primer nivel del <strong>Marco Común Europeo de Referencia (MCER)</strong>, el estándar que usan casi todas las academias de idiomas del mundo. Al terminar A1 vas a poder:</p>
<ul>
<li>Presentarte, saludar y despedirte en inglés</li>
<li>Hablar de tu familia, tu casa y tu rutina diaria</li>
<li>Decir la hora, los números, los días y el clima</li>
<li>Hacer preguntas simples y entender respuestas cortas</li>
<li>Sobrevivir situaciones básicas: una tienda, un restaurante, pedir ayuda</li>
</ul>

<h2>Cómo está organizado este curso</h2>
<p>Son 38 clases cortas, agrupadas en 6 bloques: fundamentos, números y tiempo, vocabulario cotidiano, gramática esencial, vida diaria y comunicación práctica. Cada clase tiene una explicación en español, ejemplos reales y una pregunta para comprobar que quedó claro. La última clase es un repaso general.</p>

<div class="example">
📖 No necesitas memorizar todo de un tirón. El inglés se aprende por repetición y uso — vuelve a las clases anteriores cuando lo necesites, no hay prisa.
</div>
`,
    exercises: [],
    resources: [
      { label: 'YouGlish — escucha cómo se pronuncia cualquier palabra en inglés real', url: 'https://youglish.com' },
    ],
  },

  // ── 1. Abecedario y pronunciación ────────────────────────────────────────
  {
    id: 1, order: 1, type: 'text',
    title: 'El abecedario y la pronunciación en inglés',
    description: 'Las letras se llaman distinto en inglés — y algunos sonidos no existen en español.',
    content: `
${IMG}
<h2>El alfabeto (the alphabet)</h2>
<p>Tiene las mismas 26 letras que el español (sin la Ñ), pero se <strong>pronuncian distinto</strong>. Deletrear (spell) es muy común en inglés: para dar tu nombre, tu correo o tu dirección por teléfono.</p>
<table>
<tr><th>Letra</th><th>Se pronuncia como</th></tr>
<tr><td>A</td><td>éi</td></tr>
<tr><td>E</td><td>i</td></tr>
<tr><td>I</td><td>ai</td></tr>
<tr><td>J</td><td>yéi</td></tr>
<tr><td>G</td><td>yi</td></tr>
<tr><td>H</td><td>éich</td></tr>
<tr><td>W</td><td>dábl-iu</td></tr>
<tr><td>Y</td><td>uái</td></tr>
</table>

<div class="warn">
⚠️ Las vocales en inglés NO suenan como en español. La "A" no suena "a", suena "éi" (como en <em>name</em>). Este es el error más común de un hispanohablante empezando — tu oído se va a acostumbrar con práctica.
</div>

<h2>Sonidos que no existen en español</h2>
<ul>
<li><strong>TH</strong> (como en <em>think</em>, <em>the</em>): la lengua entre los dientes, no es ni "d" ni "z"</li>
<li><strong>La "R" inglesa</strong> (como en <em>car</em>, <em>red</em>): no se hace vibrar la lengua como en español</li>
<li><strong>Vocales cortas vs. largas</strong>: <em>ship</em> (barco) y <em>sheep</em> (oveja) son palabras distintas solo por la duración de la vocal</li>
</ul>

<div class="example">
💡 Usa YouGlish (en los recursos de esta clase) para escuchar cualquier palabra pronunciada por hablantes reales en videos de YouTube — es gratis y es la mejor forma de entrenar el oído.
</div>
`,
    exercises: [],
    resources: [
      { label: 'YouGlish — pronunciación real de cualquier palabra', url: 'https://youglish.com' },
    ],
    quiz: {
      question: '¿Cuál es el error más común de un hispanohablante al empezar a leer en inglés?',
      options: [
        'Confundir las consonantes',
        'Pronunciar las vocales como si fueran vocales en español',
        'No saber el orden del alfabeto',
        'Escribir con acentos',
      ],
      correctIndex: 1,
    },
  },

  // ── 2. Saludos y despedidas ───────────────────────────────────────────────
  {
    id: 2, order: 2, type: 'text',
    title: 'Saludos y despedidas',
    description: 'Lo primero que dices — y lo primero que vas a usar todos los días.',
    content: `
${IMG}
<h2>Saludos (greetings)</h2>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>Hello / Hi</td><td>Hola</td></tr>
<tr><td>Good morning</td><td>Buenos días</td></tr>
<tr><td>Good afternoon</td><td>Buenas tardes</td></tr>
<tr><td>Good evening</td><td>Buenas noches (al llegar)</td></tr>
<tr><td>How are you?</td><td>¿Cómo estás?</td></tr>
<tr><td>I'm fine, thanks. And you?</td><td>Estoy bien, gracias. ¿Y tú?</td></tr>
</table>

<h2>Despedidas (goodbyes)</h2>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>Goodbye / Bye</td><td>Adiós / Chao</td></tr>
<tr><td>See you later</td><td>Nos vemos luego</td></tr>
<tr><td>See you tomorrow</td><td>Nos vemos mañana</td></tr>
<tr><td>Good night</td><td>Buenas noches (al despedirse)</td></tr>
<tr><td>Take care</td><td>Cuídate</td></tr>
</table>

<div class="warn">
⚠️ "Good evening" se usa al <strong>saludar</strong> por la noche; "Good night" se usa solo al <strong>despedirse</strong> — nunca para saludar. Es un error muy común confundir los dos.
</div>

<div class="example">
📖 <strong>Diálogo:</strong><br>
— Hi! How are you?<br>
— I'm fine, thanks. And you?<br>
— Good, thanks! See you later.<br>
— Bye!
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Cuál usarías para DESPEDIRTE de alguien por la noche?',
      options: ['Good evening', 'Good night', 'Good morning', 'How are you?'],
      correctIndex: 1,
    },
  },

  // ── 3. Presentarte ────────────────────────────────────────────────────────
  {
    id: 3, order: 3, type: 'text',
    title: 'Presentarte: nombre, edad y nacionalidad',
    description: 'Las primeras frases completas que vas a construir tú mismo.',
    content: `
${IMG}
<h2>Decir tu nombre</h2>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>My name is Sofía.</td><td>Mi nombre es Sofía.</td></tr>
<tr><td>I'm Sofía. / I am Sofía.</td><td>Soy Sofía.</td></tr>
<tr><td>What's your name?</td><td>¿Cómo te llamas?</td></tr>
<tr><td>Nice to meet you.</td><td>Mucho gusto.</td></tr>
</table>

<h2>Decir tu edad</h2>
<div class="warn">
⚠️ En español dices "tengo 20 años" (verbo TENER). En inglés se usa el verbo <strong>TO BE</strong>: <em>I <strong>am</strong> 20 years old</em> — literalmente "soy 20 años". Traducir palabra por palabra ("I have 20 years") es un error clásico y suena raro para un hablante nativo.
</div>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>I am 20 years old.</td><td>Tengo 20 años.</td></tr>
<tr><td>How old are you?</td><td>¿Cuántos años tienes?</td></tr>
</table>

<h2>Decir de dónde eres</h2>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>I'm from Mexico.</td><td>Soy de México.</td></tr>
<tr><td>I'm Mexican.</td><td>Soy mexicano/a.</td></tr>
<tr><td>Where are you from?</td><td>¿De dónde eres?</td></tr>
</table>

<div class="example">
📖 <strong>Ejemplo completo:</strong> "Hi! My name is Sofía. I'm 20 years old and I'm from Mexico. Nice to meet you!"
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Cómo se dice correctamente "Tengo 20 años" en inglés?',
      options: ['I have 20 years', 'I am 20 years old', 'I has 20 years old', 'My 20 years'],
      correctIndex: 1,
    },
  },

  // ── 4. Pronombres personales ──────────────────────────────────────────────
  {
    id: 4, order: 4, type: 'text',
    title: 'Los pronombres personales',
    description: 'I, you, he, she, it, we, they — la base de casi cualquier oración en inglés.',
    content: `
${IMG}
<h2>Los pronombres (subject pronouns)</h2>
<table>
<tr><th>Inglés</th><th>Español</th><th>Ejemplo</th></tr>
<tr><td>I</td><td>yo</td><td>I am happy.</td></tr>
<tr><td>You</td><td>tú / usted</td><td>You are smart.</td></tr>
<tr><td>He</td><td>él</td><td>He is tall.</td></tr>
<tr><td>She</td><td>ella</td><td>She is nice.</td></tr>
<tr><td>It</td><td>eso / ello (cosas, animales)</td><td>It is a cat.</td></tr>
<tr><td>We</td><td>nosotros/as</td><td>We are friends.</td></tr>
<tr><td>You</td><td>ustedes</td><td>You are late.</td></tr>
<tr><td>They</td><td>ellos/as</td><td>They are here.</td></tr>
</table>

<div class="tip">
💡 En inglés SIEMPRE se usa el pronombre, incluso si ya está claro por el verbo — a diferencia del español, donde "estoy feliz" no necesita decir "yo". En inglés no puedes omitirlo: siempre es <em>I am happy</em>, nunca solo <em>am happy</em>.
</div>

<div class="warn">
⚠️ "You" sirve tanto para "tú" como para "usted" y "ustedes" — el inglés no distingue formalidad ni número en este pronombre. El contexto es lo que aclara a quién te refieres.
</div>

<h2>La letra "I" siempre va en mayúscula</h2>
<p>El pronombre "I" (yo) se escribe SIEMPRE con mayúscula, sin importar dónde aparezca en la oración: <em>"...and I went home"</em>, nunca <em>"...and i went home"</em>.</p>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Qué pronombre usarías para hablar de un objeto o un animal (no una persona)?',
      options: ['He', 'She', 'It', 'They'],
      correctIndex: 2,
    },
  },

  // ── 5. Verbo To Be ────────────────────────────────────────────────────────
  {
    id: 5, order: 5, type: 'text',
    title: 'El verbo To Be: soy, eres, es...',
    description: 'El verbo más importante del inglés — lo vas a usar en casi cada oración de este curso.',
    content: `
${IMG}
<h2>¿Qué es "to be"?</h2>
<p>Significa "ser" o "estar" — en inglés es UN SOLO verbo para los dos (a diferencia del español, que los separa). Cambia de forma según el pronombre:</p>
<table>
<tr><th>Pronombre</th><th>To Be</th><th>Ejemplo</th></tr>
<tr><td>I</td><td>am</td><td>I am a student.</td></tr>
<tr><td>You</td><td>are</td><td>You are my friend.</td></tr>
<tr><td>He / She / It</td><td>is</td><td>She is happy.</td></tr>
<tr><td>We</td><td>are</td><td>We are ready.</td></tr>
<tr><td>They</td><td>are</td><td>They are late.</td></tr>
</table>

<h2>Formas cortas (contractions)</h2>
<p>En el habla cotidiana casi nadie dice "I am" completo — se contrae:</p>
<table>
<tr><th>Completa</th><th>Contraída</th></tr>
<tr><td>I am</td><td>I'm</td></tr>
<tr><td>You are</td><td>You're</td></tr>
<tr><td>He is</td><td>He's</td></tr>
<tr><td>She is</td><td>She's</td></tr>
<tr><td>It is</td><td>It's</td></tr>
<tr><td>We are</td><td>We're</td></tr>
<tr><td>They are</td><td>They're</td></tr>
</table>

<h2>La forma negativa</h2>
<p>Se agrega "not" después del verbo: <em>I am not tired</em> (No estoy cansado) → contraído: <em>I'm not tired</em>. Con "is" y "are" también existe una segunda contracción: <em>isn't</em> (is not), <em>aren't</em> (are not).</p>

<div class="example">
📖 "She is not from Spain. She's from Argentina." = "Ella no es de España. Es de Argentina."
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: 'Completa: "They ___ my classmates."',
      options: ['am', 'is', 'are', 'be'],
      correctIndex: 2,
    },
  },

  // ── 6. Artículos a / an / the ─────────────────────────────────────────────
  {
    id: 6, order: 6, type: 'text',
    title: 'Artículos: a, an, the',
    description: 'Solo 3 palabras, pero con una regla de sonido muy simple que casi nadie te explica bien.',
    content: `
${IMG}
<h2>"A" y "AN" — un artículo indefinido</h2>
<p>Se usan para hablar de algo por primera vez, sin especificar cuál (equivalen a "un/una"). La regla NO depende de si la palabra empieza con vocal escrita, sino de cómo <strong>suena</strong>:</p>
<table>
<tr><th>Usa</th><th>Cuándo</th><th>Ejemplo</th></tr>
<tr><td>A</td><td>antes de sonido de consonante</td><td>a dog, a book, a university (suena "iu")</td></tr>
<tr><td>AN</td><td>antes de sonido de vocal</td><td>an apple, an hour (la H es muda), an idea</td></tr>
</table>

<div class="warn">
⚠️ "University" empieza con vocal escrita pero <strong>suena</strong> "iu" (consonante), por eso es "a university", no "an university". Y "hour" empieza con consonante escrita pero la H es muda, así que suena con vocal: "an hour".
</div>

<h2>"THE" — el artículo definido</h2>
<p>Equivale a "el / la / los / las". Se usa cuando ya sabes exactamente de qué o quién se habla:</p>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>I have a dog. The dog is brown.</td><td>Tengo un perro. El perro es café. (segunda vez, ya sabemos cuál)</td></tr>
<tr><td>The sun is bright today.</td><td>El sol está brillante hoy. (solo hay un sol)</td></tr>
</table>

<div class="example">
💡 Regla práctica: primera vez que mencionas algo → "a/an". Ya sabemos de qué hablamos → "the".
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Cuál es correcto?',
      options: ['a hour', 'an hour', 'the hour a', 'an the hour'],
      correctIndex: 1,
    },
  },

  // ── 7. Cortesía ────────────────────────────────────────────────────────────
  {
    id: 7, order: 7, type: 'text',
    title: 'Frases y preguntas básicas de cortesía',
    description: 'Please, thank you, excuse me — las palabras que abren cualquier puerta.',
    content: `
${IMG}
<h2>Frases esenciales</h2>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>Please</td><td>Por favor</td></tr>
<tr><td>Thank you / Thanks</td><td>Gracias</td></tr>
<tr><td>You're welcome</td><td>De nada</td></tr>
<tr><td>Excuse me</td><td>Disculpe (para llamar la atención de alguien)</td></tr>
<tr><td>I'm sorry</td><td>Lo siento (para disculparse por algo)</td></tr>
<tr><td>Can you help me?</td><td>¿Puedes ayudarme?</td></tr>
<tr><td>I don't understand</td><td>No entiendo</td></tr>
<tr><td>Can you repeat that, please?</td><td>¿Puedes repetir eso, por favor?</td></tr>
<tr><td>How do you say... in English?</td><td>¿Cómo se dice... en inglés?</td></tr>
</table>

<div class="warn">
⚠️ "Excuse me" y "I'm sorry" NO son intercambiables: usa "excuse me" ANTES de interrumpir o pedir algo (como "con permiso"), y "I'm sorry" DESPUÉS de haber hecho algo que necesita disculpa.
</div>

<div class="example">
📖 <strong>Diálogo:</strong><br>
— Excuse me, can you help me, please?<br>
— Of course! What do you need?<br>
— I don't understand this word. How do you say "casa" in English?<br>
— It's "house".<br>
— Thank you!<br>
— You're welcome!
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Qué frase usarías ANTES de interrumpir a alguien para pedirle algo?',
      options: ["I'm sorry", 'Excuse me', 'You\'re welcome', 'Thanks'],
      correctIndex: 1,
    },
  },

  // ── 8. Números 0-100 ───────────────────────────────────────────────────────
  {
    id: 8, order: 8, type: 'text',
    title: 'Los números del 0 al 100',
    description: 'Para precios, edades, horarios y casi todo lo demás.',
    content: `
${IMG}
<h2>Del 0 al 20</h2>
<table>
<tr><td>0 zero</td><td>1 one</td><td>2 two</td><td>3 three</td><td>4 four</td></tr>
<tr><td>5 five</td><td>6 six</td><td>7 seven</td><td>8 eight</td><td>9 nine</td></tr>
<tr><td>10 ten</td><td>11 eleven</td><td>12 twelve</td><td>13 thirteen</td><td>14 fourteen</td></tr>
<tr><td>15 fifteen</td><td>16 sixteen</td><td>17 seventeen</td><td>18 eighteen</td><td>19 nineteen</td></tr>
<tr><td>20 twenty</td><td></td><td></td><td></td><td></td></tr>
</table>

<h2>Las decenas</h2>
<table>
<tr><td>20 twenty</td><td>30 thirty</td><td>40 forty</td><td>50 fifty</td></tr>
<tr><td>60 sixty</td><td>70 seventy</td><td>80 eighty</td><td>90 ninety</td></tr>
<tr><td>100 one hundred</td><td></td><td></td><td></td></tr>
</table>

<div class="tip">
💡 Del 21 al 99 se combinan igual que en español: decena + guión + unidad. <strong>21</strong> = twenty-<strong>one</strong>, <strong>35</strong> = thirty-<strong>five</strong>, <strong>99</strong> = ninety-<strong>nine</strong>.
</div>

<div class="warn">
⚠️ No confundas "13-19" (terminan en "-teen", se acentúa el FINAL: thirTEEN) con las decenas "30, 40..." (terminan en "-ty", se acentúa el INICIO: THIRty). Suenan parecido pero son números muy distintos — presta atención al escuchar.
</div>
`,
    exercises: [],
    resources: [
      { label: 'YouGlish — pronunciación real de cualquier palabra', url: 'https://youglish.com' },
    ],
    quiz: {
      question: '¿Cómo se escribe 47 en inglés?',
      options: ['four-seven', 'forty-seven', 'fourty-seven', 'seven-forty'],
      correctIndex: 1,
    },
  },

  // ── 9. La hora ─────────────────────────────────────────────────────────────
  {
    id: 9, order: 9, type: 'text',
    title: 'La hora: What time is it?',
    description: 'Cómo preguntar y decir la hora en inglés.',
    content: `
${IMG}
<h2>Preguntar la hora</h2>
<p><strong>What time is it?</strong> = ¿Qué hora es?</p>

<h2>Decir la hora en punto y media</h2>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>It's three o'clock.</td><td>Son las tres.</td></tr>
<tr><td>It's three thirty. / It's half past three.</td><td>Son las tres y media.</td></tr>
<tr><td>It's noon.</td><td>Es mediodía.</td></tr>
<tr><td>It's midnight.</td><td>Es medianoche.</td></tr>
</table>

<h2>Minutos antes y después</h2>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>It's a quarter past four. (4:15)</td><td>Son las cuatro y cuarto.</td></tr>
<tr><td>It's a quarter to five. (4:45)</td><td>Son las cinco menos cuarto.</td></tr>
<tr><td>It's ten past six. (6:10)</td><td>Son las seis y diez.</td></tr>
<tr><td>It's twenty to six. (5:40)</td><td>Son las seis menos veinte.</td></tr>
</table>

<div class="warn">
⚠️ En inglés (sobre todo en Estados Unidos) las horas usan AM/PM en vez del formato de 24 horas: <strong>AM</strong> = de medianoche a mediodía, <strong>PM</strong> = de mediodía a medianoche. 3:00 PM = 15:00.
</div>

<div class="example">
📖 "Excuse me, what time is it?" — "It's a quarter past nine." (9:15)
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Cómo dirías "3:45" en inglés usando "quarter"?',
      options: ['A quarter past three', 'A quarter to four', 'Three quarter four', 'Half past three'],
      correctIndex: 1,
    },
  },

  // ── 10. Días de la semana ────────────────────────────────────────────────
  {
    id: 10, order: 10, type: 'text',
    title: 'Los días de la semana',
    description: 'Siempre se escriben con mayúscula inicial — otra diferencia con el español.',
    content: `
${IMG}
<h2>Days of the week</h2>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>Monday</td><td>Lunes</td></tr>
<tr><td>Tuesday</td><td>Martes</td></tr>
<tr><td>Wednesday</td><td>Miércoles</td></tr>
<tr><td>Thursday</td><td>Jueves</td></tr>
<tr><td>Friday</td><td>Viernes</td></tr>
<tr><td>Saturday</td><td>Sábado</td></tr>
<tr><td>Sunday</td><td>Domingo</td></tr>
</table>

<div class="warn">
⚠️ En inglés los días de la semana SIEMPRE se escriben con mayúscula inicial ("Monday", no "monday") — a diferencia del español, que los escribe en minúscula. Lo mismo aplica a los meses, que vas a ver en la próxima clase.
</div>

<h2>La semana en inglés empieza en domingo</h2>
<p>En la mayoría de calendarios de países de habla inglesa (sobre todo EE.UU.), la semana se muestra empezando en <strong>Sunday</strong>, no en lunes como en México y gran parte de Latinoamérica.</p>

<div class="example">
📖 "What day is it today?" (¿Qué día es hoy?) — "It's Wednesday." (Es miércoles.)<br>
"See you on Monday!" (¡Nos vemos el lunes!)
</div>

<div class="tip">
💡 Nota que se usa "on" antes de un día específico: "on Monday", "on Friday" — es la preposición correcta para días.
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Cómo se escribe correctamente "viernes" en una oración en inglés?',
      options: ['friday', 'Friday', 'Fryday', 'viernes'],
      correctIndex: 1,
    },
  },

  // ── 11. Meses y estaciones ────────────────────────────────────────────────
  {
    id: 11, order: 11, type: 'text',
    title: 'Los meses y las estaciones del año',
    description: 'Y por qué en el hemisferio norte "summer" no siempre es cuando tú piensas.',
    content: `
${IMG}
<h2>Months of the year</h2>
<table>
<tr><td>January</td><td>February</td><td>March</td><td>April</td></tr>
<tr><td>May</td><td>June</td><td>July</td><td>August</td></tr>
<tr><td>September</td><td>October</td><td>November</td><td>December</td></tr>
</table>

<h2>Seasons (estaciones)</h2>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>Spring</td><td>Primavera</td></tr>
<tr><td>Summer</td><td>Verano</td></tr>
<tr><td>Fall / Autumn</td><td>Otoño</td></tr>
<tr><td>Winter</td><td>Invierno</td></tr>
</table>

<div class="warn">
⚠️ Estados Unidos y Europa están en el <strong>hemisferio norte</strong>: su verano (summer) es de junio a agosto, igual que ya conoces. Pero si hablas con alguien de Argentina, Chile o Australia (hemisferio sur), su "summer" es de diciembre a febrero — ¡al revés!
</div>

<h2>Decir una fecha</h2>
<p>En inglés (formato EE.UU.) el orden es <strong>mes / día / año</strong>: "July 4th, 2026" (4 de julio de 2026). Al escribirlo corto suele ser <strong>07/04/2026</strong>, distinto al formato día/mes/año que usamos en español.</p>

<div class="example">
📖 "My birthday is in March." (Mi cumpleaños es en marzo.)<br>
"Fall is my favorite season." (El otoño es mi estación favorita.)
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: 'Si un amigo de Argentina te dice que es "summer" en diciembre, ¿por qué tiene razón?',
      options: [
        'Está equivocado, siempre es invierno en diciembre',
        'Argentina está en el hemisferio sur, donde las estaciones están invertidas',
        '"Summer" significa diciembre en todos lados',
        'Solo es un error de traducción',
      ],
      correctIndex: 1,
    },
  },

  // ── 12. El clima ───────────────────────────────────────────────────────────
  {
    id: 12, order: 12, type: 'text',
    title: 'El clima: cómo describirlo',
    description: 'Un tema de conversación universal, hasta en inglés.',
    content: `
${IMG}
<h2>Preguntar por el clima</h2>
<p><strong>What's the weather like today?</strong> = ¿Cómo está el clima hoy?</p>

<h2>Describir el clima</h2>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>It's sunny.</td><td>Está soleado.</td></tr>
<tr><td>It's cloudy.</td><td>Está nublado.</td></tr>
<tr><td>It's raining.</td><td>Está lloviendo.</td></tr>
<tr><td>It's snowing.</td><td>Está nevando.</td></tr>
<tr><td>It's windy.</td><td>Hace viento.</td></tr>
<tr><td>It's hot.</td><td>Hace calor.</td></tr>
<tr><td>It's cold.</td><td>Hace frío.</td></tr>
<tr><td>It's cool.</td><td>Está fresco.</td></tr>
</table>

<div class="tip">
💡 Nota el patrón: casi todas las frases del clima empiezan con <strong>"It's..."</strong> — el pronombre "it" se usa para hablar de algo general, sin sujeto específico. Lo mismo pasa con la hora ("It's three o'clock").
</div>

<h2>Temperatura</h2>
<p>En Estados Unidos la temperatura se mide en <strong>Fahrenheit</strong> (°F), no en Celsius (°C) como en México. 32°F = 0°C (congela el agua), 100°F ≈ 38°C (muy caliente).</p>

<div class="example">
📖 "It's sunny and hot today, about 90 degrees." (Está soleado y caliente hoy, como 90 grados [Fahrenheit].)
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Con qué palabra empiezan casi todas las frases para describir el clima?',
      options: ['I', 'You', "It's", 'They'],
      correctIndex: 2,
    },
  },

  // ── 13. Colores ────────────────────────────────────────────────────────────
  {
    id: 13, order: 13, type: 'text',
    title: 'Los colores',
    description: 'Vocabulario corto, uso constante — en ropa, objetos y descripciones.',
    content: `
${IMG}
<h2>Colors</h2>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>Red</td><td>Rojo</td></tr>
<tr><td>Blue</td><td>Azul</td></tr>
<tr><td>Yellow</td><td>Amarillo</td></tr>
<tr><td>Green</td><td>Verde</td></tr>
<tr><td>Orange</td><td>Naranja</td></tr>
<tr><td>Purple</td><td>Morado</td></tr>
<tr><td>Pink</td><td>Rosa</td></tr>
<tr><td>Black</td><td>Negro</td></tr>
<tr><td>White</td><td>Blanco</td></tr>
<tr><td>Gray / Grey</td><td>Gris</td></tr>
<tr><td>Brown</td><td>Café / Marrón</td></tr>
</table>

<h2>Usarlos en una oración</h2>
<p>El color va ANTES del sustantivo (como casi todos los adjetivos en inglés — lo vas a ver más en la clase de gramática): <em>a red car</em> (un carro rojo), no "a car red".</p>

<div class="example">
📖 "My favorite color is blue." (Mi color favorito es el azul.)<br>
"She's wearing a green dress." (Ella trae puesto un vestido verde.)
</div>

<div class="warn">
⚠️ "Orange" es tanto el color naranja como la fruta naranja — el contexto aclara cuál es.
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Cuál es el orden correcto?',
      options: ['a car red', 'a red car', 'red a car', 'car a red'],
      correctIndex: 1,
    },
  },

  // ── 14. La familia ────────────────────────────────────────────────────────
  {
    id: 14, order: 14, type: 'text',
    title: 'La familia',
    description: 'Mother, father, brother, sister... y algunas palabras que no se dividen por género tan claro como en español.',
    content: `
${IMG}
<h2>Family members</h2>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>Mother / Mom</td><td>Madre / Mamá</td></tr>
<tr><td>Father / Dad</td><td>Padre / Papá</td></tr>
<tr><td>Parents</td><td>Padres</td></tr>
<tr><td>Brother</td><td>Hermano</td></tr>
<tr><td>Sister</td><td>Hermana</td></tr>
<tr><td>Siblings</td><td>Hermanos (en general, sin distinguir género)</td></tr>
<tr><td>Son</td><td>Hijo</td></tr>
<tr><td>Daughter</td><td>Hija</td></tr>
<tr><td>Grandmother / Grandma</td><td>Abuela</td></tr>
<tr><td>Grandfather / Grandpa</td><td>Abuelo</td></tr>
<tr><td>Aunt</td><td>Tía</td></tr>
<tr><td>Uncle</td><td>Tío</td></tr>
<tr><td>Cousin</td><td>Primo / Prima (misma palabra para ambos)</td></tr>
</table>

<div class="warn">
⚠️ "Cousin" no distingue género (sirve para primo Y prima), y "siblings" no distingue entre hermanos y hermanas — el español es más específico en estos casos que el inglés.
</div>

<h2>Hablar de tu familia</h2>
<div class="example">
📖 "I have two siblings: a brother and a sister." (Tengo dos hermanos: un hermano y una hermana.)<br>
"This is my family." (Esta es mi familia.)
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Qué palabra en inglés sirve tanto para "primo" como para "prima"?',
      options: ['Sibling', 'Cousin', 'Aunt', 'Uncle'],
      correctIndex: 1,
    },
  },

  // ── 15. El cuerpo humano ──────────────────────────────────────────────────
  {
    id: 15, order: 15, type: 'text',
    title: 'El cuerpo humano',
    description: 'Vocabulario esencial para describir, doler o vestir.',
    content: `
${IMG}
<h2>Body parts</h2>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>Head</td><td>Cabeza</td></tr>
<tr><td>Hair</td><td>Cabello</td></tr>
<tr><td>Face</td><td>Cara</td></tr>
<tr><td>Eyes</td><td>Ojos</td></tr>
<tr><td>Nose</td><td>Nariz</td></tr>
<tr><td>Mouth</td><td>Boca</td></tr>
<tr><td>Ears</td><td>Orejas</td></tr>
<tr><td>Arm(s)</td><td>Brazo(s)</td></tr>
<tr><td>Hand(s)</td><td>Mano(s)</td></tr>
<tr><td>Leg(s)</td><td>Pierna(s)</td></tr>
<tr><td>Foot / Feet</td><td>Pie / Pies (plural irregular)</td></tr>
<tr><td>Stomach</td><td>Estómago</td></tr>

</table>

<div class="tip">
💡 "Foot" (singular) → "feet" (plural) es un plural IRREGULAR, no lleva "-s" como la mayoría de sustantivos. Es uno de los primeros que vas a ver de este tipo — hay una lista más completa en la clase de plurales.
</div>

<h2>Decir que algo te duele</h2>
<div class="example">
📖 "My head hurts." (Me duele la cabeza.)<br>
"I have a stomachache." (Tengo dolor de estómago.)<br>
"My feet hurt." (Me duelen los pies.)
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Cuál es el plural de "foot" (pie)?',
      options: ['Foots', 'Feets', 'Feet', 'Footes'],
      correctIndex: 2,
    },
  },

  // ── 16. Ropa ───────────────────────────────────────────────────────────────
  {
    id: 16, order: 16, type: 'text',
    title: 'La ropa y los accesorios',
    description: 'Para comprar, describir y hablar de lo que traes puesto.',
    content: `
${IMG}
<h2>Clothes</h2>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>Shirt</td><td>Camisa</td></tr>
<tr><td>T-shirt</td><td>Playera</td></tr>
<tr><td>Pants / Trousers</td><td>Pantalones</td></tr>
<tr><td>Shorts</td><td>Pantalones cortos</td></tr>
<tr><td>Dress</td><td>Vestido</td></tr>
<tr><td>Skirt</td><td>Falda</td></tr>
<tr><td>Jacket</td><td>Chaqueta</td></tr>
<tr><td>Shoes</td><td>Zapatos</td></tr>
<tr><td>Socks</td><td>Calcetines</td></tr>
<tr><td>Hat</td><td>Sombrero / Gorra</td></tr>
</table>

<h2>Ponerse ropa: "wear" vs "put on"</h2>
<table>
<tr><th>Inglés</th><th>Español</th><th>Cuándo usarlo</th></tr>
<tr><td>I wear a jacket.</td><td>Traigo puesta una chaqueta.</td><td>Ya la traes puesta</td></tr>
<tr><td>I'm putting on a jacket.</td><td>Me estoy poniendo una chaqueta.</td><td>La acción de ponértela</td></tr>
</table>

<div class="warn">
⚠️ "Pants" en inglés americano son los pantalones normales — pero en inglés británico "pants" significa <strong>ropa interior</strong>. Si viajas al Reino Unido, usa "trousers" para pantalones.
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: 'Si ya traes puesta una camisa y quieres decirlo, ¿qué verbo usas?',
      options: ['Put on', 'Wear', 'Take off', 'Buy'],
      correctIndex: 1,
    },
  },

  // ── 17. La casa ────────────────────────────────────────────────────────────
  {
    id: 17, order: 17, type: 'text',
    title: 'La casa y las habitaciones',
    description: 'Para describir dónde vives y qué hay en cada cuarto.',
    content: `
${IMG}
<h2>Rooms (habitaciones)</h2>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>Kitchen</td><td>Cocina</td></tr>
<tr><td>Living room</td><td>Sala</td></tr>
<tr><td>Bedroom</td><td>Recámara / Dormitorio</td></tr>
<tr><td>Bathroom</td><td>Baño</td></tr>
<tr><td>Dining room</td><td>Comedor</td></tr>
<tr><td>Garage</td><td>Garaje</td></tr>
<tr><td>Yard / Garden</td><td>Patio / Jardín</td></tr>
</table>

<h2>Tipos de vivienda</h2>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>House</td><td>Casa</td></tr>
<tr><td>Apartment</td><td>Departamento</td></tr>
<tr><td>Floor</td><td>Piso (nivel del edificio)</td></tr>
</table>

<div class="example">
📖 "My house has three bedrooms and two bathrooms." (Mi casa tiene tres recámaras y dos baños.)<br>
"I live in an apartment on the fifth floor." (Vivo en un departamento en el quinto piso.)
</div>

<div class="tip">
💡 Vas a ver "There is / There are" en la clase de gramática — es justo la estructura que se usa para describir qué hay en una casa: "There are three bedrooms."
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Cuál es la palabra correcta para "sala" en inglés?',
      options: ['Bedroom', 'Living room', 'Dining room', 'Bathroom'],
      correctIndex: 1,
    },
  },

  // ── 18. Muebles ────────────────────────────────────────────────────────────
  {
    id: 18, order: 18, type: 'text',
    title: 'Los muebles y objetos del hogar',
    description: 'Lo que hay dentro de cada habitación.',
    content: `
${IMG}
<h2>Furniture (muebles)</h2>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>Bed</td><td>Cama</td></tr>
<tr><td>Table</td><td>Mesa</td></tr>
<tr><td>Chair</td><td>Silla</td></tr>
<tr><td>Sofa / Couch</td><td>Sofá</td></tr>
<tr><td>Closet</td><td>Clóset / Armario</td></tr>
<tr><td>Desk</td><td>Escritorio</td></tr>
<tr><td>Mirror</td><td>Espejo</td></tr>
<tr><td>Lamp</td><td>Lámpara</td></tr>
<tr><td>Refrigerator / Fridge</td><td>Refrigerador</td></tr>
<tr><td>Stove</td><td>Estufa</td></tr>
<tr><td>TV / Television</td><td>Televisión</td></tr>
</table>

<div class="example">
📖 "There's a lamp on the desk." (Hay una lámpara en el escritorio.)<br>
"The sofa is in the living room." (El sofá está en la sala.)
</div>

<div class="tip">
💡 "Furniture" es una palabra <strong>incontable</strong> en inglés — nunca se dice "furnitures" ni "a furniture". Para contar piezas dices "a piece of furniture" (una pieza de mueble).
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Cómo se dice "un mueble" (una pieza) correctamente en inglés?',
      options: ['A furniture', 'A piece of furniture', 'Furnitures', 'One furniture'],
      correctIndex: 1,
    },
  },

  // ── 19. Singular y plural ──────────────────────────────────────────────────
  {
    id: 19, order: 19, type: 'text',
    title: 'Sustantivos: singular y plural',
    description: 'La regla general es simple — los irregulares son los que hay que memorizar.',
    content: `
${IMG}
<h2>La regla general: agregar "-s"</h2>
<table>
<tr><th>Singular</th><th>Plural</th></tr>
<tr><td>Book</td><td>Books</td></tr>
<tr><td>Car</td><td>Cars</td></tr>
<tr><td>Dog</td><td>Dogs</td></tr>
</table>

<h2>Cuándo agregar "-es" en vez de "-s"</h2>
<p>Si la palabra termina en -s, -ss, -sh, -ch, -x, o -z, se agrega "-es" para que se pueda pronunciar:</p>
<table>
<tr><th>Singular</th><th>Plural</th></tr>
<tr><td>Box</td><td>Boxes</td></tr>
<tr><td>Watch</td><td>Watches</td></tr>
<tr><td>Bus</td><td>Buses</td></tr>
</table>

<h2>Plurales irregulares (hay que memorizarlos)</h2>
<table>
<tr><th>Singular</th><th>Plural</th></tr>
<tr><td>Man</td><td>Men</td></tr>
<tr><td>Woman</td><td>Women</td></tr>
<tr><td>Child</td><td>Children</td></tr>
<tr><td>Foot</td><td>Feet</td></tr>
<tr><td>Tooth</td><td>Teeth</td></tr>
<tr><td>Mouse</td><td>Mice</td></tr>
<tr><td>Person</td><td>People</td></tr>
</table>

<div class="warn">
⚠️ No hay atajo para los irregulares — son un grupo corto y cerrado de palabras, así que memorizarlos de una vez (son los mismos siempre) rinde más que intentar adivinar la regla.
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Cuál es el plural correcto de "child" (niño/a)?',
      options: ['Childs', 'Childes', 'Children', 'Childrens'],
      correctIndex: 2,
    },
  },

  // ── 20. Adjetivos posesivos ────────────────────────────────────────────────
  {
    id: 20, order: 20, type: 'text',
    title: 'Adjetivos posesivos (my, your, his, her...)',
    description: 'Para decir de quién es algo, sin usar "de" como en español.',
    content: `
${IMG}
<h2>Los posesivos</h2>
<table>
<tr><th>Pronombre</th><th>Posesivo</th><th>Ejemplo</th></tr>
<tr><td>I</td><td>my</td><td>my book</td></tr>
<tr><td>You</td><td>your</td><td>your house</td></tr>
<tr><td>He</td><td>his</td><td>his car</td></tr>
<tr><td>She</td><td>her</td><td>her phone</td></tr>
<tr><td>It</td><td>its</td><td>its color</td></tr>
<tr><td>We</td><td>our</td><td>our team</td></tr>
<tr><td>They</td><td>their</td><td>their dog</td></tr>
</table>

<div class="warn">
⚠️ "His" y "her" NO dependen de qué es el objeto (como en francés), dependen del GÉNERO del dueño: "his car" (el carro de él) y "her car" (el carro de ella) — el carro no tiene género en inglés, la persona sí.
</div>

<div class="warn">
⚠️ "It's" (con apóstrofe) significa "it is" (es/está) — "its" (sin apóstrofe) es el posesivo ("de eso/de ello"). Es uno de los errores de escritura más comunes hasta entre hablantes nativos.
</div>

<div class="example">
📖 "This is my sister. Her name is Ana." (Esta es mi hermana. Su nombre es Ana.)<br>
"The dog is wagging its tail." (El perro está moviendo su cola.)
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Cuál es correcto para decir "el color de eso" (posesivo)?',
      options: ["it's color", 'its color', 'her color', 'their color'],
      correctIndex: 1,
    },
  },

  // ── 21. There is / There are ──────────────────────────────────────────────
  {
    id: 21, order: 21, type: 'text',
    title: 'Hay: There is / There are',
    description: 'Cómo decir que algo existe o está en un lugar.',
    content: `
${IMG}
<h2>La estructura</h2>
<table>
<tr><th>Inglés</th><th>Español</th><th>Cuándo</th></tr>
<tr><td>There is (There's)</td><td>Hay</td><td>Con sustantivos singulares o incontables</td></tr>
<tr><td>There are</td><td>Hay</td><td>Con sustantivos plurales</td></tr>
</table>

<div class="example">
📖 "There is a book on the table." (Hay un libro en la mesa.)<br>
"There are three books on the table." (Hay tres libros en la mesa.)<br>
"There isn't any milk." (No hay leche.)<br>
"Are there any questions?" (¿Hay preguntas?)
</div>

<h2>Preguntas y negaciones</h2>
<table>
<tr><th>Afirmación</th><th>Negación</th><th>Pregunta</th></tr>
<tr><td>There is a chair.</td><td>There isn't a chair.</td><td>Is there a chair?</td></tr>
<tr><td>There are two chairs.</td><td>There aren't two chairs.</td><td>Are there two chairs?</td></tr>
</table>

<div class="tip">
💡 "There" (hay/allí) y "their" (posesivo, de ellos) y "they're" (they are) suenan EXACTAMENTE igual — son homófonos. Aunque no hablas en tu clase todavía, vas a verlos mucho al leer, así que aprende a distinguirlos por escrito.
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Cuál usarías para "Hay cinco personas en el cuarto"?',
      options: ['There is', 'There are', 'It is', 'They are'],
      correctIndex: 1,
    },
  },

  // ── 22. Preposiciones de lugar ────────────────────────────────────────────
  {
    id: 22, order: 22, type: 'text',
    title: 'Preposiciones de lugar (in, on, under, next to...)',
    description: 'Las palabritas cortas que dicen dónde está todo.',
    content: `
${IMG}
<h2>Prepositions of place</h2>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>In</td><td>Dentro de / En (adentro de algo)</td></tr>
<tr><td>On</td><td>Sobre / Encima de (una superficie)</td></tr>
<tr><td>Under</td><td>Debajo de</td></tr>
<tr><td>Next to</td><td>Junto a / Al lado de</td></tr>
<tr><td>Between</td><td>Entre (dos cosas)</td></tr>
<tr><td>In front of</td><td>Enfrente de</td></tr>
<tr><td>Behind</td><td>Detrás de</td></tr>
<tr><td>Near</td><td>Cerca de</td></tr>
</table>

<div class="warn">
⚠️ El español usa "en" para varias ideas distintas ("en la caja", "en la mesa"), pero el inglés distingue: <strong>in</strong> the box (adentro) vs. <strong>on</strong> the table (encima de la superficie). Elegir mal entre "in" y "on" es un error muy común.
</div>

<div class="example">
📖 "The keys are in the drawer." (Las llaves están dentro del cajón.)<br>
"The lamp is on the table." (La lámpara está sobre la mesa.)<br>
"The cat is under the bed." (El gato está debajo de la cama.)<br>
"The bank is between the pharmacy and the school." (El banco está entre la farmacia y la escuela.)
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Cuál preposición usarías para "el libro está SOBRE la mesa"?',
      options: ['In', 'On', 'Under', 'Between'],
      correctIndex: 1,
    },
  },

  // ── 23. Presente simple: afirmaciones ─────────────────────────────────────
  {
    id: 23, order: 23, type: 'text',
    title: 'El presente simple: afirmaciones',
    description: 'Para hablar de rutinas, hechos y cosas que pasan siempre o casi siempre.',
    content: `
${IMG}
<h2>Cuándo se usa</h2>
<p>El presente simple se usa para rutinas, hábitos y hechos generales — cosas que pasan siempre, casi siempre, o que son verdad en general: "I work", "She studies", "The sun rises in the east".</p>

<h2>La estructura</h2>
<table>
<tr><th>Sujeto</th><th>Forma del verbo</th><th>Ejemplo</th></tr>
<tr><td>I / You / We / They</td><td>Forma base (sin cambios)</td><td>I work. They play.</td></tr>
<tr><td>He / She / It</td><td>Forma base + "-s"</td><td>He works. She plays.</td></tr>
</table>

<div class="warn">
⚠️ La "-s" SOLO se agrega con He/She/It — es el error de conjugación más común de un principiante: decir "She work" en vez de "She work<strong>s</strong>".
</div>

<h2>Verbos que necesitan "-es" en vez de "-s"</h2>
<p>Igual que con los plurales de sustantivos: si el verbo termina en -s, -sh, -ch, -x, o -o, se agrega "-es": <em>watch → watches</em>, <em>go → goes</em>, <em>do → does</em>.</p>

<h2>Verbos que terminan en consonante + "y"</h2>
<p>La "y" cambia a "i" antes de agregar "-es": <em>study → studies</em>, <em>fly → flies</em>.</p>

<div class="example">
📖 "I live in Mexico City." (Vivo en la Ciudad de México.)<br>
"She works at a hospital." (Ella trabaja en un hospital.)<br>
"They study English every day." (Ellos estudian inglés todos los días.)
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: 'Completa correctamente: "He ___ (study) English every day."',
      options: ['study', 'studys', 'studies', 'studying'],
      correctIndex: 2,
    },
  },

  // ── 24. Presente simple: preguntas y negaciones ──────────────────────────
  {
    id: 24, order: 24, type: 'text',
    title: 'El presente simple: preguntas y negaciones',
    description: 'Aquí es donde aparece "do" / "does" — clave para casi cualquier pregunta en inglés.',
    content: `
${IMG}
<h2>Negaciones: "don't" / "doesn't"</h2>
<table>
<tr><th>Sujeto</th><th>Negación</th><th>Ejemplo</th></tr>
<tr><td>I / You / We / They</td><td>don't + verbo base</td><td>I don't like coffee.</td></tr>
<tr><td>He / She / It</td><td>doesn't + verbo base</td><td>She doesn't like coffee.</td></tr>
</table>

<div class="warn">
⚠️ Cuando usas "doesn't", el verbo principal PIERDE la "-s" — es un error muy común escribir "She doesn't likes" (incorrecto); lo correcto es "She doesn't like" (la "-s" ya está en "doesn't").
</div>

<h2>Preguntas: "Do" / "Does"</h2>
<table>
<tr><th>Sujeto</th><th>Pregunta</th><th>Ejemplo</th></tr>
<tr><td>I / You / We / They</td><td>Do + sujeto + verbo base...?</td><td>Do you like pizza?</td></tr>
<tr><td>He / She / It</td><td>Does + sujeto + verbo base...?</td><td>Does she like pizza?</td></tr>
</table>

<div class="example">
📖 "Do you speak English?" — "Yes, I do." / "No, I don't."<br>
"Does he work on Saturdays?" — "Yes, he does." / "No, he doesn't."
</div>

<div class="tip">
💡 "Do" y "does" no se traducen solos — son "palabras auxiliares" que solo existen para armar la pregunta o la negación en inglés. El español no tiene un equivalente directo (no decimos "¿Haces tú hablar inglés?").
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Cuál es correcto?',
      options: ["She doesn't likes coffee", "She doesn't like coffee", "She don't like coffee", "She not like coffee"],
      correctIndex: 1,
    },
  },

  // ── 25. Can / can't ────────────────────────────────────────────────────────
  {
    id: 25, order: 25, type: 'text',
    title: 'Los verbos modales: can / can\'t',
    description: 'Para hablar de habilidad y posibilidad — uno de los verbos más usados de todo el idioma.',
    content: `
${IMG}
<h2>"Can" = poder / saber</h2>
<p>Expresa habilidad ("saber hacer algo") o posibilidad ("poder hacer algo"). Es un verbo MODAL: no cambia de forma según el sujeto (no lleva "-s" con he/she/it) y siempre va seguido del verbo en su forma base, sin "to".</p>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>I can swim.</td><td>Sé nadar. / Puedo nadar.</td></tr>
<tr><td>She can speak French.</td><td>Ella sabe hablar francés.</td></tr>
<tr><td>They can help you.</td><td>Ellos pueden ayudarte.</td></tr>
</table>

<div class="warn">
⚠️ Nunca se dice "She cans speak" ni "She can to speak" — "can" NUNCA lleva "-s" y NUNCA va seguido de "to". Siempre: can + verbo base.
</div>

<h2>La negación: "can't" (cannot)</h2>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>I can't swim.</td><td>No sé nadar.</td></tr>
<tr><td>He can't come today.</td><td>Él no puede venir hoy.</td></tr>
</table>

<h2>Preguntas</h2>
<div class="example">
📖 "Can you help me?" (¿Puedes ayudarme?) — "Yes, I can." / "No, I can't."<br>
"Can she drive?" (¿Sabe manejar ella?)
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Cuál es correcto?',
      options: ['She cans speak English', 'She can to speak English', 'She can speak English', 'She can speaks English'],
      correctIndex: 2,
    },
  },

  // ── 26. Rutina diaria ──────────────────────────────────────────────────────
  {
    id: 26, order: 26, type: 'text',
    title: 'La rutina diaria',
    description: 'Verbos y frases para contar cómo es tu día — presente simple en acción.',
    content: `
${IMG}
<h2>Daily routine verbs</h2>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>Wake up</td><td>Despertar</td></tr>
<tr><td>Get up</td><td>Levantarse</td></tr>
<tr><td>Take a shower</td><td>Bañarse</td></tr>
<tr><td>Have breakfast</td><td>Desayunar</td></tr>
<tr><td>Go to work / school</td><td>Ir al trabajo / a la escuela</td></tr>
<tr><td>Have lunch</td><td>Comer (almorzar)</td></tr>
<tr><td>Come home</td><td>Volver a casa</td></tr>
<tr><td>Have dinner</td><td>Cenar</td></tr>
<tr><td>Go to bed</td><td>Irse a dormir</td></tr>
</table>

<h2>Usarlos con presente simple</h2>
<div class="example">
📖 "I wake up at seven o'clock. I take a shower and have breakfast. Then I go to work. I have lunch at one o'clock and I come home at six. I have dinner and I go to bed at eleven."
</div>

<div class="tip">
💡 Recuerda la regla de la clase de presente simple: si hablas de TI (I) no agregas "-s", pero si describes la rutina de otra persona (he/she), sí: "He wake<strong>s</strong> up at six" y "He <strong>has</strong> breakfast" (has es la forma irregular de have con he/she/it).
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: 'Completa: "She ___ (have) breakfast at eight."',
      options: ['have', 'haves', 'has', 'having'],
      correctIndex: 2,
    },
  },

  // ── 27. Comida y bebidas ───────────────────────────────────────────────────
  {
    id: 27, order: 27, type: 'text',
    title: 'La comida y las bebidas',
    description: 'Vocabulario para el súper, la cocina y la mesa.',
    content: `
${IMG}
<h2>Food (comida)</h2>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>Bread</td><td>Pan</td></tr>
<tr><td>Rice</td><td>Arroz</td></tr>
<tr><td>Meat</td><td>Carne</td></tr>
<tr><td>Chicken</td><td>Pollo</td></tr>
<tr><td>Fish</td><td>Pescado</td></tr>
<tr><td>Vegetables</td><td>Verduras</td></tr>
<tr><td>Fruit</td><td>Fruta</td></tr>
<tr><td>Eggs</td><td>Huevos</td></tr>
<tr><td>Cheese</td><td>Queso</td></tr>
</table>

<h2>Drinks (bebidas)</h2>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>Water</td><td>Agua</td></tr>
<tr><td>Coffee</td><td>Café</td></tr>
<tr><td>Tea</td><td>Té</td></tr>
<tr><td>Juice</td><td>Jugo</td></tr>
<tr><td>Milk</td><td>Leche</td></tr>
</table>

<h2>Sustantivos contables vs. incontables</h2>
<div class="warn">
⚠️ "Rice", "meat", "water" y "bread" son <strong>incontables</strong> en inglés — no se dice "a rice" ni "two waters". Para cantidades específicas usas "a cup of coffee", "a glass of water", "a piece of bread".
</div>

<div class="example">
📖 "I'd like a glass of water and a piece of bread, please." (Quisiera un vaso de agua y un pedazo de pan, por favor.)
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Cómo pedirías correctamente "un vaso de agua"?',
      options: ['A water', 'A glass of water', 'One water', 'A piece of water'],
      correctIndex: 1,
    },
  },

  // ── 28. En el restaurante ──────────────────────────────────────────────────
  {
    id: 28, order: 28, type: 'text',
    title: 'En el restaurante',
    description: 'Frases listas para pedir, preguntar por la cuenta y sobrevivir cualquier restaurante.',
    content: `
${IMG}
<h2>Frases útiles</h2>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>A table for two, please.</td><td>Una mesa para dos, por favor.</td></tr>
<tr><td>Can I see the menu, please?</td><td>¿Puedo ver el menú, por favor?</td></tr>
<tr><td>I'd like the chicken, please.</td><td>Quisiera el pollo, por favor.</td></tr>
<tr><td>What do you recommend?</td><td>¿Qué recomienda?</td></tr>
<tr><td>Can I have the bill, please?</td><td>¿Me trae la cuenta, por favor?</td></tr>
<tr><td>Is the tip included?</td><td>¿Está incluida la propina?</td></tr>
<tr><td>It was delicious.</td><td>Estuvo delicioso.</td></tr>
</table>

<div class="tip">
💡 "I'd like..." (contracción de "I would like") es más educado que "I want" para pedir algo — es el equivalente a "quisiera" en vez de "quiero". Úsalo siempre que estés pidiendo algo a un mesero o a un desconocido.
</div>

<div class="example">
📖 <strong>Diálogo:</strong><br>
— Hi! A table for two, please.<br>
— Sure! This way, please. Here's the menu.<br>
— Thank you. I'd like the fish, please. And a glass of water.<br>
— Of course. Anything else?<br>
— No, that's all, thanks.
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Cuál es la forma más educada de pedir algo en un restaurante?',
      options: ['I want the chicken', "I'd like the chicken, please", 'Give me the chicken', 'Chicken now'],
      correctIndex: 1,
    },
  },

  // ── 29. Profesiones ────────────────────────────────────────────────────────
  {
    id: 29, order: 29, type: 'text',
    title: 'Las profesiones y el trabajo',
    description: 'Para decir a qué te dedicas — y preguntarle a alguien más.',
    content: `
${IMG}
<h2>Jobs (profesiones)</h2>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>Doctor</td><td>Doctor/a</td></tr>
<tr><td>Teacher</td><td>Maestro/a</td></tr>
<tr><td>Engineer</td><td>Ingeniero/a</td></tr>
<tr><td>Lawyer</td><td>Abogado/a</td></tr>
<tr><td>Nurse</td><td>Enfermero/a</td></tr>
<tr><td>Chef / Cook</td><td>Cocinero/a</td></tr>
<tr><td>Waiter / Waitress</td><td>Mesero / Mesera</td></tr>
<tr><td>Police officer</td><td>Policía</td></tr>
<tr><td>Student</td><td>Estudiante</td></tr>
</table>

<h2>Preguntar y responder</h2>
<div class="example">
📖 "What do you do?" (¿A qué te dedicas?) — "I'm a teacher." (Soy maestro/a.)<br>
"Where do you work?" (¿Dónde trabajas?) — "I work at a hospital." (Trabajo en un hospital.)
</div>

<div class="warn">
⚠️ Para decir tu profesión se usa el verbo TO BE + el artículo "a/an": "I'm <strong>a</strong> teacher" — no se omite el artículo como en español ("Soy maestro", sin "un").
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Cómo dirías correctamente "Soy ingeniero" en inglés?',
      options: ["I'm engineer", "I'm a engineer", "I'm an engineer", 'I engineer'],
      correctIndex: 2,
    },
  },

  // ── 30. Escuela ────────────────────────────────────────────────────────────
  {
    id: 30, order: 30, type: 'text',
    title: 'La escuela y los útiles escolares',
    description: 'Vocabulario del salón de clases.',
    content: `
${IMG}
<h2>School supplies (útiles escolares)</h2>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>Pen</td><td>Pluma</td></tr>
<tr><td>Pencil</td><td>Lápiz</td></tr>
<tr><td>Notebook</td><td>Cuaderno</td></tr>
<tr><td>Backpack</td><td>Mochila</td></tr>
<tr><td>Eraser</td><td>Goma / Borrador</td></tr>
<tr><td>Ruler</td><td>Regla</td></tr>
<tr><td>Book</td><td>Libro</td></tr>
<tr><td>Desk</td><td>Escritorio / Pupitre</td></tr>
<tr><td>Classroom</td><td>Salón de clases</td></tr>
<tr><td>Teacher</td><td>Maestro/a</td></tr>
<tr><td>Homework</td><td>Tarea</td></tr>
<tr><td>Test / Exam</td><td>Examen</td></tr>
</table>

<div class="example">
📖 "I have a test tomorrow." (Tengo un examen mañana.)<br>
"Can I borrow your pencil?" (¿Me prestas tu lápiz?)<br>
"I forgot my homework at home." (Olvidé mi tarea en casa.)
</div>

<div class="tip">
💡 "Homework" es incontable (como "furniture" en la clase de muebles): nunca "a homework" ni "homeworks" — se dice "some homework" o "a piece of homework".
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Cómo se dice correctamente "tarea" (sin contarla) en inglés?',
      options: ['A homework', 'Homeworks', 'Homework', 'The homeworks'],
      correctIndex: 2,
    },
  },

  // ── 31. Animales ───────────────────────────────────────────────────────────
  {
    id: 31, order: 31, type: 'text',
    title: 'Los animales',
    description: 'Mascotas, animales de granja y de la naturaleza.',
    content: `
${IMG}
<h2>Pets (mascotas)</h2>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>Dog</td><td>Perro</td></tr>
<tr><td>Cat</td><td>Gato</td></tr>
<tr><td>Fish</td><td>Pez</td></tr>
<tr><td>Bird</td><td>Pájaro</td></tr>
</table>

<h2>Farm and wild animals</h2>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>Cow</td><td>Vaca</td></tr>
<tr><td>Horse</td><td>Caballo</td></tr>
<tr><td>Pig</td><td>Cerdo</td></tr>
<tr><td>Chicken</td><td>Gallina</td></tr>
<tr><td>Lion</td><td>León</td></tr>
<tr><td>Elephant</td><td>Elefante</td></tr>
<tr><td>Monkey</td><td>Mono</td></tr>
<tr><td>Snake</td><td>Serpiente</td></tr>
</table>

<div class="warn">
⚠️ "Fish" es igual en singular y plural: "one fish", "two fish" — no se dice "fishes" cuando hablas de varios peces vivos (esa forma se usa solo para hablar de distintas especies de peces).
</div>

<div class="example">
📖 "I have a dog and two cats." (Tengo un perro y dos gatos.)<br>
"There's a bird in the tree." (Hay un pájaro en el árbol.)
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Cuál es el plural de "fish" cuando hablas de varios peces vivos?',
      options: ['Fishs', 'Fishes', 'Fish (sin cambio)', 'Feesh'],
      correctIndex: 2,
    },
  },

  // ── 32. Transporte ─────────────────────────────────────────────────────────
  {
    id: 32, order: 32, type: 'text',
    title: 'Los medios de transporte',
    description: 'Cómo dices que llegaste a algún lado — con las preposiciones correctas.',
    content: `
${IMG}
<h2>Means of transportation</h2>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>Car</td><td>Carro</td></tr>
<tr><td>Bus</td><td>Autobús</td></tr>
<tr><td>Train</td><td>Tren</td></tr>
<tr><td>Plane</td><td>Avión</td></tr>
<tr><td>Bike / Bicycle</td><td>Bicicleta</td></tr>
<tr><td>Taxi</td><td>Taxi</td></tr>
<tr><td>Subway</td><td>Metro</td></tr>
<tr><td>On foot</td><td>A pie</td></tr>
</table>

<h2>"By" para el medio de transporte</h2>
<p>Para decir CÓMO llegaste a algún lugar se usa "by" + el medio de transporte (sin artículo):</p>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>I go to work by bus.</td><td>Voy al trabajo en autobús.</td></tr>
<tr><td>She travels by plane.</td><td>Ella viaja en avión.</td></tr>
<tr><td>I go to school on foot.</td><td>Voy a la escuela a pie.</td></tr>
</table>

<div class="warn">
⚠️ La única excepción es "a pie", que usa "on foot" (no "by foot"). Todos los demás medios de transporte usan "by".
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Cómo dirías correctamente "voy al trabajo en tren"?',
      options: ['I go to work by train', 'I go to work on train', 'I go to work with train', 'I go to work train'],
      correctIndex: 0,
    },
  },

  // ── 33. La ciudad ──────────────────────────────────────────────────────────
  {
    id: 33, order: 33, type: 'text',
    title: 'La ciudad: lugares y direcciones',
    description: 'Para orientarte y preguntar cómo llegar a algún lugar.',
    content: `
${IMG}
<h2>Places in the city</h2>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>Bank</td><td>Banco</td></tr>
<tr><td>Supermarket</td><td>Supermercado</td></tr>
<tr><td>Pharmacy</td><td>Farmacia</td></tr>
<tr><td>Hospital</td><td>Hospital</td></tr>
<tr><td>Park</td><td>Parque</td></tr>
<tr><td>Restaurant</td><td>Restaurante</td></tr>
<tr><td>Airport</td><td>Aeropuerto</td></tr>
<tr><td>Street</td><td>Calle</td></tr>
</table>

<h2>Pedir y dar direcciones</h2>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>Excuse me, where is the bank?</td><td>Disculpe, ¿dónde está el banco?</td></tr>
<tr><td>Go straight ahead.</td><td>Siga derecho.</td></tr>
<tr><td>Turn left / right.</td><td>Dé vuelta a la izquierda / derecha.</td></tr>
<tr><td>It's on the corner.</td><td>Está en la esquina.</td></tr>
<tr><td>It's two blocks from here.</td><td>Está a dos cuadras de aquí.</td></tr>
</table>

<div class="example">
📖 "Excuse me, how do I get to the hospital?" — "Go straight ahead, then turn left. It's next to the pharmacy."
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Cómo dirías "dé vuelta a la derecha" en inglés?',
      options: ['Go straight ahead', 'Turn left', 'Turn right', "It's on the corner"],
      correctIndex: 2,
    },
  },

  // ── 34. Compras ────────────────────────────────────────────────────────────
  {
    id: 34, order: 34, type: 'text',
    title: 'Ir de compras: precios y frases útiles',
    description: 'Para preguntar precios, tallas y pagar sin problema.',
    content: `
${IMG}
<h2>Frases útiles</h2>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>How much is this?</td><td>¿Cuánto cuesta esto?</td></tr>
<tr><td>How much are these?</td><td>¿Cuánto cuestan estos?</td></tr>
<tr><td>It's $20.</td><td>Cuesta 20 dólares.</td></tr>
<tr><td>Do you have this in a different size?</td><td>¿Tiene esto en otra talla?</td></tr>
<tr><td>Can I try it on?</td><td>¿Me lo puedo probar?</td></tr>
<tr><td>I'll take it.</td><td>Me lo llevo.</td></tr>
<tr><td>Do you accept credit cards?</td><td>¿Aceptan tarjeta de crédito?</td></tr>
<tr><td>It's too expensive.</td><td>Está muy caro.</td></tr>
</table>

<div class="tip">
💡 "How much" se usa con sustantivos incontables o para preguntar precio en general ("How much is this?"). "How many" se usa con sustantivos contables ("How many apples do you want?") — vas a verlo más en cursos siguientes.
</div>

<div class="example">
📖 <strong>Diálogo:</strong><br>
— Excuse me, how much is this shirt?<br>
— It's $15.<br>
— Do you have it in a different size?<br>
— Yes, what size do you need?<br>
— Medium, please. Can I try it on?<br>
— Of course, the fitting room is right there.
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Cómo preguntarías "¿Cuánto cuesta esto?"?',
      options: ['How many is this?', 'How much is this?', 'How is this?', 'What is this?'],
      correctIndex: 1,
    },
  },

  // ── 35. Presente continuo ─────────────────────────────────────────────────
  {
    id: 35, order: 35, type: 'text',
    title: 'El presente continuo: lo que está pasando ahora mismo',
    description: 'La diferencia entre "I work" (siempre) y "I am working" (justo ahora).',
    content: `
${IMG}
<h2>Cuándo se usa</h2>
<p>El presente continuo describe algo que está pasando <strong>en este momento</strong>, mientras hablas — a diferencia del presente simple, que es para rutinas y hechos generales (visto en clases anteriores).</p>

<h2>La estructura: to be + verbo-ing</h2>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>I am working.</td><td>Estoy trabajando.</td></tr>
<tr><td>She is studying.</td><td>Ella está estudiando.</td></tr>
<tr><td>They are eating.</td><td>Ellos están comiendo.</td></tr>
</table>

<h2>Cómo se forma el "-ing"</h2>
<table>
<tr><th>Regla</th><th>Ejemplo</th></tr>
<tr><td>Verbo + ing</td><td>play → playing</td></tr>
<tr><td>Verbo termina en "e" muda: se quita la "e"</td><td>write → writing</td></tr>
<tr><td>Verbo corto de una sílaba con consonante-vocal-consonante: se duplica la última letra</td><td>run → running</td></tr>
</table>

<div class="example">
📖 "I usually work at an office, but right now I'm working from home." (Normalmente trabajo en una oficina, pero ahora mismo estoy trabajando desde casa.) — nota el contraste entre presente simple (rutina) y presente continuo (ahora mismo) en la misma oración.
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Cuál es la forma "-ing" correcta de "write"?',
      options: ['writeing', 'writting', 'writing', 'writng'],
      correctIndex: 2,
    },
  },

  // ── 36. Comparativos y superlativos ───────────────────────────────────────
  {
    id: 36, order: 36, type: 'text',
    title: 'Comparativos y superlativos simples',
    description: 'Más grande, el más grande — cómo comparar cosas en inglés.',
    content: `
${IMG}
<h2>Adjetivos cortos (una sílaba)</h2>
<table>
<tr><th>Adjetivo</th><th>Comparativo (+er)</th><th>Superlativo (the + est)</th></tr>
<tr><td>tall (alto)</td><td>taller</td><td>the tallest</td></tr>
<tr><td>small (pequeño)</td><td>smaller</td><td>the smallest</td></tr>
<tr><td>big (grande)</td><td>bigger</td><td>the biggest</td></tr>
</table>

<h2>Adjetivos largos (dos o más sílabas)</h2>
<table>
<tr><th>Adjetivo</th><th>Comparativo (more)</th><th>Superlativo (the most)</th></tr>
<tr><td>expensive (caro)</td><td>more expensive</td><td>the most expensive</td></tr>
<tr><td>beautiful (bonito)</td><td>more beautiful</td><td>the most beautiful</td></tr>
</table>

<h2>Irregulares</h2>
<table>
<tr><th>Adjetivo</th><th>Comparativo</th><th>Superlativo</th></tr>
<tr><td>good (bueno)</td><td>better</td><td>the best</td></tr>
<tr><td>bad (malo)</td><td>worse</td><td>the worst</td></tr>
</table>

<div class="example">
📖 "This car is more expensive than that one." (Este carro es más caro que ese.)<br>
"She's the tallest person in the class." (Ella es la persona más alta de la clase.)<br>
"This is the best restaurant in town." (Este es el mejor restaurante de la ciudad.)
</div>

<div class="tip">
💡 Regla rápida: adjetivo corto → "-er" / "the -est". Adjetivo largo → "more" / "the most". Los irregulares (good, bad) no siguen ninguna de las dos reglas, hay que memorizarlos.
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Cuál es el comparativo correcto de "good" (bueno)?',
      options: ['gooder', 'more good', 'better', 'the best'],
      correctIndex: 2,
    },
  },

  // ── 37. Emergencias ────────────────────────────────────────────────────────
  {
    id: 37, order: 37, type: 'text',
    title: 'Frases de emergencia y supervivencia',
    description: 'Las frases que esperas nunca necesitar, pero que hay que saber.',
    content: `
${IMG}
<h2>Frases de emergencia</h2>
<table>
<tr><th>Inglés</th><th>Español</th></tr>
<tr><td>Help!</td><td>¡Ayuda!</td></tr>
<tr><td>Call the police!</td><td>¡Llame a la policía!</td></tr>
<tr><td>Call an ambulance!</td><td>¡Llame a una ambulancia!</td></tr>
<tr><td>I need a doctor.</td><td>Necesito un doctor.</td></tr>
<tr><td>I'm lost.</td><td>Estoy perdido/a.</td></tr>
<tr><td>I lost my passport.</td><td>Perdí mi pasaporte.</td></tr>
<tr><td>Where's the nearest hospital?</td><td>¿Dónde está el hospital más cercano?</td></tr>
<tr><td>I don't feel well.</td><td>No me siento bien.</td></tr>
</table>

<div class="tip">
💡 En Estados Unidos y Canadá, el número de emergencias es <strong>911</strong> (se dice "nine-one-one", no "nine-eleven"). En el Reino Unido es <strong>999</strong>.
</div>

<div class="example">
📖 "Excuse me, I'm lost. Where's the nearest subway station?" (Disculpe, estoy perdido/a. ¿Dónde está la estación de metro más cercana?)<br>
"I don't feel well, I need a doctor." (No me siento bien, necesito un doctor.)
</div>

<div class="warn">
⚠️ En una emergencia real, no te preocupes por hablar perfecto — di la palabra clave más importante primero ("Help!", "Doctor!", "Police!") y señala si hace falta. Comunicar es más importante que la gramática perfecta.
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: '¿Cuál es el número de emergencias en Estados Unidos?',
      options: ['999', '911', '112', '000'],
      correctIndex: 1,
    },
  },

  // ── 38. Repaso final ───────────────────────────────────────────────────────
  {
    id: 38, order: 38, type: 'text',
    title: 'Repaso general y examen final A1',
    description: 'Un vistazo rápido a todo lo que aprendiste — y a dónde sigue tu camino.',
    content: `
${IMG}
<div class="tip">
🏁 ¡Llegaste al final del nivel A1! Repasemos rápidamente los 6 bloques del curso antes del examen final.
</div>

<h2>Bloque 1 — Fundamentos</h2>
<p>El abecedario, saludos, presentarte (nombre/edad/nacionalidad), pronombres personales, el verbo <strong>to be</strong>, artículos <strong>a/an/the</strong> y frases de cortesía.</p>

<h2>Bloque 2 — Números y tiempo</h2>
<p>Números del 0 al 100, la hora, los días de la semana, los meses/estaciones y el clima.</p>

<h2>Bloque 3 — Vocabulario cotidiano</h2>
<p>Colores, familia, cuerpo humano, ropa, la casa y los muebles.</p>

<h2>Bloque 4 — Gramática esencial</h2>
<p>Singular/plural, adjetivos posesivos, <strong>there is / there are</strong>, preposiciones de lugar, presente simple (afirmaciones, negaciones y preguntas con do/does) y <strong>can/can't</strong>.</p>

<h2>Bloque 5 — Vida diaria</h2>
<p>Rutina diaria, comida y bebidas, el restaurante, profesiones, la escuela, animales, transporte y la ciudad.</p>

<h2>Bloque 6 — Comunicación práctica</h2>
<p>Ir de compras, presente continuo, comparativos/superlativos y frases de emergencia.</p>

<div class="example">
📖 <strong>Reto:</strong> intenta presentarte en inglés en voz alta sin ver la clase 3 — nombre, edad, nacionalidad, tu familia y tu rutina diaria. Si puedes hacerlo con confianza, ya dominas la base del nivel A1.
</div>

<div class="warn">
⚠️ Este examen final repasa los puntos más importantes de todo el curso — si te trabas en alguna pregunta, vuelve a la clase correspondiente antes de continuar. No hay prisa.
</div>
`,
    exercises: [],
    resources: [],
    quiz: {
      question: 'Elige la oración 100% correcta:',
      options: [
        "She don't has a car, but she can drives.",
        "She doesn't have a car, but she can drive.",
        "She not have a car, but she cans drive.",
        "She doesn't has a car, but she can to drive.",
      ],
      correctIndex: 1,
    },
  },
]

const course = {
  id: COURSE_ID,
  title: 'Inglés desde Cero (A1): Tu Primer Paso',
  description: 'El primer curso de la Academia de Idiomas: inglés general nivel A1 (Marco Común Europeo), explicado 100% desde el español. 39 clases — desde el abecedario hasta comparativos, con vocabulario real, gramática esencial y las trampas más comunes que comete un hispanohablante al empezar.',
  ai_instructions: 'Eres el Viajero Encapuchado, guía de la Academia de Idiomas de Oliver Academy, en el curso "Inglés desde Cero (A1): Tu Primer Paso". Enseñas inglés general nivel A1 explicado desde el español. Tu tono es paciente, cercano y nunca condescendiente — muchos alumnos empiezan desde cero y con miedo a equivocarse. Cuando expliques gramática, usa ejemplos cortos y compara siempre con el español para señalar la diferencia (como el uso obligatorio de pronombres, o el orden adjetivo-sustantivo). Corrige con amabilidad y siempre explica el PORQUÉ del error, no solo la corrección.',
  icon: '🇬🇧',
  color: '#38bdf8',
  category: 'Idiomas',
  subcategory: 'Inglés',
  difficulty: 'principiante',
  locked: false,
  modules: modules.map((m, i) => ({ ...m, id: i, order: i })),
}

// ── SQL ─────────────────────────────────────────────────────────────────
function sqlStr(js) {
  return `'${JSON.stringify(js).replace(/'/g, "''")}'`
}

const sql = `-- ════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN 042 — Curso "Inglés desde Cero (A1): Tu Primer Paso"
-- (course-ingles-a1) — primer curso real de la Academia de Idiomas.
-- ${course.modules.length} clases nivel A1 (MCER), explicadas desde el español: fundamentos
-- (abecedario, saludos, to be, artículos), números/tiempo, vocabulario
-- cotidiano (familia, casa, ropa, comida), gramática esencial (plurales,
-- posesivos, there is/are, preposiciones, presente simple, can/can't),
-- vida diaria (rutina, restaurante, profesiones, transporte, ciudad) y
-- comunicación práctica (compras, presente continuo, comparativos,
-- emergencias). Cierra con repaso general + examen final.
-- Categoría "Idiomas", subcategoría "Inglés" — los siguientes niveles
-- (A2, B1...) se agregan como cursos nuevos en la misma subcategoría.
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

writeFileSync(path.join(process.cwd(), 'supabase', 'migration_042.sql'), sql)
console.log('✓ supabase/migration_042.sql —', course.modules.length, 'módulos,', JSON.stringify(sql).length, 'bytes de SQL')
