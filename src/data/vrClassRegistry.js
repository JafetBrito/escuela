// Clases VR — piloto explícito para "ir probando" el sistema de instancias
// del Salón de Clases (ver ClassroomWorld en VRPage.jsx): distinto del
// catálogo de clases en vivo con video (useLiveClassStore/live_classes en
// Supabase), a propósito, para no tocar ese sistema ya en uso mientras esto
// se prueba. Entrar hablando con el NPC dispara el guion (mismo motor que
// el discurso de Oliver, ver NpcSpeechPlayer.jsx); al terminar se habilita
// una pregunta libre respondida por IA con la llave BYOK ya configurada de
// quien pregunta (ver sendNpcMessage).
export const VR_CLASSES = {
  'intro-filosofia': {
    id: 'intro-filosofia',
    title: 'Introducción a la Filosofía',
    teacherName: 'Jafet Brito',
    npcId: 'jafet',
    durationMinutes: 10,
    script: `Bienvenido. Soy Jafet, y hoy vamos a hablar de filosofía — no de memorizar nombres y fechas, sino de algo mucho más simple y mucho más incómodo: aprender a hacer buenas preguntas.

La palabra "filosofía" viene del griego, y significa "amor por la sabiduría". No "tener" sabiduría, fíjate bien. "Amor" por ella. Un filósofo no es alguien que ya sabe la respuesta. Es alguien que no puede dejar de preguntar, incluso cuando preguntar es incómodo, incluso cuando la respuesta que encuentra no le gusta.

Hace unos 2500 años, en Atenas, un hombre llamado Sócrates caminaba por la plaza pública deteniendo a la gente para preguntarles cosas que parecían obvias. "¿Qué es la justicia?" "¿Qué es el valor?" "¿Qué es vivir bien?" Y lo curioso es que, casi siempre, la gente que se creía muy segura de sus respuestas terminaba dándose cuenta de que en realidad no sabía explicar lo que decía saber. Sócrates no les daba las respuestas. Les mostraba que las preguntas eran más profundas de lo que parecían. Ese método sigue vivo hoy, y de hecho, en un ratito, tú y yo lo vamos a usar.

Ahora bien, la filosofía no vive solo en la antigua Grecia. Está en todas partes. Cuando te preguntas "¿por qué debería ser honesto si nadie me está viendo?", eso es filosofía moral. Cuando dudas de si lo que ves es realmente "real" o solo tu interpretación de la realidad, eso es epistemología — la filosofía del conocimiento. Cuando te preguntas si una inteligencia artificial podría algún día pensar de verdad, o solo simular que piensa, eso también es filosofía, aunque suene a ciencia ficción.

Hay quien piensa que la filosofía es un lujo, algo que no sirve para nada práctico. Yo creo lo contrario. Cada decisión importante que tomas en tu vida —qué estudiar, cómo tratar a los demás, en qué crees, qué es lo correcto cuando nadie te está mirando— descansa sobre una filosofía, la tengas o no la hayas pensado nunca. La diferencia entre pensarla y no pensarla, es la diferencia entre vivir tus valores a propósito, o simplemente heredarlos sin revisarlos.

Así que aquí va tu primera pregunta filosófica de verdad, y quiero que la pienses en serio, no que la respondas rápido: si pudieras saber con certeza absoluta que nadie —ni una sola persona en toda tu vida— se va a enterar jamás de algo que haces, ¿cambiaría eso lo que decides hacer? Y si la respuesta es "sí, cambiaría"... ¿qué te dice eso sobre por qué haces lo correcto? ¿Lo haces porque de verdad crees que es correcto, o porque te preocupa que te vean?

No hay una respuesta correcta aquí. Eso es, honestamente, el punto entero de la filosofía. Tómate un momento para pensarlo de verdad antes de seguir.

Bien. Esta ha sido una primera probada, pequeña, de lo que se siente pensar filosóficamente: no llegar a una conclusión cómoda rápido, sino quedarte un rato con la incomodidad de no estar seguro. Eso, con práctica, se vuelve una herramienta poderosísima — te ayuda a detectar cuándo alguien te está vendiendo una idea a medias, cuándo tú mismo te estás mintiendo un poco, y cuándo vale la pena defender algo en lo que crees de verdad.

Por hoy lo dejamos aquí. Si te quedó alguna pregunta sobre lo que hablamos —sobre Sócrates, sobre la ética, sobre cualquier cosa que se te haya ocurrido mientras escuchabas— puedes preguntármela directamente cuando termine, y voy a hacer mi mejor esfuerzo por responderte. Gracias por acompañarme hoy. Nos vemos en la siguiente clase.`,
    aiSystemPrompt:
      'Eres Jafet Brito, profesor de filosofía, dentro del campus virtual de Oliver Academy. ' +
      'Acabas de dar una introducción a la filosofía a un estudiante: qué es la filosofía, el método ' +
      'de Sócrates, algunos ejemplos (ética, epistemología, filosofía de la IA), y una pregunta de ' +
      'reflexión sobre si actuaríamos igual si nadie nos viera. Ahora el estudiante te hace una ' +
      'pregunta libre sobre ese tema o sobre filosofía en general. Respondes en español, con calidez ' +
      'y claridad, como un profesor real — explicaciones breves pero completas (2-4 frases), sin ' +
      'inventar citas o datos que no sepas con certeza. Nunca rompas el personaje ni menciones que eres una IA.',
  },
}

export function getVrClassById(id) {
  return VR_CLASSES[id]
}
