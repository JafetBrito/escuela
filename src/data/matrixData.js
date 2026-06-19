// ─── Janulus Matrix Game — Dictionary ─────────────────────────────────────
// Each sentence = Base + Verb + Vocab (always this order).
// Verbs now have `emoji` for visual representation in learn phase.
// Vocab items have `keyword` = the word the user must type (stripped of articles).
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
          { id: 'v1', text: 'find',  emoji: '🔍' },
          { id: 'v2', text: 'use',   emoji: '🔧' },
          { id: 'v3', text: 'carry', emoji: '💪' },
          { id: 'v4', text: 'open',  emoji: '🚪' },
          { id: 'v5', text: 'see',   emoji: '👁️' },
          { id: 'v6', text: 'hold',  emoji: '✋' },
        ],
        vocab: [
          { id: 'w1',  text: 'a key',      emoji: '🗝️', keyword: 'key' },
          { id: 'w2',  text: 'an apple',   emoji: '🍎', keyword: 'apple' },
          { id: 'w3',  text: 'some water', emoji: '💧', keyword: 'water' },
          { id: 'w4',  text: 'a candle',   emoji: '🕯️', keyword: 'candle' },
          { id: 'w5',  text: 'a mirror',   emoji: '🪞', keyword: 'mirror' },
          { id: 'w6',  text: 'a bell',     emoji: '🔔', keyword: 'bell' },
          { id: 'w7',  text: 'a compass',  emoji: '🧭', keyword: 'compass' },
          { id: 'w8',  text: 'a ladder',   emoji: '🪜', keyword: 'ladder' },
          { id: 'w9',  text: 'a bucket',   emoji: '🪣', keyword: 'bucket' },
          { id: 'w10', text: 'a book',     emoji: '📖', keyword: 'book' },
          { id: 'w11', text: 'a map',      emoji: '🗺️', keyword: 'map' },
          { id: 'w12', text: 'a torch',    emoji: '🔦', keyword: 'torch' },
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
          { id: 'v1', text: 'understand', emoji: '🤔' },
          { id: 'v2', text: 'remember',   emoji: '🧠' },
          { id: 'v3', text: 'improve',    emoji: '📈' },
          { id: 'v4', text: 'practice',   emoji: '🎯' },
          { id: 'v5', text: 'discover',   emoji: '🗺️' },
          { id: 'v6', text: 'appreciate', emoji: '💛' },
          { id: 'v7', text: 'explore',    emoji: '🌿' },
        ],
        vocab: [
          { id: 'w1', text: 'the language',     emoji: '🌐', keyword: 'language' },
          { id: 'w2', text: 'the culture',       emoji: '🎭', keyword: 'culture' },
          { id: 'w3', text: 'the vocabulary',    emoji: '📚', keyword: 'vocabulary' },
          { id: 'w4', text: 'the pronunciation', emoji: '🗣️', keyword: 'pronunciation' },
          { id: 'w5', text: 'the grammar',       emoji: '✏️', keyword: 'grammar' },
          { id: 'w6', text: 'the traditions',    emoji: '🏺', keyword: 'traditions' },
          { id: 'w7', text: 'the history',       emoji: '📜', keyword: 'history' },
          { id: 'w8', text: 'new skills',        emoji: '💡', keyword: 'skills' },
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
          { id: 'v1', text: 'trouver',  emoji: '🔍' },
          { id: 'v2', text: 'utiliser', emoji: '🔧' },
          { id: 'v3', text: 'porter',   emoji: '💪' },
          { id: 'v4', text: 'ouvrir',   emoji: '🚪' },
          { id: 'v5', text: 'voir',     emoji: '👁️' },
        ],
        vocab: [
          { id: 'w1', text: 'une clé',      emoji: '🗝️', keyword: 'clé' },
          { id: 'w2', text: 'une pomme',    emoji: '🍎', keyword: 'pomme' },
          { id: 'w3', text: "de l'eau",     emoji: '💧', keyword: 'eau' },
          { id: 'w4', text: 'une bougie',   emoji: '🕯️', keyword: 'bougie' },
          { id: 'w5', text: 'un miroir',    emoji: '🪞', keyword: 'miroir' },
          { id: 'w6', text: 'une cloche',   emoji: '🔔', keyword: 'cloche' },
          { id: 'w7', text: 'une boussole', emoji: '🧭', keyword: 'boussole' },
          { id: 'w8', text: 'un livre',     emoji: '📖', keyword: 'livre' },
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
          { id: 'v1', text: 'trobar',    emoji: '🔍' },
          { id: 'v2', text: 'fer servir', emoji: '🔧' },
          { id: 'v3', text: 'portar',    emoji: '💪' },
          { id: 'v4', text: 'obrir',     emoji: '🚪' },
          { id: 'v5', text: 'veure',     emoji: '👁️' },
        ],
        vocab: [
          { id: 'w1', text: 'una clau',     emoji: '🗝️', keyword: 'clau' },
          { id: 'w2', text: 'una poma',     emoji: '🍎', keyword: 'poma' },
          { id: 'w3', text: 'aigua',        emoji: '💧', keyword: 'aigua' },
          { id: 'w4', text: 'una espelma',  emoji: '🕯️', keyword: 'espelma' },
          { id: 'w5', text: 'un mirall',    emoji: '🪞', keyword: 'mirall' },
          { id: 'w6', text: 'una campana',  emoji: '🔔', keyword: 'campana' },
          { id: 'w7', text: 'una brúixola', emoji: '🧭', keyword: 'brúixola' },
          { id: 'w8', text: 'un llibre',    emoji: '📖', keyword: 'llibre' },
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
