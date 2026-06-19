// ─── Emoji Language Game — Dictionary ─────────────────────────────────────
// Structure: { [langCode]: { name, flag, speechLang, levels: { [n]: { name, words[] } } } }
// To add a new language: add a new top-level key.
// To add a new level: add a new key under that language's `levels`.
// Words: { emoji, word, hint } — word must be lowercase for comparison.

export const EMOJI_LANGUAGE_DATA = {
  en: {
    name: 'English',
    flag: '🇬🇧',
    speechLang: 'en-US',
    levels: {
      1: {
        name: 'Everyday Objects',
        words: [
          { emoji: '🗝️', word: 'key',       hint: 'It opens a lock.' },
          { emoji: '🕯️', word: 'candle',    hint: 'It gives light when it burns.' },
          { emoji: '🪞',  word: 'mirror',    hint: 'You see your reflection in it.' },
          { emoji: '🧲',  word: 'magnet',    hint: 'It attracts metal objects.' },
          { emoji: '🪣',  word: 'bucket',    hint: 'You carry water in it.' },
          { emoji: '🔔',  word: 'bell',      hint: 'It makes a ringing sound.' },
          { emoji: '🧭',  word: 'compass',   hint: 'It always points north.' },
          { emoji: '🪜',  word: 'ladder',    hint: 'You climb it to reach higher places.' },
          { emoji: '🧶',  word: 'yarn',      hint: 'Soft thread used for knitting.' },
          { emoji: '🏺',  word: 'vase',      hint: 'A container for flowers.' },
        ],
      },
      2: {
        name: 'Nature',
        words: [
          { emoji: '🌋', word: 'volcano',   hint: 'A mountain that can erupt with lava.' },
          { emoji: '🌊', word: 'wave',      hint: 'Water in motion on the sea.' },
          { emoji: '🌿', word: 'herb',      hint: 'A small plant used in cooking.' },
          { emoji: '🍄', word: 'mushroom',  hint: 'A fungus that grows in forests.' },
          { emoji: '🦋', word: 'butterfly', hint: 'An insect with colorful wings.' },
          { emoji: '🌵', word: 'cactus',    hint: 'A desert plant with sharp spines.' },
          { emoji: '🪸', word: 'coral',     hint: 'A sea creature that forms reefs.' },
          { emoji: '🍃', word: 'leaf',      hint: 'The flat green part of a plant.' },
        ],
      },
    },
  },

  fr: {
    name: 'Français',
    flag: '🇫🇷',
    speechLang: 'fr-FR',
    levels: {
      1: {
        name: 'Objets du quotidien',
        words: [
          { emoji: '🗝️', word: 'clé',       hint: 'Elle ouvre une serrure.' },
          { emoji: '🕯️', word: 'bougie',    hint: 'Elle donne de la lumière en brûlant.' },
          { emoji: '🔔',  word: 'cloche',    hint: 'Elle émet un son métallique.' },
          { emoji: '🪞',  word: 'miroir',    hint: 'Tu vois ton reflet dedans.' },
          { emoji: '🧲',  word: 'aimant',    hint: 'Il attire les objets en métal.' },
        ],
      },
    },
  },

  ca: {
    name: 'Català',
    flag: '🏴',
    speechLang: 'ca-ES',
    levels: {
      1: {
        name: 'Objectes quotidians',
        words: [
          { emoji: '🗝️', word: 'clau',      hint: 'Obre un pany.' },
          { emoji: '🕯️', word: 'espelma',   hint: 'Fa llum quan crema.' },
          { emoji: '🔔',  word: 'campana',   hint: 'Fa un so metàl·lic.' },
          { emoji: '🪞',  word: 'mirall',    hint: 'Hi veus el teu reflex.' },
          { emoji: '🧲',  word: 'imant',     hint: "Atrau objectes de metall." },
        ],
      },
    },
  },
}

export function getLanguages() {
  return Object.entries(EMOJI_LANGUAGE_DATA).map(([code, lang]) => ({
    code,
    name: lang.name,
    flag: lang.flag,
  }))
}

export function getLevels(langCode) {
  const lang = EMOJI_LANGUAGE_DATA[langCode]
  if (!lang) return []
  return Object.entries(lang.levels).map(([n, lvl]) => ({
    number: Number(n),
    name: lvl.name,
  }))
}

export function getWords(langCode, levelNumber) {
  return EMOJI_LANGUAGE_DATA[langCode]?.levels[levelNumber]?.words ?? []
}

export function getSpeechLang(langCode) {
  return EMOJI_LANGUAGE_DATA[langCode]?.speechLang ?? 'en-US'
}
