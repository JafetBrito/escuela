// Discurso de cumpleaños de Oliver — "Las Mañanitas" (canción tradicional
// mexicana de dominio público) + felicitación personalizada. Se dispara UNA
// vez, por fuera de NPC_SPEECHES (ese registro se recorre entero cada
// TEST_INTERVAL_MINUTES por useNpcSpeechScheduler.js — meterlo ahí lo
// pondría a sonar para todos cada pocos minutos en vez de solo el día que
// corresponde). Reusa el mismo broadcast/self-echo que /discurso.
export const BIRTHDAY_NPC_ID = 'oliver'

export function buildBirthdaySpeech(name) {
  const displayName = name?.trim() || 'nuestro querido estudiante'
  return `¡Hoy es un día muy especial en el campus! 🎉 Es el cumpleaños de ${displayName}, ¡así que hagamos ruido!

Estas mañanitas te venimos a cantar, a Oliver el gato, y a toda la academia. Despierta, ${displayName}, despierta, mira que ya amaneció, ya los pajaritos cantan, la luna ya se metió.

Qué linda está la mañana en que vengo a saludarte, venimos todos con gusto y placer a felicitarte. El día en que tú naciste, nacieron todas las flores, y en la pila del bautismo cantaron los ruiseñores.

Ya viene amaneciendo, ya la luz del día nos dio, levántate de mañana, mira que ya amaneció.

De parte de todos en el campus — Jafet, Einstein, el mercader Korin, y cada estudiante que hoy camina por esta plaza — ¡muchas felicidades, ${displayName}! Que este nuevo año te traiga muchísimo aprendizaje, buenas notas, mejores amigos, y por supuesto, muchas croquetas para celebrar.

Revisa tu regalo de cumpleaños, ¡te está esperando! Y ahora sí… ¡que empiece la fiesta! 🎂🎈`
}
