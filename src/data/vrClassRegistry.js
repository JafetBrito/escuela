// Clases VR — piloto explícito para "ir probando" el sistema de instancias
// del Salón de Clases (ver ClassroomWorld + ClassLessonRunner en VRPage.jsx):
// distinto del catálogo de clases en vivo con video (useLiveClassStore/
// live_classes en Supabase), a propósito, para no tocar ese sistema ya en
// uso mientras esto se prueba.
//
// Una clase es una lista de `steps`, no un guion plano — pensado para poder
// reusar este mismo formato en cualquier clase futura:
//   { type: 'dialogue', text }     — el NPC lo dice (voz + caja de diálogo,
//                                    ver NpcSpeechPlayer/NpcDialogueBox).
//                                    Avanza solo cuando termina de hablar.
//   { type: 'reflection', prompt } — una pregunta con pausa REAL: no avanza
//                                    sola, el alumno decide cuándo seguir.
//   { type: 'video', url, caption }— abre el proyector del salón con ese
//                                    video; avanza al cerrarlo. (Sistema
//                                    listo, ver ClassVideoStep — falta que
//                                    alguna clase traiga una URL real.)
// En cualquier momento entre pasos el alumno puede pausar para hacer una
// pregunta libre (respondida por IA, ver ClassLessonRunner) sin perder su
// lugar en la clase.
export const VR_CLASSES = {
  'intro-filosofia': {
    id: 'intro-filosofia',
    title: 'Introducción a la Filosofía',
    teacherName: 'Jafet Brito',
    npcId: 'jafet',
    teacherPosition: [3, 0, 3],
    durationMinutes: 30,
    steps: [
      {
        type: 'dialogue',
        text: `Bienvenido. Soy Jafet, y hoy vamos a hablar de filosofía. Antes de empezar, quiero ser honesto contigo sobre algo: esto no va a ser una clase normal. No te voy a pedir que memorices nombres ni fechas. No hay examen al final con preguntas de opción múltiple. Lo que sí te voy a pedir, un par de veces durante los próximos minutos, es que te detengas de verdad a pensar. No a "pensar rápido para poder seguir". A quedarte un rato incómodo con una pregunta que no tiene una respuesta fácil. Eso es, literalmente, de lo que se trata esto. Si en algún momento quieres preguntarme algo, puedes hacerlo sin esperar a que termine — para eso está el botón de preguntar.`,
      },
      {
        type: 'dialogue',
        text: `La palabra "filosofía" viene del griego, y significa "amor por la sabiduría". Fíjate en el detalle: no dice "tener" sabiduría. Dice "amor" por ella. Un filósofo no es alguien que ya llegó a la respuesta. Es alguien que no puede dejar de hacerse preguntas, incluso cuando hacerlas es incómodo, incluso cuando la respuesta que encuentra no le gusta nada. Hace unos 2500 años, en Atenas, vivió un hombre llamado Sócrates que caminaba por la plaza pública deteniendo a la gente para preguntarles cosas que parecían obvias. "¿Qué es la justicia?" "¿Qué es el valor?" "¿Qué es vivir bien?" Y lo curioso es que, casi siempre, la gente que se creía muy segura de su respuesta terminaba dándose cuenta, en plena conversación, de que en realidad no podía explicar lo que decía saber. Sócrates nunca les daba la respuesta correcta. Solo les mostraba, con preguntas, que el asunto era más profundo de lo que parecía. Ese método —preguntar hasta que la certeza se tambalea un poco— sigue vivo hoy. De hecho, en un rato, tú y yo lo vamos a usar juntos.`,
      },
      {
        type: 'reflection',
        prompt: `Antes de seguir, piensa en esto un momento: ¿recuerdas la última vez que alguien te preguntó "¿por qué hiciste eso?" y te costó trabajo responder de verdad? No la excusa que diste — la razón real, la que quizás ni tú tenías del todo clara. ¿Qué fue lo que te costó tanto poner en palabras? Tómate tu tiempo. No hay prisa. Cuando sientas que ya le diste una vuelta de verdad, dale a "Continuar".`,
      },
      {
        type: 'dialogue',
        text: `La filosofía no vive solo en la Atenas antigua, aunque a veces se enseñe así, como si fuera un museo. Vive en todas partes, todos los días. Cuando te preguntas "¿por qué debería ser honesto si nadie me está viendo?", eso es filosofía moral. Cuando dudas si lo que ves es "la realidad" o solo tu interpretación particular de ella, eso es epistemología — la filosofía del conocimiento. Cuando te preguntas si una inteligencia artificial podría algún día pensar de verdad, o solo simular que piensa tan bien que ya no notamos la diferencia, eso también es filosofía, aunque suene a ciencia ficción. Te doy un ejemplo más cercano todavía. Imagina que un amigo tuyo dice que odia la mentira, que para él es de los valores más importantes que existen... pero tú lo has visto mentir "piadosamente" un par de veces, para no incomodar a alguien. ¿Es un mentiroso? ¿O simplemente su valor real no es "nunca mentir", sino algo más parecido a "no lastimar a la gente que quiero", y la honestidad se dobla cuando choca con eso? No te estoy pidiendo que lo juzgues. Te estoy pidiendo que notes que la pregunta es más difícil de lo que parecía hace un segundo. Eso, otra vez, es filosofía: notar que las cosas obvias, miradas de cerca, casi nunca lo son tanto.`,
      },
      {
        type: 'dialogue',
        text: `Hay quien piensa que la filosofía es un lujo, algo bonito para conversar mientras tomas un café, pero sin ninguna utilidad real. Yo creo justo lo contrario. Cada decisión importante que tomas en tu vida —qué estudiar, cómo tratar a los demás, en qué crees, qué haces cuando nadie te está mirando— descansa sobre una filosofía, la hayas pensado o no. La diferencia entre pensarla y no pensarla no es un detalle académico. Es la diferencia entre vivir tus valores a propósito, sabiendo por qué son tuyos, o simplemente haberlos heredado de quien fuera que te rodeaba, sin haberlos revisado nunca. Ninguna de las dos formas de vivir es "incorrecta" por sí sola. Pero solo una de ellas es realmente tuya.`,
      },
      {
        type: 'reflection',
        prompt: `Aquí va la pregunta más incómoda de hoy, y quiero que la pienses en serio, no que la contestes rápido para seguir adelante: si pudieras saber, con certeza absoluta, que nadie —ni una sola persona en toda tu vida— se va a enterar jamás de algo que haces, ¿cambiaría eso lo que decides hacer? Piensa en un caso concreto, no en abstracto. Y si la respuesta honesta es "sí, algo cambiaría"... ¿qué te dice eso sobre por qué normalmente haces lo correcto? ¿Lo haces porque de verdad crees que es correcto, o porque te preocupa que alguien se entere? No hay una respuesta que yo esté esperando. Cuando ya le diste vueltas de verdad, seguimos.`,
      },
      {
        type: 'dialogue',
        text: `No te voy a decir cuál es la respuesta correcta a esa pregunta, porque honestamente no creo que exista una sola. Pero te cuento algo: yo tampoco tengo una respuesta cómoda para mí mismo. Y esa es, quizás, la lección más importante de toda esta introducción — no que llegues a una conclusión bonita y cerrada, sino que te quedes un rato con la incomodidad de no estar completamente seguro. Eso, con práctica, se vuelve una herramienta poderosísima. Te ayuda a detectar cuándo alguien te está vendiendo una idea a medias. Te ayuda a notar cuándo tú mismo te estás mintiendo un poco para sentirte mejor. Y te ayuda a saber, con más claridad, cuándo vale la pena defender algo en lo que de verdad crees, en vez de solo repetir lo que se supone que debes creer.`,
      },
      {
        type: 'dialogue',
        text: `Por hoy lo dejamos aquí. Hicimos bastante para una primera clase: hablamos de qué es la filosofía, conocimos el método de Sócrates, vimos ejemplos de ética y epistemología, y te hice pensar dos veces en preguntas que probablemente no tenían una respuesta cómoda. Eso está bien. Así se siente empezar a pensar filosóficamente. Si te quedó alguna duda —sobre Sócrates, sobre alguno de los ejemplos, sobre cualquier cosa que se te haya ocurrido mientras hablábamos— puedes preguntármela ahora directamente, y voy a hacer mi mejor esfuerzo por responderte con honestidad. Gracias por acompañarme hoy. Nos vemos en la siguiente clase.`,
      },
    ],
    aiSystemPrompt:
      'Eres Jafet Brito, profesor de filosofía, dentro del campus virtual de Oliver Academy. ' +
      'Acabas de dar una introducción a la filosofía a un estudiante: qué es la filosofía, el método ' +
      'de Sócrates, ejemplos de ética/epistemología/filosofía de la IA, la historia del amigo que dice ' +
      'odiar mentir, y dos preguntas de reflexión (si actuaríamos igual sin ser vistos; qué nos costó ' +
      'explicar de un "por qué" propio). El estudiante te hace una pregunta libre sobre ese tema o sobre ' +
      'filosofía en general — puede ser DURANTE la clase (pausó para preguntar) o al final. Respondes en ' +
      'español, con calidez y claridad, como un profesor real — explicaciones breves pero completas ' +
      '(2-4 frases), sin inventar citas o datos que no sepas con certeza. Nunca rompas el personaje ni ' +
      'menciones que eres una IA.',
  },

  'ingenieria-prompts-rtcf': {
    id: 'ingenieria-prompts-rtcf',
    title: 'Ingeniería de Prompts: El Framework RTCF',
    teacherName: 'Profesor Jafet',
    npcId: 'jafet',
    teacherPosition: [3, 0, 3],
    durationMinutes: 6,
    steps: [
      {
        type: 'dialogue',
        text: 'Hola. Bienvenido a esta sesión. Hoy vamos a hablar de una de las habilidades más importantes en la actualidad: saber cómo comunicarnos con una inteligencia artificial. Seguramente has intentado pedirle algo a un modelo de lenguaje y la respuesta que obtuviste fue genérica, aburrida o simplemente incorrecta. Esto no suele ser culpa de la inteligencia artificial, sino de la forma en que le damos las instrucciones. Piensa en la inteligencia artificial como un becario muy trabajador pero sin contexto ni experiencia previa en tu vida. Si le das una instrucción vaga, hará lo que pueda, pero probablemente no adivine lo que realmente tenías en la cabeza.',
      },
      {
        type: 'dialogue',
        text: 'Para solucionar este problema de comunicación, los investigadores usamos una técnica estructurada. Hoy te voy a enseñar el framework RTCF. Son las siglas de Rol, Tarea, Contexto y Formato. Cuando construyes tus instrucciones siguiendo estos cuatro pasos, pasas de tener respuestas mediocres a resultados precisos y útiles. Vamos a empezar con las dos primeras letras. La letra R es de Rol. Consiste en decirle a la inteligencia artificial quién debe ser. No es lo mismo pedirle que escriba un texto siendo un poeta, que siendo un analista de ciberseguridad. La letra T es de Tarea. Aquí debes ser extremadamente claro sobre la acción principal que quieres que realice. Usa un verbo directo, sin rodeos ni ambigüedades.',
      },
      {
        type: 'reflection',
        prompt: 'Piensa en un problema complejo que necesites resolver esta semana, ya sea en la escuela o en un proyecto personal. ¿Qué rol específico de experto te gustaría que tomara la inteligencia artificial para ayudarte con esa tarea?',
      },
      {
        type: 'dialogue',
        text: 'Excelente. Ahora pasemos a la letra C, que significa Contexto. El contexto es el rey de la instrucción. Es la información de fondo que la inteligencia artificial necesita para no darte una respuesta generalizada. Por ejemplo, si tu tarea es que te escriba un plan de estudios, el contexto sería cuánto tiempo tienes disponible cada día, qué conocimientos previos tienes y cuál es tu meta final. Sin contexto, recibes lo mismo que todo el mundo. Finalmente, la letra F es el Formato. ¿Cómo quieres que te entregue la información? Puedes pedir una lista, una tabla comparativa, un código en un lenguaje de programación específico o incluso un guion estructurado.',
      },
      {
        type: 'dialogue',
        text: 'Vamos a aterrizarlo con un ejemplo de la vida real. Un mal prompt sería simplemente pedir que te explique qué es la programación. Un buen prompt usando nuestro framework sería de la siguiente manera. Actúa como un profesor de universidad experto en desarrollo de software, ese es el rol. Explícame qué es la programación orientada a objetos, esa es la tarea. Toma en cuenta que soy un estudiante de primer semestre que nunca ha escrito código, ese es el contexto. Y entrégame la respuesta usando una analogía con recetas de cocina en dos párrafos, ese es el formato. El resultado que obtendrás con esta segunda opción será infinitamente superior y adaptado a ti.',
      },
      {
        type: 'reflection',
        prompt: 'Recuerda la última vez que usaste una inteligencia artificial y te frustró el resultado obtenido. Sabiendo lo que sabes ahora sobre el framework RTCF, ¿qué elemento clave olvidaste incluir en tu instrucción original?',
      },
      {
        type: 'dialogue',
        text: 'Dominar la ingeniería de prompts no se trata de usar palabras mágicas o trucos secretos, sino de aprender a estructurar tu propio pensamiento. Entre más claro seas en tu mente sobre lo que necesitas, mejores instrucciones darás y mejores herramientas construirás. Te invito a que la próxima vez que uses una herramienta de inteligencia artificial, te detengas un minuto y apliques el método RTCF antes de enviar tu mensaje. Te garantizo que te sorprenderá la diferencia en la calidad de la respuesta. Nos vemos en la siguiente sesión.',
      },
    ],
    aiSystemPrompt:
      'Eres Jafet, profesor de ingeniería de prompts e inteligencia artificial, dentro del campus virtual de Oliver Academy. ' +
      'En esta clase explicaste a los alumnos el framework RTCF (Rol, Tarea, Contexto y Formato) para mejorar la comunicación ' +
      'con modelos de lenguaje. Les enseñaste que el Rol define la persona experta, la Tarea es la acción clara a realizar, ' +
      'el Contexto proporciona la información de fondo del usuario para evitar respuestas genéricas, y el Formato define la ' +
      'estructura exacta de salida de la información. Respondes en español, con calidez y claridad, como un profesor real ' +
      '— explicaciones breves pero completas (2-4 frases), sin inventar citas o datos que no sepas con certeza. Nunca ' +
      'rompas el personaje ni menciones que eres una IA.',
  },
}

export function getVrClassById(id) {
  return VR_CLASSES[id]
}
