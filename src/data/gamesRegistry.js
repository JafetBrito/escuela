// Catálogo de Games. Cada juego puede ser:
//   - type: 'embed-url'    -> un enlace externo embebible en <iframe>
//           (p. ej. un juego en itch.io que permita iframes).
//   - type: 'external-url' -> un enlace externo que NO se puede embeber
//           (p. ej. los Artifacts de Claude bloquean el iframe), se abre
//           en una pestaña nueva.
//   - type: 'embed-local'  -> un juego HTML5 propio copiado a
//           public/games/<id>/index.html, "file" apunta a esa ruta.
//   - type: 'component'    -> un minijuego hecho en React (lazy-loaded),
//           "component" indica el import dinámico.
// "reward" son las monedas (cobre) que se entregan una vez al día al
// presionar "Reclamar recompensa" en GamePlayerPage, como premio por jugar.
export const GAMES = [
  {
    id: 'reto-claude',
    title: 'Reto Claude',
    icon: '🎮',
    category: 'Otros',
    description: 'Un minijuego para poner a prueba tus reflejos y tu lógica. ¡Complétalo y reclama tu recompensa!',
    type: 'external-url',
    file: 'https://claude.ai/public/artifacts/8573ca92-7ec5-4c4c-97b1-df8338e591df',
    reward: 5000,
  },
  {
    id: 'quiz-rapido',
    title: 'Quiz Rápido',
    icon: '🧠',
    category: 'Pruebas',
    description: 'Responde preguntas relámpago sobre tus cursos y gana monedas por cada acierto.',
    type: null,
    file: null,
    reward: 0,
  },
  {
    id: 'memoria',
    title: 'Memoria de Conceptos',
    icon: '🃏',
    category: 'Pruebas',
    description: 'Empareja conceptos clave con su definición antes de que se acabe el tiempo.',
    type: null,
    file: null,
    reward: 0,
  },
  {
    id: 'trivia-clases',
    title: 'Trivia por Clase',
    icon: '🎯',
    category: 'Pruebas',
    description: 'Pon a prueba lo que aprendiste en cada módulo con preguntas de opción múltiple.',
    type: null,
    file: null,
    reward: 0,
  },
]

export function getGameById(id) {
  return GAMES.find((g) => g.id === id)
}
