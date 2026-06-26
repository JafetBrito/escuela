import { minimaxChatCompletion } from './minimaxClient'
import { deepseekChatCompletion } from './deepseekClient'
import { anthropicChatCompletion } from './anthropicClient'
import { googleChatCompletion } from './googleClient'
import { openaiCompatibleChatCompletion } from './openaiCompatibleClient'
import { AI_TONES, AI_VERBOSITY, AGENT_MODES } from '../../stores/useSettingsStore'
import { getProviderById, providerSupportsTools } from '../../data/aiProviderRegistry'
import { useAiCredentialsStore } from '../../stores/useAiCredentialsStore'
import { runToolLoop } from './toolRuntime'

// ChatTransport interface:
//   sendMessage({ mode: 'text' | 'voice', content, context }) -> Promise<{ role, content }>
//
// `context` shape:
//   {
//     connectionId: string,          // id from useAiCredentialsStore.connections
//     mascotName, identity, soulRules, userProfile, aiTone, aiVerbosity,
//     agentMode, toolsEnabled, customInstructions,
//     module: { title, description } | undefined,
//     history: { role: 'user' | 'assistant', content: string }[],
//   }

// Builds a layered system prompt, highest priority first: Alma (reglas no
// negociables) > Identidad > Memoria de conversación > Memoria a largo
// plazo > Usuario > Personalidad (tono/detalle + modo de agente) > curso/
// clase actual > instrucciones personalizadas (para matizar todo lo de
// arriba, no para contradecirlo).
export function buildSystemPrompt(context) {
  const {
    mascotName, identity, soulRules, userProfile, longTermMemories,
    aiTone, aiVerbosity, agentMode, course, module, customInstructions,
  } = context
  const tone = AI_TONES.find((t) => t.id === aiTone) ?? AI_TONES[0]
  const verbosity = AI_VERBOSITY.find((v) => v.id === aiVerbosity) ?? AI_VERBOSITY[1]
  const mode = AGENT_MODES.find((m) => m.id === agentMode) ?? AGENT_MODES[0]
  const name = mascotName ?? 'un compañero'

  const sections = []

  if (soulRules?.trim()) {
    sections.push(`# Alma (reglas innegociables, máxima prioridad)\n${soulRules.trim()}`)
  }

  sections.push(
    `# Identidad\nEres ${name}, la mascota virtual 3D de Oliver Academy, una plataforma educativa interactiva. Acompañas a un estudiante a lo largo de sus cursos: explicas temas, resuelves dudas, sugieres retos y celebras su progreso. Responde siempre en español.${identity?.trim() ? `\n${identity.trim()}` : ''}`,
  )

  sections.push(
    `# Memoria\nEl historial de la conversación con este estudiante se incluye en los mensajes anteriores: tenlo en cuenta para no repetirte y dar continuidad.`,
  )

  if (longTermMemories?.length) {
    sections.push(`# Memoria a largo plazo\n${longTermMemories.map((m) => `- ${m}`).join('\n')}`)
  }

  if (userProfile?.trim()) {
    sections.push(`# Usuario\n${userProfile.trim()}`)
  }

  sections.push(`# Personalidad\n${tone.prompt} ${verbosity.prompt}`)
  sections.push(`# Modo\n${mode.prompt}`)

  sections.push(
    `# Límites\nSolo tienes la información de este curso que se te da en este prompt, el historial de la conversación y la memoria a largo plazo de arriba; no inventes datos que no se te hayan dado. Si no sabes algo, dilo con honestidad.`,
  )

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

// Dispatches to the right client by provider kind, fetching the real key
// just-in-time (never kept around in a store). Returns the raw text reply,
// or runs the tool-call loop first if the connection's provider supports it
// and at least one tool is enabled.
async function callProvider({ connectionId, messages, temperature, maxTokens, toolsEnabled }) {
  const connection = useAiCredentialsStore.getState().connections.find((c) => c.id === connectionId)
  if (!connection) {
    throw new Error('No hay ninguna conexión de IA configurada.')
  }
  const provider = getProviderById(connection.providerId)
  const apiKey = await useAiCredentialsStore.getState().getApiKeyForCall(connectionId)
  if (!apiKey) throw new Error('No se pudo leer la llave de esta conexión.')

  const baseArgs = { apiKey, messages, model: connection.model || provider?.defaultModel, temperature, maxTokens }

  switch (provider?.kind) {
    case 'native':
      if (connection.providerId === 'minimax') return minimaxChatCompletion(baseArgs)
      if (connection.providerId === 'deepseek') return deepseekChatCompletion(baseArgs)
      if (connection.providerId === 'anthropic') return anthropicChatCompletion(baseArgs)
      if (connection.providerId === 'google') return googleChatCompletion(baseArgs)
      throw new Error(`Proveedor nativo desconocido: ${connection.providerId}`)
    case 'openai_compatible': {
      const baseUrl = connection.baseUrl || provider?.defaultBaseUrl
      if (toolsEnabled?.length && providerSupportsTools(connection.providerId)) {
        return runToolLoop({ ...baseArgs, baseUrl, toolsEnabled })
      }
      const message = await openaiCompatibleChatCompletion({ ...baseArgs, baseUrl })
      return message.content
    }
    default:
      throw new Error('Esta conexión de IA no tiene un proveedor válido configurado.')
  }
}

export const aiTextTransport = {
  async sendMessage({ content, context = {} }) {
    const { connectionId, history = [], temperature, maxTokens, toolsEnabled } = context

    if (!connectionId) {
      return {
        role: 'assistant',
        content: `(demo) Recibí: "${content}". Conecta una IA en Ajustes → Núcleo para respuestas reales.`,
      }
    }

    const messages = [
      { role: 'system', content: buildSystemPrompt(context) },
      ...history.map(({ role, content: text }) => ({ role, content: text })),
      { role: 'user', content },
    ]

    const reply = await callProvider({ connectionId, messages, temperature, maxTokens, toolsEnabled })
    return { role: 'assistant', content: reply }
  },
}

export const aiVoiceTransport = {
  async sendMessage() {
    throw new Error('Voice transport not implemented yet')
  },
}

export function getTransport(mode = 'text') {
  return mode === 'voice' ? aiVoiceTransport : aiTextTransport
}

// "Probar conexión" (Bootstrap) — fires a tiny real request straight from
// the form, before the credential is even saved, so a typo'd key/base URL
// is caught immediately instead of at the next real chat message.
export async function testCredential({ providerId, apiKey, baseUrl, model }) {
  const provider = getProviderById(providerId)
  const args = {
    apiKey,
    model: model || provider?.defaultModel,
    messages: [{ role: 'user', content: 'Responde solo con la palabra: ok' }],
    maxTokens: 10,
  }
  try {
    if (provider?.kind === 'native') {
      if (providerId === 'minimax') await minimaxChatCompletion(args)
      else if (providerId === 'deepseek') await deepseekChatCompletion(args)
      else if (providerId === 'anthropic') await anthropicChatCompletion(args)
      else if (providerId === 'google') await googleChatCompletion(args)
      else throw new Error('Proveedor desconocido')
    } else {
      await openaiCompatibleChatCompletion({ ...args, baseUrl: baseUrl || provider?.defaultBaseUrl })
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}
