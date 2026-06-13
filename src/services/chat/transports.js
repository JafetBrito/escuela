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

function buildSystemPrompt({ mascotName, module, aiTone, aiVerbosity, customInstructions }) {
  const tone = AI_TONES.find((t) => t.id === aiTone) ?? AI_TONES[0]
  const verbosity = AI_VERBOSITY.find((v) => v.id === aiVerbosity) ?? AI_VERBOSITY[1]
  let base = `Eres ${mascotName ?? 'un compañero'}, una mascota virtual 3D que acompaña a un estudiante dentro de un curso interactivo. ${tone.prompt} ${verbosity.prompt} Responde siempre en español.`
  if (module) {
    base = `${base} El estudiante está en la clase "${module.title}": ${module.description ?? ''}`.trim()
  }
  if (customInstructions?.trim()) {
    base = `${base} Instrucciones adicionales del usuario: ${customInstructions.trim()}`
  }
  return base
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
