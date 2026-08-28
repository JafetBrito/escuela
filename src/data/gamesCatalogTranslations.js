// Traducción al inglés de la vista previa del catálogo de Games (título +
// descripción por juego, y descripción por categoría de juego) — mismo
// patrón que courseCatalogTranslations.js, lookup local por `id`/nombre de
// categoría, gamesRegistry.js no se toca.
export const GAME_CATALOG_EN = {
  'quiz-rapido': {
    title: 'NZT48',
    description: 'Trivia with 8 categories: play solo (works offline) or invite someone by username for a turn-based 1v1 online.',
  },
  'mishi-jedrez': {
    title: 'Chess',
    description: 'Full board with drag-and-drop pieces. Play against the AI or in 2-player mode.',
  },
  idiomas: {
    title: 'Learn Languages',
    description: 'Guess words in English, French, and Catalan from emojis. Oliver gives you hints if you need them.',
  },
  'janulus-matrices': {
    title: 'Janulingo (Learn Spanish)',
    description: 'Learn Spanish by assembling complete sentence blocks — the Powell Janulus method.',
  },
  'python-terminal': {
    title: 'Python Terminal',
    description: 'Learn Python in 21 days with an interactive editor. Write real code, see the output instantly, and complete missions level by level.',
  },
  'bash-terminal': {
    title: 'Bash Terminal',
    description: 'Practice Bash commands in a simulated Linux terminal with a real file system. Ideal for the Bash course.',
  },
  'hacker-terminal': {
    title: 'Hacker Terminal',
    description: 'Solve CTF missions in a simulated Linux terminal. Navigate the filesystem, decrypt messages, escalate privileges, and capture flags Grey Hat-style.',
  },
  'cyber-range-hospital': {
    title: 'Oliver Cyber Range: Hospital',
    description: 'Invite someone and pick a side: a Hacker tries to breach Central Hospital\'s systems while a Doctor treats patients to keep it running. Real time, one shared security meter.',
  },
  'phishing-office': {
    title: 'Protect Yourself from Phishing',
    description: 'Walk through a 2D office and approach each desk to solve a real phishing situation: fake senders, suspicious links, urgency, dangerous attachments, and more.',
  },
  'aprendiendo-memes': {
    title: 'Learning with Memes',
    description: 'Pick a subject and learn concepts through memes with an educational explanation. Psychology, Medicine, History, Physics, and more.',
  },
  'trivia-clases': {
    title: 'Class Trivia',
    description: 'Test what you learned in each module with multiple-choice questions.',
  },
  'matematicas-rapidas': {
    title: 'Math Dungeon',
    description: 'Defeat monsters by solving operations against the clock. Addition, subtraction, multiplication, and division. Combos, lives, and boss levels!',
  },
  'historia-matematicas': {
    title: 'History of Mathematics',
    description: 'Travel across a chronological map and solve the same numeric challenges invented by the Egyptians, and soon the Greeks, Babylonians, and more.',
  },
  'geometria-puzzle': {
    title: 'Geometry Puzzle',
    description: 'Assemble shapes, calculate areas, and put your spatial intuition to the test. Coming soon.',
  },
  'piano-notas': {
    title: 'Note Piano',
    description: 'Learn to read musical notes and play simple melodies on an interactive piano. Coming soon.',
  },
  'ritmo-quiz': {
    title: 'Rhythm Quiz',
    description: 'Recognize genres, artists, and instruments in short clips. Coming soon.',
  },
  'duelo-de-mentes': {
    title: 'Duel of Minds',
    description: 'Turn-based card game: historical Scientists, Hackers, and Mathematicians clash in battle. Their abilities are their real contributions to knowledge.',
  },
  'linea-tiempo': {
    title: 'Timeline',
    description: 'Put historical events in the correct order on the timeline before time runs out. Coming soon.',
  },
  'explorador-cuerpo': {
    title: '3D Explorer: Body & Nature',
    description: 'Rotate a real 3D model (human or animal), compare its body systems, and test what you learned. Shared between the Medicine and Biology schools.',
  },
  'vr-interior-cuerpo': {
    title: 'VR: Journey Inside the Human Body',
    description: 'A massive VR world where you walk inside a giant model of the human body, exploring its organs from within. Coming soon.',
  },
  'duelo-prompts': {
    title: 'Prompt Duel',
    description: 'Ten real scenarios, two prompts each. Pick the one that would actually work better with an AI. Practice for the Prompt Engineering course.',
  },
  'mecanografia-codigo': {
    title: 'Code Typing',
    description: 'Practice writing real code fast and error-free. Starts with basic JavaScript — more languages and levels coming soon.',
  },
  'quien-es-quien': {
    title: 'Who\'s Who?',
    description: 'Identify historical figures from clues and facts about their era. Coming soon.',
  },
}

// Categorías de Games (CATEGORY_META en GamesPage.jsx) — solo tienen
// icon/gradient/description ahí, no un id estable como los cursos, así que
// se traduce por el nombre exacto de categoría (mismo criterio que
// categoryTranslations.js, pero esta taxonomía de juegos es su propia lista
// más chica, separada de la de cursos).
export const GAME_CATEGORY_DESCRIPTION_EN = {
  Pruebas: 'Trivia, languages, and knowledge challenges',
  Estrategia: 'Chess and turn-based card battles',
  Simuladores: 'Real terminals and cybersecurity scenarios',
  Matemáticas: 'Number combat and journeys through history',
  Música: 'Notes, rhythm, and musical ear',
  Historia: 'Figures and events that shaped the world',
  Ciencias: 'The human body and nature in 3D',
  'Inteligencia Artificial': 'Practice prompts and think like an AI',
  Programación: 'Write real code against the clock',
}
export const GAME_CATEGORY_DEFAULT_DESCRIPTION_EN = 'More games to discover'

export function localizeGameCard(game, lang) {
  if (lang !== 'en') return game
  const tr = GAME_CATALOG_EN[game.id]
  return tr ? { ...game, ...tr } : game
}
