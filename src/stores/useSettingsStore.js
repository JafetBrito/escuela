import { create } from 'zustand'

const CHAT_MODELS = [
  { id: 'abab6.5s-chat', label: 'MiniMax abab6.5s-chat (rápido)', provider: 'minimax' },
  { id: 'abab6.5g-chat', label: 'MiniMax abab6.5g-chat (creativo)', provider: 'minimax' },
  { id: 'abab6.5t-chat', label: 'MiniMax abab6.5t-chat (balanceado)', provider: 'minimax' },
  { id: 'deepseek-chat', label: 'DeepSeek Chat (rápido)', provider: 'deepseek' },
  { id: 'deepseek-reasoner', label: 'DeepSeek Reasoner (razonamiento)', provider: 'deepseek' },
]

export function getModelProvider(modelId) {
  return CHAT_MODELS.find((m) => m.id === modelId)?.provider ?? 'minimax'
}

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

// Prompt base de "tutor de Oliver School" que se añade al system prompt por
// defecto. El usuario puede editarlo libremente desde Ajustes.
export const DEFAULT_CUSTOM_INSTRUCTIONS = `Eres el tutor virtual de Oliver School. Tu prioridad es ayudar al estudiante a entender los temas del curso en el que está, no solo darle las respuestas: explica los conceptos paso a paso, con ejemplos sencillos y relacionándolos con lo que ya vio en clases anteriores cuando sea posible. Si te pide la respuesta de un ejercicio o examen, primero guíalo con preguntas o pistas para que llegue solo a la conclusión, y solo da la respuesta directa si insiste o si ya lo intentó. Anímalo cuando avance y motívalo a seguir aprendiendo. Si pregunta algo totalmente fuera del curso, respóndele brevemente y luego sugiérele volver al tema de la clase.`

export const useSettingsStore = create((set) => ({
  mascotName: '',
  minimaxApiKey: '',
  deepseekApiKey: '',
  chatModel: CHAT_MODELS[0].id,
  aiTone: AI_TONES[0].id,
  aiVerbosity: AI_VERBOSITY[1].id,
  temperature: DEFAULT_TEMPERATURE,
  maxTokens: DEFAULT_MAX_TOKENS,
  customInstructions: DEFAULT_CUSTOM_INSTRUCTIONS,
  notionApiKey: '',
  notionDatabaseId: '',

  setMascotName: (mascotName) => set({ mascotName }),
  setMinimaxApiKey: (minimaxApiKey) => set({ minimaxApiKey }),
  setDeepseekApiKey: (deepseekApiKey) => set({ deepseekApiKey }),
  setChatModel: (chatModel) => set({ chatModel }),
  setAiTone: (aiTone) => set({ aiTone }),
  setAiVerbosity: (aiVerbosity) => set({ aiVerbosity }),
  setTemperature: (temperature) => set({ temperature }),
  setMaxTokens: (maxTokens) => set({ maxTokens }),
  setCustomInstructions: (customInstructions) => set({ customInstructions }),
  setNotionApiKey: (notionApiKey) => set({ notionApiKey }),
  setNotionDatabaseId: (notionDatabaseId) => set({ notionDatabaseId }),

  loadSettings: (settings) =>
    set({
      mascotName: settings?.mascotName ?? '',
      minimaxApiKey: settings?.minimaxApiKey ?? '',
      deepseekApiKey: settings?.deepseekApiKey ?? '',
      chatModel: settings?.chatModel ?? CHAT_MODELS[0].id,
      aiTone: settings?.aiTone ?? AI_TONES[0].id,
      aiVerbosity: settings?.aiVerbosity ?? AI_VERBOSITY[1].id,
      temperature: settings?.temperature ?? DEFAULT_TEMPERATURE,
      maxTokens: settings?.maxTokens ?? DEFAULT_MAX_TOKENS,
      customInstructions: settings?.customInstructions || DEFAULT_CUSTOM_INSTRUCTIONS,
      notionApiKey: settings?.notionApiKey ?? '',
      notionDatabaseId: settings?.notionDatabaseId ?? '',
    }),
}))
