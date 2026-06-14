import { minimaxChatCompletion } from './minimaxClient'
import { deepseekChatCompletion } from './deepseekClient'
import { AI_TONES, AI_VERBOSITY, getModelProvider } from '../../stores/useSettingsStore'

// ChatTransport interface:
//   sendMessage({ mode: 'text' | 'voice', content, context }) -> Promise<{ role, content }>
//
// `context` shape:
//   {
//     minimaxApiKey: string,        // from the user's license file
//     mascotName: string,
//     aiTone: string,               // id from AI_TONES
//     aiVerbosity: string,          // id from AI_VERBOSITY
//     module: { title, description } | undefined,
//     history: { role: 'user' | 'assistant', content: string }[],
//   }

// Builds a layered system prompt: identidad fija de la mascota, memoria y
// límites, personalidad configurable, contexto del curso/clase actual, y por
// último las instrucciones personalizadas del usuario (para que puedan
// reforzar o matizar lo anterior).
function buildSystemPrompt({ mascotName, course, module, aiTone, aiVerbosity, customInstructions }) {
  const tone = AI_TONES.find((t) => t.id === aiTone) ?? AI_TONES[0]
  const verbosity = AI_VERBOSITY.find((v) => v.id === aiVerbosity) ?? AI_VERBOSITY[1]
  const name = mascotName ?? 'un compañero'

  const sections = [
    `# Identidad\nEres ${name}, la mascota virtual 3D de Oliver School, una plataforma educativa interactiva. Acompañas a un estudiante a lo largo de sus cursos: explicas temas, resuelves dudas, sugieres retos y celebras su progreso. Responde siempre en español.`,
    `# Memoria\nEl historial de la conversación con este estudiante se incluye en los mensajes anteriores: tenlo en cuenta para no repetirte, recordar lo que ya explicaste y dar continuidad (por ejemplo, si ya resolvieron una duda, no la vuelvas a explicar desde cero salvo que te lo pidan).`,
    `# Límites\nSolo tienes la información de este curso que se te da en este prompt y el historial de la conversación; no inventes datos sobre la cuenta del estudiante, sus calificaciones reales o contenido que no se te haya proporcionado. Si no sabes algo, dilo con honestidad y sugiere dónde podría encontrarlo dentro del curso.`,
    `# Personalidad\n${tone.prompt} ${verbosity.prompt}`,
  ]

  if (course?.instructions) {
    sections.push(`# Instrucciones del curso "${course.title ?? ''}"\n${course.instructions}`.trim())
  }

  if (module) {
    sections.push(
      `# Clase actual\nEl estudiante está en la clase "${module.title}": ${module.description ?? ''}`.trim(),
    )
  }

  if (customInstructions?.trim()) {
    sections.push(`# Instrucciones adicionales\n${customInstructions.trim()}`)
  }

  return sections.join('\n\n')
}

export const minimaxTextTransport = {
  async sendMessage({ content, context = {} }) {
    const { minimaxApiKey, deepseekApiKey, model, history = [], temperature, maxTokens } = context
    const provider = getModelProvider(model)
    const apiKey = provider === 'deepseek' ? deepseekApiKey : minimaxApiKey

    // No real key (mock/demo license, or empty) -> canned response, no network call.
    if (!apiKey || apiKey.startsWith('mx-mock')) {
      const providerLabel = provider === 'deepseek' ? 'DeepSeek' : 'Minimax'
      return {
        role: 'assistant',
        content: `(demo) Recibí: "${content}". Conecta tu ${providerLabel} API key en Ajustes para respuestas reales.`,
      }
    }

    const messages = [
      { role: 'system', content: buildSystemPrompt(context) },
      ...history.map(({ role, content: text }) => ({ role, content: text })),
      { role: 'user', content },
    ]

    const completionFn = provider === 'deepseek' ? deepseekChatCompletion : minimaxChatCompletion
    const reply = await completionFn({
      apiKey,
      messages,
      ...(model ? { model } : {}),
      ...(temperature != null ? { temperature } : {}),
      ...(maxTokens != null ? { maxTokens } : {}),
    })
    return { role: 'assistant', content: reply }
  },
}

export const minimaxVoiceTransport = {
  async sendMessage() {
    throw new Error('Voice transport not implemented yet')
  },
}

export function getTransport(mode = 'text') {
  return mode === 'voice' ? minimaxVoiceTransport : minimaxTextTransport
}
