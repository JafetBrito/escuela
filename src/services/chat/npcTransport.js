import { minimaxChatCompletion } from './minimaxClient'
import { deepseekChatCompletion } from './deepseekClient'
import { anthropicChatCompletion } from './anthropicClient'
import { googleChatCompletion } from './googleClient'
import { openaiCompatibleChatCompletion } from './openaiCompatibleClient'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { useAiCredentialsStore } from '../../stores/useAiCredentialsStore'
import { getProviderById } from '../../data/aiProviderRegistry'

// Lightweight chat transport for in-character NPCs (Zafir in la Tienda, el
// Mago de Misiones, Jafet en el Árbol). Reuses whichever AI connection the
// user has set as active in Ajustes → Núcleo, but with a fixed per-NPC
// system prompt instead of the mascot's configurable personality.
export async function sendNpcMessage({ npcPrompt, content, history = [], lang = 'es' }) {
  const { activeCredentialId, temperature, maxTokens } = useSettingsStore.getState()
  const connection = useAiCredentialsStore.getState().connections.find((c) => c.id === activeCredentialId)

  if (!connection) {
    return lang === 'en'
      ? `(demo) ${content ? `Got: "${content}". ` : ''}Connect an AI in Settings → Core to really talk to me.`
      : lang === 'fr'
        ? `(demo) ${content ? `Reçu : "${content}". ` : ''}Connecte une IA dans Paramètres → Cœur pour vraiment me parler.`
        : lang === 'it'
          ? `(demo) ${content ? `Ricevuto: "${content}". ` : ''}Collega un'IA in Impostazioni → Nucleo per parlare davvero con me.`
          : `(demo) ${content ? `Recibí: "${content}". ` : ''}Conecta una IA en Ajustes → Núcleo para hablar conmigo de verdad.`
  }

  const provider = getProviderById(connection.providerId)
  const apiKey = await useAiCredentialsStore.getState().getApiKeyForCall(connection.id)
  if (!apiKey) {
    return lang === 'en'
      ? 'Could not read your AI connection — check Settings → Core.'
      : lang === 'fr'
        ? 'Impossible de lire ta connexion IA — vérifie Paramètres → Cœur.'
        : lang === 'it'
          ? "Non è stato possibile leggere la tua connessione IA — controlla Impostazioni → Nucleo."
          : 'No pude leer tu conexión de IA — revisa Ajustes → Núcleo.'
  }

  const messages = [
    { role: 'system', content: npcPrompt },
    ...history.map(({ role, content: text }) => ({ role, content: text })),
    { role: 'user', content },
  ]

  const args = { apiKey, messages, model: connection.model || provider?.defaultModel, temperature, maxTokens }

  if (provider?.kind === 'native') {
    if (connection.providerId === 'minimax') return minimaxChatCompletion(args)
    if (connection.providerId === 'deepseek') return deepseekChatCompletion(args)
    if (connection.providerId === 'anthropic') return anthropicChatCompletion(args)
    if (connection.providerId === 'google') return googleChatCompletion(args)
  }
  const baseUrl = connection.baseUrl || provider?.defaultBaseUrl
  const message = await openaiCompatibleChatCompletion({ ...args, baseUrl })
  return message.content
}
