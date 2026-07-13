// Sistema de idiomas. Patrón tomado de world-of-claudecraft (src/ui/i18n.ts),
// portado a JS plano + zustand y recortado a lo esencial: sin carga lazy por
// chunks, sin pseudo-locales ni release-gates (eran optimizaciones de un juego
// con 21 locales). Aquí un locale = un archivo de datos en ./locales, y agregar
// un idioma = agregar un archivo + registrarlo en LOCALES.
//
// La escuela está escrita en español, así que `es` es la base y el fallback
// universal: cualquier clave sin traducir cae a español antes que a la clave
// cruda. La detección sigue el mismo orden que el original: ?lang= → preferencia
// guardada → idioma del navegador → base.
import { create } from 'zustand'
import { es } from './locales/es'
import { en } from './locales/en'
import { fr } from './locales/fr'
import { it } from './locales/it'
import { zh } from './locales/zh'
import { ca } from './locales/ca'
import { de } from './locales/de'
import { ja } from './locales/ja'
import { hi } from './locales/hi'
import { pirata } from './locales/pirata'
// Lenguas indígenas de México (las 5 más habladas según el censo INEGI 2020)
import { nah } from './locales/nah'
import { yua } from './locales/yua'
import { tzh } from './locales/tzh'
import { tzo } from './locales/tzo'
import { mix } from './locales/mix'
// Lenguas indígenas de EE.UU. (las 5 más habladas según datos del ACS/Census)
import { nv } from './locales/nv'
import { yup } from './locales/yup'
import { dak } from './locales/dak'
import { apa } from './locales/apa'
import { kee } from './locales/kee'
// Lenguas indígenas de Canadá (las 5 más habladas según Statistics Canada)
import { cr } from './locales/cr'
import { iu } from './locales/iu'
import { oj } from './locales/oj'
import { ojc } from './locales/ojc'
import { den } from './locales/den'
import { antiguo } from './locales/antiguo'

const LOCALES = {
  es, en, fr, it, zh, ca, de, ja, hi, pirata,
  nah, yua, tzh, tzo, mix,
  nv, yup, dak, apa, kee,
  cr, iu, oj, ojc, den,
  antiguo,
}
const BASE = 'es'

export const SUPPORTED_LANGUAGES = Object.keys(LOCALES)

export const LANGUAGE_NAMES = {
  es: 'Español', en: 'English', fr: 'Français', it: 'Italiano', zh: '中文', ca: 'Català',
  de: 'Deutsch', ja: '日本語', hi: 'हिन्दी', pirata: '🏴‍☠️ Pirata',
  nah: 'Náhuatl', yua: 'Maayaʼ tʼaan', tzh: 'Bats\'il K\'op (Tseltal)', tzo: 'Bats\'i K\'op (Tsotsil)', mix: 'Tu\'un Savi (Mixteco)',
  nv: 'Diné Bizaad (Navajo)', yup: 'Yugtun (Yup\'ik)', dak: 'Dakȟótiyapi (Dakota)', apa: 'Apache', kee: 'Keres',
  cr: 'Nēhiyawēwin (Cree)', iu: 'Inuktitut', oj: 'Anishinaabemowin (Ojibwe)', ojc: 'Oji-Cree', den: 'Dené',
  antiguo: '📜 Castellano Antiguo',
}

function isSupported(lang) {
  return Object.prototype.hasOwnProperty.call(LOCALES, lang)
}

function detectLanguage() {
  // 1. Override explícito por URL (?lang=en) — útil para demos y QA.
  try {
    const param = new URLSearchParams(window.location.search).get('lang')
    if (param && isSupported(param)) return param
  } catch { /* sin window (SSR/test) */ }
  // 2. Preferencia guardada por el usuario.
  try {
    const saved = localStorage.getItem('locale')
    if (saved && isSupported(saved)) return saved
  } catch { /* storage deshabilitado */ }
  // 3. Idioma del navegador: 'en-US' → 'en'.
  try {
    const nav = (navigator.language || '').toLowerCase().split('-')[0]
    if (isSupported(nav)) return nav
  } catch { /* sin navigator */ }
  return BASE
}

// Camina la clave con puntos ('nav.items.vr') sobre el objeto del locale.
function lookup(lang, key) {
  const parts = key.split('.')
  let current = LOCALES[lang]
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) current = current[part]
    else return undefined
  }
  return typeof current === 'string' ? current : undefined
}

// Reemplaza {placeholders} — mismo formato que el i18n original.
function interpolate(str, values) {
  if (!values) return str
  return str.replace(/\{(\w+)\}/g, (_, k) => (k in values ? String(values[k]) : `{${k}}`))
}

// Traduce: idioma actual → base (español) → la clave cruda (para detectar
// claves faltantes en dev sin romper la UI).
export function translate(lang, key, values) {
  const hit = lookup(lang, key) ?? lookup(BASE, key) ?? key
  return interpolate(hit, values)
}

export const useLocaleStore = create((set) => ({
  lang: detectLanguage(),
  setLang: (lang) => {
    if (!isSupported(lang)) return
    try { localStorage.setItem('locale', lang) } catch { /* ignore */ }
    set({ lang })
  },
}))

// Hook de componente: `const { t, lang, setLang } = useI18n()`.
export function useI18n() {
  const lang = useLocaleStore((s) => s.lang)
  const setLang = useLocaleStore((s) => s.setLang)
  const t = (key, values) => translate(lang, key, values)
  return { t, lang, setLang }
}
