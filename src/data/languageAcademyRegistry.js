import { SUPPORTED_LANGUAGES, LANGUAGE_NAMES } from '../i18n'

// Idiomas que NO tiene sentido "enseñar" como curso — son locales de broma /
// decorativos de la plataforma, no lenguas reales que alguien quiera aprender.
const NOT_TEACHABLE = new Set(['pirata', 'antiguo'])

export const TEACHABLE_LANGUAGES = SUPPORTED_LANGUAGES.filter((l) => !NOT_TEACHABLE.has(l))

// Agrupación para el selector — mismos grupos que ya usa src/i18n/index.js al
// registrar los locales (mundiales / indígenas de México, EE.UU., Canadá).
// Categorizar evita una sola lista plana de 23 idiomas sin distinción.
export const LANGUAGE_GROUPS = [
  { id: 'mundiales', icon: '🌍', langs: ['es', 'en', 'fr', 'it', 'de', 'ja', 'hi', 'zh', 'ca'] },
  { id: 'mexico', icon: '🪶', langs: ['nah', 'yua', 'tzh', 'tzo', 'mix'] },
  { id: 'eeuu', icon: '🪶', langs: ['nv', 'yup', 'dak', 'apa', 'kee'] },
  { id: 'canada', icon: '🪶', langs: ['cr', 'iu', 'oj', 'ojc', 'den'] },
]

// Cómo se llama cada idioma objetivo (L2) EN el idioma de quien lo ve (L1) —
// solo para los dos idiomas de la plataforma con traducción completa hoy
// (es/en); para cualquier otro L1 se usa el nombre nativo del idioma
// (LANGUAGE_NAMES) como fallback razonable, mismo criterio de degradación que
// ya usa el resto del sistema i18n (ver src/i18n/index.js).
const EXONYMS = {
  es: {
    en: 'Inglés', fr: 'Francés', it: 'Italiano', zh: 'Chino Mandarín', ca: 'Catalán',
    de: 'Alemán', ja: 'Japonés', hi: 'Hindi',
    nah: 'Náhuatl', yua: 'Maya', tzh: 'Tseltal', tzo: 'Tsotsil', mix: 'Mixteco',
    nv: 'Navajo', yup: "Yup'ik", dak: 'Dakota', apa: 'Apache', kee: 'Keres',
    cr: 'Cree', iu: 'Inuktitut', oj: 'Ojibwe', ojc: 'Oji-Cree', den: 'Dené',
  },
  en: {
    es: 'Spanish', fr: 'French', it: 'Italian', zh: 'Mandarin Chinese', ca: 'Catalan',
    de: 'German', ja: 'Japanese', hi: 'Hindi',
    nah: 'Nahuatl', yua: 'Yucatec Maya', tzh: 'Tseltal', tzo: 'Tsotsil', mix: 'Mixtec',
    nv: 'Navajo', yup: "Yup'ik", dak: 'Dakota', apa: 'Apache', kee: 'Keres',
    cr: 'Cree', iu: 'Inuktitut', oj: 'Ojibwe', ojc: 'Oji-Cree', den: 'Dené',
  },
}

function targetLanguageName(l1, l2) {
  return EXONYMS[l1]?.[l2] ?? LANGUAGE_NAMES[l2] ?? l2
}

// Marco CEFR — es el estándar real que usan casi todas las academias de
// idiomas, y sus descriptores de nivel son genéricos por diseño (aplican a
// cualquier idioma objetivo). Se usan tal cual para las ~24 lenguas
// enseñables en vez de escribir currícula específica por cada una — ver nota
// en la memoria del proyecto sobre el alcance de "solo la info, no el curso".
export const CEFR_LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2']

// Ítems ligeros para el selector visual, agrupados por categoría — nada de
// "temario" todavía (eso es getLanguageSyllabus, para la página de detalle).
export function getTeachableLanguageGroups(l1, t) {
  return LANGUAGE_GROUPS
    .map((group) => ({
      id: group.id,
      icon: group.icon,
      label: t(`languageAcademy.groups.${group.id}`),
      languages: group.langs
        .filter((l2) => l2 !== l1 && TEACHABLE_LANGUAGES.includes(l2))
        .map((l2) => ({ l2, name: targetLanguageName(l1, l2) })),
    }))
    .filter((group) => group.languages.length > 0)
}

// Temario completo de un idioma objetivo (para /escuela/idiomas/:l2): un
// nivel A1-C2 con el nombre del idioma ya interpolado en su descripción.
export function getLanguageSyllabus(l1, l2, t) {
  const l2Name = targetLanguageName(l1, l2)
  const l1Name = LANGUAGE_NAMES[l1] ?? l1
  return {
    l1, l2, l1Name, l2Name,
    levels: CEFR_LEVELS.map((level) => ({
      id: level,
      title: t(`languageAcademy.levels.${level}.title`),
      description: t(`languageAcademy.levels.${level}.description`, { lang: l2Name }),
    })),
  }
}
