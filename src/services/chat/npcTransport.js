import { minimaxChatCompletion } from './minimaxClient'
import { deepseekChatCompletion } from './deepseekClient'
import { useSettingsStore, getModelProvider } from '../../stores/useSettingsStore'

// Lightweight chat transport for in-character NPCs (Zafir in la Tienda, el
// Mago de Misiones). Reuses the same Minimax/DeepSeek credentials configured
// in Ajustes, but with a fixed per-NPC system prompt instead of the
// mascot's configurable personality.
export async function sendNpcMessage({ npcPrompt, content, history = [] }) {
  const { minimaxApiKey, deepseekApiKey, chatModel, temperature, maxTokens } =
    useSettingsStore.getState()
  const provider = getModelProvider(chatModel)
  const apiKey = provider === 'deepseek' ? deepseekApiKey : minimaxApiKey

  if (!apiKey || apiKey.startsWith('mx-mock')) {
    const providerLabel = provider === 'deepseek' ? 'DeepSeek' : 'Minimax'
    return `(demo) ${content ? `Recibí: "${content}". ` : ''}Conecta tu ${providerLabel} API key en Ajustes para hablar conmigo de verdad.`
  }

  const messages = [
    { role: 'system', content: npcPrompt },
    ...history.map(({ role, content: text }) => ({ role, content: text })),
    { role: 'user', content },
  ]

  const completionFn = provider === 'deepseek' ? deepseekChatCompletion : minimaxChatCompletion
  return completionFn({
    apiKey,
    messages,
    model: chatModel,
    ...(temperature != null ? { temperature } : {}),
    ...(maxTokens != null ? { maxTokens } : {}),
  })
}
