import { create } from 'zustand'

const CHAT_MODELS = [
  { id: 'abab6.5s-chat', label: 'MiniMax abab6.5s-chat (rápido)' },
  { id: 'abab6.5g-chat', label: 'MiniMax abab6.5g-chat (creativo)' },
  { id: 'abab6.5t-chat', label: 'MiniMax abab6.5t-chat (balanceado)' },
]

// "Cómo se comporta la IA": tono/personalidad de las respuestas.
const AI_TONES = [
  { id: 'amigable', label: 'Amigable', prompt: 'Responde de forma cercana, cálida y amigable.' },
  { id: 'profesional', label: 'Profesional', prompt: 'Responde de forma profesional, clara y formal.' },
  { id: 'motivador', label: 'Motivador', prompt: 'Responde con entusiasmo, animando al estudiante a seguir aprendiendo.' },
  { id: 'directo', label: 'Directo', prompt: 'Responde de forma directa y concisa, sin rodeos.' },
]

// Nivel de detalle de las respuestas.
const AI_VERBOSITY = [
  { id: 'breve', label: 'Breve', prompt: 'Mantén tus respuestas muy cortas, de 1 a 2 frases.' },
  { id: 'normal', label: 'Normal', prompt: 'Responde con una extensión moderada.' },
  { id: 'detallado', label: 'Detallado', prompt: 'Da respuestas detalladas y con ejemplos cuando ayuden.' },
]

export { CHAT_MODELS, AI_TONES, AI_VERBOSITY }

// Valores por defecto para la configuración avanzada de la IA, usados hasta
// que se conecte una API real.
const DEFAULT_TEMPERATURE = 0.7
const DEFAULT_MAX_TOKENS = 500

export const useSettingsStore = create((set) => ({
  mascotName: '',
  minimaxApiKey: '',
  chatModel: CHAT_MODELS[0].id,
  aiTone: AI_TONES[0].id,
  aiVerbosity: AI_VERBOSITY[1].id,
  temperature: DEFAULT_TEMPERATURE,
  maxTokens: DEFAULT_MAX_TOKENS,
  customInstructions: '',

  setMascotName: (mascotName) => set({ mascotName }),
  setMinimaxApiKey: (minimaxApiKey) => set({ minimaxApiKey }),
  setChatModel: (chatModel) => set({ chatModel }),
  setAiTone: (aiTone) => set({ aiTone }),
  setAiVerbosity: (aiVerbosity) => set({ aiVerbosity }),
  setTemperature: (temperature) => set({ temperature }),
  setMaxTokens: (maxTokens) => set({ maxTokens }),
  setCustomInstructions: (customInstructions) => set({ customInstructions }),

  loadSettings: (settings) =>
    set({
      mascotName: settings?.mascotName ?? '',
      minimaxApiKey: settings?.minimaxApiKey ?? '',
      chatModel: settings?.chatModel ?? CHAT_MODELS[0].id,
      aiTone: settings?.aiTone ?? AI_TONES[0].id,
      aiVerbosity: settings?.aiVerbosity ?? AI_VERBOSITY[1].id,
      temperature: settings?.temperature ?? DEFAULT_TEMPERATURE,
      maxTokens: settings?.maxTokens ?? DEFAULT_MAX_TOKENS,
      customInstructions: settings?.customInstructions ?? '',
    }),
}))
