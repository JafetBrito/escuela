// Aggregates per-language overlays for the Segundo Cerebro glossary. Spanish
// (glossaryRegistry.js) stays the single source of truth; these files only
// override term/summary/content per slug per language. Missing slug or
// missing language -> falls back to the Spanish entry untouched.
import { en } from './en'
import { fr } from './fr'
import { it } from './it'
import { zh } from './zh'
import { nah } from './nah'

const TRANSLATIONS = { en, fr, it, zh, nah }

const CATEGORY_LABELS = {
  en: { Historia: 'History', Medicina: 'Medicine', 'Prompt Engineering': 'Prompt Engineering', Ética: 'Ethics', Mujeres: 'Women' },
  fr: { Historia: 'Histoire', Medicina: 'Médecine', 'Prompt Engineering': 'Prompt Engineering', Ética: 'Éthique', Mujeres: 'Femmes' },
  it: { Historia: 'Storia', Medicina: 'Medicina', 'Prompt Engineering': 'Prompt Engineering', Ética: 'Etica', Mujeres: 'Donne' },
  zh: { Historia: '历史', Medicina: '医学', 'Prompt Engineering': '提示工程', Ética: '伦理学', Mujeres: '女性' },
  nah: { Historia: 'Ilhuitlahtolli', Medicina: 'Pahtiliztli', 'Prompt Engineering': 'Prompt Engineering', Ética: 'Yectlahtoliztli', Mujeres: 'Cihuameh' },
}

export function getLocalizedEntry(entry, lang) {
  const tr = TRANSLATIONS[lang]?.[entry.slug]
  if (!tr) return entry
  return {
    ...entry,
    term: tr.term ?? entry.term,
    summary: tr.summary ?? entry.summary,
    content: tr.content ?? entry.content,
  }
}

export function getLocalizedCategory(category, lang) {
  return CATEGORY_LABELS[lang]?.[category] ?? category
}
