import { BANNED_WORDS } from '../data/bannedWords'

// Filtro global de lenguaje no permitido. Uso: hasProfanity(texto).
// Diccionario = BANNED_WORDS (código) + palabras extra que un admin agrega en
// vivo (useBannedWordsStore → setExtraWords). Ver reglas de cada entrada en
// data/bannedWords.js.
//
// ponytail: filtro SOLO del lado del cliente — frena el uso normal, no a
// alguien que llame a la API directo. Si hace falta blindarlo, un trigger de
// Postgres con la misma lista sobre forum_posts/forum_replies/chats.
export const PROFANITY_MESSAGE = 'Tu mensaje contiene lenguaje no permitido. Reescríbelo con respeto, por favor.'

const LEET = { 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', 8: 'b', '@': 'a', $: 's' }

const strip = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '')

// minúsculas, sin acentos, con números/símbolos comunes convertidos a letras
function normalize(text) {
  return strip(text.toLowerCase()).replace(/[0134578@$]/g, (c) => LEET[c])
}

// Convierte una entrada del diccionario en una regex sobre una palabra ya
// normalizada. Cada letra acepta repeticiones (puuuta); dos letras iguales
// seguidas (ss en "ass") exigen al menos dos, para que "as" no coincida con "ass".
function entryToRegex(entry) {
  let e = strip(entry.toLowerCase()).replace(/[0134578@$]/g, (c) => LEET[c])
  const contains = e.startsWith('~')
  const prefix = e.endsWith('*')
  e = e.replace(/^~/, '').replace(/\*$/, '')
  let src = ''
  for (let i = 0; i < e.length; ) {
    let j = i
    while (e[j + 1] === e[i]) j++
    const run = j - i + 1
    const ch = e[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    src += run >= 2 ? `${ch}{${run},}` : `${ch}+`
    i = j + 1
  }
  if (contains) return new RegExp(src)
  return new RegExp(prefix ? `^${src}` : `^${src}$`)
}

let extraWords = []
let compiled = null
const compile = () => { compiled = [...BANNED_WORDS, ...extraWords].map(entryToRegex) }

export function setExtraWords(words) {
  extraWords = Array.isArray(words) ? words.filter((w) => typeof w === 'string' && w.trim()) : []
  compiled = null
}

// Palabras "sueltas": separa por todo lo que no sea letra y, además, une las
// letras aisladas consecutivas ("p u t a" → "puta").
function tokens(text) {
  const raw = normalize(text).split(/[^a-zñ]+/).filter(Boolean)
  const out = [...raw]
  let run = ''
  for (const t of raw) {
    if (t.length === 1) run += t
    else { if (run.length > 1) out.push(run); run = '' }
  }
  if (run.length > 1) out.push(run)
  return out
}

export function hasProfanity(text) {
  if (!text || typeof text !== 'string') return false
  if (!compiled) compile()
  return tokens(text).some((tok) => compiled.some((re) => re.test(tok)))
}

// Para handlers de UI: si el texto no pasa, avisa y devuelve true.
export function blockIfProfane(text) {
  if (!hasProfanity(text)) return false
  window.alert(PROFANITY_MESSAGE)
  return true
}
