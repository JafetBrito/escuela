import { create } from 'zustand'
import { supabase } from '../services/supabase/client'
import { setExtraWords } from '../utils/profanityFilter'

// Palabras prohibidas que un admin agrega SIN publicar código. Se guardan en
// platform_settings (misma tabla que useHolidayStore) como un arreglo de
// strings, así que aplican a todos en su próxima carga. Mismas reglas de
// entradas que data/bannedWords.js ('palabra', 'prefijo*', '~contiene').
const KEY = 'banned_words'

const persist = async (words) => {
  if (!supabase) return
  await supabase.from('platform_settings').upsert({ key: KEY, value: words, updated_at: new Date().toISOString() })
}

export const useBannedWordsStore = create((set, get) => ({
  words: [],

  load: async () => {
    if (!supabase) return
    const { data } = await supabase.from('platform_settings').select('value').eq('key', KEY).maybeSingle()
    const words = Array.isArray(data?.value) ? data.value : []
    setExtraWords(words)
    set({ words })
  },

  add: async (word) => {
    const w = word.trim().toLowerCase()
    if (!w || get().words.includes(w)) return
    const words = [...get().words, w]
    setExtraWords(words)
    set({ words })
    await persist(words)
  },

  remove: async (word) => {
    const words = get().words.filter((w) => w !== word)
    setExtraWords(words)
    set({ words })
    await persist(words)
  },
}))
