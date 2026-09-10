// Registro de discursos programados para NPCs del Campus VR — hoy solo
// Oliver, pero la forma ya sirve para los NPCs-maestro de la fase siguiente
// (clases completas, preparadas de antemano) sin rediseñar nada: solo se
// agrega una entrada más con su propio npcId/hora/guion.
//
// `npcId` debe existir en vrNpcRegistry.js (posición, mascota, color de
// burbuja). `targetUtcHour` asume Ciudad de México fijo en UTC-6 (México
// abolió el horario de verano en la mayor parte del país) — un solo número
// fácil de ajustar si la audiencia real está en otra zona horaria.
export const NPC_SPEECHES = {
  oliver: {
    npcId: 'oliver',
    targetUtcHour: 2, // 20:00 hora de Ciudad de México = 02:00 UTC
    script: `¡Hola a todos! Soy Oliver 🐾, y si me están escuchando ahora mismo, felicidades: acaban de presenciar el primer discurso oficial de un gato virtual en la historia de esta escuela. Tómense un segundo para sentirse afortunados.

Bienvenidos, o bienvenidos de nuevo, al campus. Sé que para algunos este es su primer día explorando este mundo, y para otros ya llevan tiempo caminando por aquí, completando misiones, chateando con sus compañeros, y —espero— evitando pisarme la cola cuando corren de un lado a otro.

Quiero aprovechar estos minutos para contarles algo que me parece importante: esta escuela no es un lugar que simplemente "existe" mientras alguien la mira. La idea es que esté viva todo el tiempo, incluso cuando ustedes no están conectados. Que cuando entren, encuentren algo pasando. Un discurso, una clase, una conversación, un evento. Que esto se sienta menos como visitar una página web, y más como llegar a un lugar real donde suceden cosas.

Este discurso que estoy dando ahora mismo, todos los días a la misma hora, es en realidad una prueba. Estamos probando cómo hacer que un personaje como yo pueda aparecer, hablar, y que todos ustedes —los que estén aquí en este momento— me escuchen al mismo tiempo, en la plaza, como si fuera una asamblea de verdad. Y si esto funciona bien, el siguiente paso es aún más ambicioso: vamos a hacer que los maestros —sí, NPCs con clases completas, preparadas de antemano— puedan aparecer en sus propios salones, en sus propios horarios, y dar clases reales que ustedes puedan caminar hasta ahí y simplemente... escuchar. Como llegar tarde a una clase presencial, pero sin la pena de que el profesor te vea entrar.

Mientras tanto, aquí estoy yo, el gato de prueba. El conejillo de indias con bigotes, digamos.

Ahora, dejando la parte técnica de lado, quiero recordarles algunas cosas, porque para eso me pagan. Bueno, no me pagan, soy virtual, pero ustedes entienden.

Primero: no tengan miedo de explorar. El campus tiene rincones que muchos todavía no han visitado. Hay un árbol, hay una biblioteca, hay un anfiteatro donde a veces pasan cosas interesantes. Caminen, no se queden parados en la plaza todo el día... aunque, bueno, ahora mismo sí, porque me están escuchando a mí. Pero después, ¡exploren!

Segundo: las misiones diarias existen por una razón. No es solo por las monedas, aunque las monedas ayudan, y créanme, sé lo que es querer ahorrar para algo bonito. Es porque cada pequeña tarea que completan los mantiene en movimiento, aprendiendo, avanzando. Un paso a la vez. Como dicen por ahí: la práctica hace al maestro. Y como digo yo: la práctica también hace que este gato deje de ronronear tan fuerte cada vez que alguien completa una clase.

Tercero, y esto es importante: hablen entre ustedes. Esta escuela no tiene sentido si cada quien camina solo por su lado. Usen el chat, hagan preguntas, ayuden a alguien que está atorado en una clase. La comunidad es, honestamente, la mejor parte de todo esto. Mejor que yo, incluso, y eso que soy bastante encantador si me lo preguntan.

Y cuarto: si algo no funciona, si encuentran un error, un bug, algo raro — díganlo. Esta escuela se está construyendo en tiempo real, todos los días, con nuevas ideas como esta que están viviendo ahora mismo. Ustedes no son solo estudiantes, son parte de cómo esto se va formando.

Bueno, creo que ya hablé suficiente por un gato. Mis patas ya se están cansando de estar de pie, y en algún momento del día tengo que tomar mi siesta número catorce.

Antes de irme: gracias por estar aquí, por quedarse a escuchar todo esto en lugar de simplemente caminar de largo. Eso dice algo bueno de ustedes. Nos vemos mañana, a la misma hora, en la misma plaza. Y si todo sale bien, pronto no seré solo yo el que dé discursos por aquí.

Que tengan un excelente resto del día. Sigan aprendiendo, sigan explorando, y recuerden: si su código no compila, siempre pueden explicármelo a mí. Sigo siendo un excelente gato de goma.

Nos vemos pronto. Soy Oliver, y esto ha sido... la escuela, en vivo. 🐾`,
  },
}
