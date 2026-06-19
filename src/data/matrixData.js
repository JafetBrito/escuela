// ─── Janulus Matrix Game — Dictionary ─────────────────────────────────────
// Each sentence = Base + Verb + Vocab (always this order).
// L1: emojis on vocab, short bases, click-to-build.
// L2: longer bases, abstract vocab, still emojis.
// To add a language: add a new top-level key.
// To add a level: push to that language's `levels` array.

export const JANULUS_DATA = {
  en: {
    name: 'English',
    flag: '🇬🇧',
    speechLang: 'en-US',
    levels: [
      {
        level: 1,
        name: 'First Blocks',
        bases: [
          { id: 'b1', text: 'I want to' },
          { id: 'b2', text: 'I need to' },
          { id: 'b3', text: 'I like to' },
          { id: 'b4', text: 'I have to' },
          { id: 'b5', text: 'I can' },
        ],
        verbs: [
          { id: 'v1', text: 'find' },
          { id: 'v2', text: 'use' },
          { id: 'v3', text: 'carry' },
          { id: 'v4', text: 'open' },
          { id: 'v5', text: 'see' },
          { id: 'v6', text: 'hold' },
        ],
        vocab: [
          { id: 'w1',  text: 'a key',      emoji: '🗝️' },
          { id: 'w2',  text: 'an apple',   emoji: '🍎' },
          { id: 'w3',  text: 'some water', emoji: '💧' },
          { id: 'w4',  text: 'a candle',   emoji: '🕯️' },
          { id: 'w5',  text: 'a mirror',   emoji: '🪞' },
          { id: 'w6',  text: 'a bell',     emoji: '🔔' },
          { id: 'w7',  text: 'a compass',  emoji: '🧭' },
          { id: 'w8',  text: 'a ladder',   emoji: '🪜' },
          { id: 'w9',  text: 'a bucket',   emoji: '🪣' },
          { id: 'w10', text: 'a book',     emoji: '📖' },
          { id: 'w11', text: 'a map',      emoji: '🗺️' },
          { id: 'w12', text: 'a torch',    emoji: '🔦' },
        ],
      },
      {
        level: 2,
        name: 'In Context',
        bases: [
          { id: 'b1', text: "I'd like to" },
          { id: 'b2', text: "I'm trying to" },
          { id: 'b3', text: 'It is important to' },
          { id: 'b4', text: "I'm learning how to" },
          { id: 'b5', text: 'We need to' },
          { id: 'b6', text: "I'm going to" },
        ],
        verbs: [
          { id: 'v1', text: 'understand' },
          { id: 'v2', text: 'remember' },
          { id: 'v3', text: 'improve' },
          { id: 'v4', text: 'practice' },
          { id: 'v5', text: 'discover' },
          { id: 'v6', text: 'appreciate' },
          { id: 'v7', text: 'explore' },
        ],
        vocab: [
          { id: 'w1', text: 'the language',      emoji: '🌐' },
          { id: 'w2', text: 'the culture',        emoji: '🎭' },
          { id: 'w3', text: 'the vocabulary',     emoji: '📚' },
          { id: 'w4', text: 'the pronunciation',  emoji: '🗣️' },
          { id: 'w5', text: 'the grammar',        emoji: '✏️' },
          { id: 'w6', text: 'the traditions',     emoji: '🏺' },
          { id: 'w7', text: 'the history',        emoji: '📜' },
          { id: 'w8', text: 'new skills',         emoji: '💡' },
        ],
      },
    ],
  },

  fr: {
    name: 'Français',
    flag: '🇫🇷',
    speechLang: 'fr-FR',
    levels: [
      {
        level: 1,
        name: 'Blocs de base',
        bases: [
          { id: 'b1', text: 'Je veux' },
          { id: 'b2', text: 'Je dois' },
          { id: 'b3', text: "J'aime" },
          { id: 'b4', text: 'Je peux' },
          { id: 'b5', text: 'Je vais' },
        ],
        verbs: [
          { id: 'v1', text: 'trouver' },
          { id: 'v2', text: 'utiliser' },
          { id: 'v3', text: 'porter' },
          { id: 'v4', text: 'ouvrir' },
          { id: 'v5', text: 'voir' },
        ],
        vocab: [
          { id: 'w1', text: 'une clé',      emoji: '🗝️' },
          { id: 'w2', text: 'une pomme',    emoji: '🍎' },
          { id: 'w3', text: "de l'eau",     emoji: '💧' },
          { id: 'w4', text: 'une bougie',   emoji: '🕯️' },
          { id: 'w5', text: 'un miroir',    emoji: '🪞' },
          { id: 'w6', text: 'une cloche',   emoji: '🔔' },
          { id: 'w7', text: 'une boussole', emoji: '🧭' },
          { id: 'w8', text: 'un livre',     emoji: '📖' },
        ],
      },
    ],
  },

  ca: {
    name: 'Català',
    flag: '🏴',
    speechLang: 'ca-ES',
    levels: [
      {
        level: 1,
        name: 'Blocs bàsics',
        bases: [
          { id: 'b1', text: 'Vull' },
          { id: 'b2', text: 'Necessito' },
          { id: 'b3', text: "M'agrada" },
          { id: 'b4', text: 'Puc' },
          { id: 'b5', text: 'Vaig a' },
        ],
        verbs: [
          { id: 'v1', text: 'trobar' },
          { id: 'v2', text: 'fer servir' },
          { id: 'v3', text: 'portar' },
          { id: 'v4', text: 'obrir' },
          { id: 'v5', text: 'veure' },
        ],
        vocab: [
          { id: 'w1', text: 'una clau',   emoji: '🗝️' },
          { id: 'w2', text: 'una poma',   emoji: '🍎' },
          { id: 'w3', text: 'aigua',      emoji: '💧' },
          { id: 'w4', text: 'una espelma', emoji: '🕯️' },
          { id: 'w5', text: 'un mirall',  emoji: '🪞' },
          { id: 'w6', text: 'una campana', emoji: '🔔' },
          { id: 'w7', text: 'una brúixola', emoji: '🧭' },
          { id: 'w8', text: 'un llibre',  emoji: '📖' },
        ],
      },
    ],
  },
}

export function getJanulusLanguages() {
  return Object.entries(JANULUS_DATA).map(([code, l]) => ({
    code, name: l.name, flag: l.flag,
  }))
}

export function getJanulusLevels(langCode) {
  return (JANULUS_DATA[langCode]?.levels ?? []).map((l) => ({
    level: l.level, name: l.name,
  }))
}

export function getJanulusLevel(langCode, levelNum) {
  return JANULUS_DATA[langCode]?.levels.find((l) => l.level === levelNum) ?? null
}

export function getSpeechLangJanulus(langCode) {
  return JANULUS_DATA[langCode]?.speechLang ?? 'en-US'
}
