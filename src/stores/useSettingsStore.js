import { create } from 'zustand'

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

// "Agentes": modos de comportamiento que cambian qué sección de la
// personalidad se prioriza, sin tocar el resto de la configuración.
const AGENT_MODES = [
  { id: 'tutor', label: '🎓 Tutor de curso', prompt: 'Tu prioridad es ayudar al estudiante a entender los temas del curso en el que está: explica paso a paso, con ejemplos, y guía con preguntas antes de dar la respuesta directa de un ejercicio.' },
  { id: 'free_chat', label: '💬 Compañero libre', prompt: 'Eres un compañero de conversación relajado: puedes hablar de cualquier tema, sin necesidad de redirigir todo hacia el curso.' },
  { id: 'study_buddy', label: '📚 Compañero de estudio', prompt: 'Tu enfoque es ayudar a practicar: propones preguntas de repaso, retos cortos y celebras cada respuesta correcta como si fuera un logro.' },
]

// "Herramientas": capacidades reales que el modelo puede invocar durante la
// conversación (function calling) — solo disponibles hoy con proveedores
// "OpenAI-compatible" (ver aiProviderRegistry.js providerSupportsTools).
const AI_TOOLS = [
  { id: 'course_progress', label: '📈 Ver tu progreso de curso', description: 'Puede consultar en qué clase y curso estás para responder con ese contexto.' },
  { id: 'search_notes', label: '📝 Buscar en tus notas', description: 'Puede buscar dentro de las notas que has guardado en la app.' },
]

export { AI_TONES, AI_VERBOSITY, AGENT_MODES, AI_TOOLS }

const DEFAULT_TEMPERATURE = 0.7
const DEFAULT_MAX_TOKENS = 500
const DEFAULT_HEARTBEAT_MINUTES = 15

// Prompt base de "tutor de Oliver Academy" — usado por el modo 'tutor'.
export const DEFAULT_CUSTOM_INSTRUCTIONS = `Eres el tutor virtual de Oliver Academy. Tu prioridad es ayudar al estudiante a entender los temas del curso en el que está, no solo darle las respuestas: explica los conceptos paso a paso, con ejemplos sencillos y relacionándolos con lo que ya vio en clases anteriores cuando sea posible. Si te pide la respuesta de un ejercicio o examen, primero guíalo con preguntas o pistas para que llegue solo a la conclusión, y solo da la respuesta directa si insiste o si ya lo intentó. Anímalo cuando avance y motívalo a seguir aprendiendo. Si pregunta algo totalmente fuera del curso, respóndele brevemente y luego sugiérele volver al tema de la clase.`

export const useSettingsStore = create((set) => ({
  mascotName: '',

  // Núcleo / Cerebro — qué proveedor+modelo usar (la llave en sí vive en
  // useAiCredentialsStore, nunca aquí: este store entero se sincroniza vía
  // profiles.snapshot, que un admin puede leer).
  activeCredentialId: null,
  temperature: DEFAULT_TEMPERATURE,
  maxTokens: DEFAULT_MAX_TOKENS,

  // Identidad — quién es la mascota.
  identity: '',
  // Alma — reglas no negociables, máxima prioridad en el system prompt.
  soulRules: '',
  // Usuario — qué debe saber la IA siempre sobre el estudiante.
  userProfile: '',

  // Personalidad (ya existía).
  aiTone: AI_TONES[0].id,
  aiVerbosity: AI_VERBOSITY[1].id,
  customInstructions: DEFAULT_CUSTOM_INSTRUCTIONS,

  // Agentes / Herramientas / Heartbeat.
  agentMode: AGENT_MODES[0].id,
  toolsEnabled: [],
  heartbeatEnabled: false,
  heartbeatMinutes: DEFAULT_HEARTBEAT_MINUTES,

  notionDatabaseId: '',

  setMascotName: (mascotName) => set({ mascotName }),
  setActiveCredentialId: (activeCredentialId) => set({ activeCredentialId }),
  setAiTone: (aiTone) => set({ aiTone }),
  setAiVerbosity: (aiVerbosity) => set({ aiVerbosity }),
  setTemperature: (temperature) => set({ temperature }),
  setMaxTokens: (maxTokens) => set({ maxTokens }),
  setCustomInstructions: (customInstructions) => set({ customInstructions }),
  setIdentity: (identity) => set({ identity }),
  setSoulRules: (soulRules) => set({ soulRules }),
  setUserProfile: (userProfile) => set({ userProfile }),
  setAgentMode: (agentMode) => set({ agentMode }),
  toggleTool: (toolId) =>
    set((s) => ({
      toolsEnabled: s.toolsEnabled.includes(toolId)
        ? s.toolsEnabled.filter((id) => id !== toolId)
        : [...s.toolsEnabled, toolId],
    })),
  setHeartbeatEnabled: (heartbeatEnabled) => set({ heartbeatEnabled }),
  setHeartbeatMinutes: (heartbeatMinutes) => set({ heartbeatMinutes }),
  setNotionDatabaseId: (notionDatabaseId) => set({ notionDatabaseId }),

  loadSettings: (settings) =>
    set({
      mascotName: settings?.mascotName ?? '',
      activeCredentialId: settings?.activeCredentialId ?? null,
      temperature: settings?.temperature ?? DEFAULT_TEMPERATURE,
      maxTokens: settings?.maxTokens ?? DEFAULT_MAX_TOKENS,
      identity: settings?.identity ?? '',
      soulRules: settings?.soulRules ?? '',
      userProfile: settings?.userProfile ?? '',
      aiTone: settings?.aiTone ?? AI_TONES[0].id,
      aiVerbosity: settings?.aiVerbosity ?? AI_VERBOSITY[1].id,
      customInstructions: settings?.customInstructions || DEFAULT_CUSTOM_INSTRUCTIONS,
      agentMode: settings?.agentMode ?? AGENT_MODES[0].id,
      toolsEnabled: settings?.toolsEnabled ?? [],
      heartbeatEnabled: settings?.heartbeatEnabled ?? false,
      heartbeatMinutes: settings?.heartbeatMinutes ?? DEFAULT_HEARTBEAT_MINUTES,
      notionDatabaseId: settings?.notionDatabaseId ?? '',
    }),
}))
