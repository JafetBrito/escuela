import { create } from 'zustand'
import { useCurrencyStore } from './useCurrencyStore'
import { useLevelStore } from './useLevelStore'
import { ITEM_DB } from '../data/itemDb'

// Estado "Tamagotchi" de la mascota del Hub móvil: cuatro necesidades (0-100, más = mejor) que bajan con
// el tiempo REAL (también con la app cerrada, hasta 24 h) y se recuperan cuidándola. Cuidarla da vínculo
// (afecto); entrenarla da XP de verdad. Se guarda en el snapshot de la cuenta (progressSnapshot → `pet`).
const clamp = (v) => Math.max(0, Math.min(100, v))
const DEFAULT_NEEDS = { hunger: 80, energy: 90, mood: 80, curiosity: 60 }
const DECAY_PER_HOUR = { hunger: 7, energy: 3, mood: 2.5, curiosity: 4 }
const MAX_OFFLINE_H = 24

// La comida ya no vive aquí: son objetos de la base de datos (src/data/itemDb, clase consumible/comida). Esta lista es
// solo la vista que usa el Hub. cost en "cobre" (10000 = 1 oro); la galleta es gratis para no quedarse sin poder alimentarla.
export const PET_FOODS = ITEM_DB.filter((i) => i.class === 'consumable' && i.subclass === 'food').map((i) => {
  const fx = { ...(i.effects.find((e) => e.type === 'pet_need') || {}) }
  delete fx.type
  return { id: i.key, entry: i.entry, emoji: i.icon, name: [i.name, i.i18n?.en?.name || i.name], cost: i.buyPrice, fx }
})

export const bondLevel = (affection) => 1 + Math.floor(Math.sqrt(Math.max(0, affection)))
// Cómo se siente ahora: decide el mensaje y la postura del modelo 3D.
export function moodKey(n) {
  if (n.hunger < 25) return 'hungry'
  if (n.energy < 20) return 'tired'
  if (n.mood < 35) return 'sad'
  if (n.curiosity < 30) return 'bored'
  return 'happy'
}

const now = () => Date.now()

export const usePetStore = create((set, get) => ({
  needs: { ...DEFAULT_NEEDS },
  updatedAt: now(),
  affection: 0,
  goal: '',

  // Aplica el paso del tiempo (llamar al abrir el Hub y cada ~30 s mientras está abierto).
  tick: () => {
    const s = get(), t = now(), h = Math.min(MAX_OFFLINE_H, Math.max(0, (t - s.updatedAt) / 3.6e6))
    if (h <= 0) return
    const n = { ...s.needs }
    const sadMult = n.hunger < 25 || n.energy < 20 ? 2 : 1 // con hambre o sueño el ánimo cae más rápido
    n.hunger = clamp(n.hunger - DECAY_PER_HOUR.hunger * h)
    n.energy = clamp(n.energy - DECAY_PER_HOUR.energy * h)
    n.mood = clamp(n.mood - DECAY_PER_HOUR.mood * sadMult * h)
    n.curiosity = clamp(n.curiosity - DECAY_PER_HOUR.curiosity * h)
    set({ needs: n, updatedAt: t })
  },

  feed: (foodId) => {
    const food = PET_FOODS.find((f) => f.id === foodId), s = get()
    if (!food) return { ok: false, reason: 'unknown' }
    if (s.needs.hunger >= 97) return { ok: false, reason: 'full' }
    if (food.cost > 0 && !useCurrencyStore.getState().spendCoins(food.cost)) return { ok: false, reason: 'coins' }
    const n = { ...s.needs }
    for (const [k, v] of Object.entries(food.fx)) n[k] = clamp(n[k] + v)
    set({ needs: n, updatedAt: now(), affection: s.affection + 1 })
    return { ok: true, food }
  },
  caress: () => {
    const s = get()
    set({ needs: { ...s.needs, mood: clamp(s.needs.mood + 6) }, updatedAt: now(), affection: s.affection + 0.5 })
    return { ok: true }
  },
  rest: () => {
    const s = get()
    if (s.needs.energy >= 95) return { ok: false, reason: 'rested' }
    set({ needs: { ...s.needs, energy: clamp(s.needs.energy + 35), hunger: clamp(s.needs.hunger - 5) }, updatedAt: now(), affection: s.affection + 0.5 })
    return { ok: true }
  },
  // Entrenar = responder una pregunta: da XP real; cansa a la mascota.
  train: (correct) => {
    const s = get()
    if (s.needs.energy < 10) return { ok: false, reason: 'tired' }
    const n = { ...s.needs, energy: clamp(s.needs.energy - 8), curiosity: clamp(s.needs.curiosity + (correct ? 18 : 6)), mood: clamp(s.needs.mood + (correct ? 5 : 0)) }
    set({ needs: n, updatedAt: now(), affection: s.affection + 1 })
    const xp = correct ? 15 : 4
    useLevelStore.getState().addXp(xp)
    return { ok: true, xp }
  },
  setGoal: (goal) => set({ goal: String(goal).slice(0, 80) }),

  // Llamado por progressSnapshot.applyProgressSnapshot
  loadPet: (p) => set({
    needs: { ...DEFAULT_NEEDS, ...(p?.needs || {}) },
    updatedAt: p?.updatedAt || now(),
    affection: p?.affection || 0,
    goal: p?.goal || '',
  }),
}))
