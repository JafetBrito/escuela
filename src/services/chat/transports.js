import { minimaxChatCompletion } from './minimaxClient'

// ChatTransport interface:
//   sendMessage({ mode: 'text' | 'voice', content, context }) -> Promise<{ role, content }>
//
// `context` shape:
//   {
//     minimaxApiKey: string,        // from the user's license file
//     mascotName: string,
//     module: { title, description } | undefined,
//     history: { role: 'user' | 'assistant', content: string }[],
//   }

function buildSystemPrompt({ mascotName, module }) {
  const base = `Eres ${mascotName ?? 'un compañero'}, una mascota virtual 3D que acompaña a un estudiante dentro de un curso interactivo. Responde de forma breve, amigable y motivadora, en español.`
  if (!module) return base
  return `${base} El estudiante está en la clase "${module.title}": ${module.description ?? ''}`.trim()
}

export const minimaxTextTransport = {
  async sendMessage({ content, context = {} }) {
    const { minimaxApiKey, model, history = [] } = context

    // No real key (mock/demo license) -> canned response, no network call.
    if (!minimaxApiKey || minimaxApiKey.startsWith('mx-mock')) {
      return {
        role: 'assistant',
        content: `(demo) Recibí: "${content}". Conecta tu Minimax API key en Mi mascota → Configuración para respuestas reales.`,
      }
    }

    const messages = [
      { role: 'system', content: buildSystemPrompt(context) },
      ...history.map(({ role, content: text }) => ({ role, content: text })),
      { role: 'user', content },
    ]

    const reply = await minimaxChatCompletion({ apiKey: minimaxApiKey, messages, ...(model ? { model } : {}) })
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
