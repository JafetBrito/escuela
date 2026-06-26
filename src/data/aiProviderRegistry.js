// Single source of truth for "qué proveedores de IA aceptamos". Most modern
// providers speak the same OpenAI chat-completions format, so instead of
// writing one adapter per provider we have ONE generic adapter
// (openaiCompatibleClient.js) reused by several registry entries that only
// differ in their default base URL — plus 3 native adapters for the
// providers whose API shape is genuinely different (MiniMax, Anthropic,
// Google).
export const AI_PROVIDERS = [
  { id: 'minimax', label: 'MiniMax', kind: 'native', requiresBaseUrl: false,
    defaultModel: 'abab6.5s-chat' },
  { id: 'deepseek', label: 'DeepSeek', kind: 'native', requiresBaseUrl: false,
    defaultModel: 'deepseek-chat' },
  { id: 'anthropic', label: 'Anthropic (Claude)', kind: 'native', requiresBaseUrl: false,
    defaultModel: 'claude-sonnet-4-5' },
  { id: 'google', label: 'Google (Gemini)', kind: 'native', requiresBaseUrl: false,
    defaultModel: 'gemini-2.0-flash' },
  { id: 'openai', label: 'OpenAI', kind: 'openai_compatible', requiresBaseUrl: false,
    defaultBaseUrl: 'https://api.openai.com/v1', defaultModel: 'gpt-4o-mini' },
  { id: 'groq', label: 'Groq', kind: 'openai_compatible', requiresBaseUrl: false,
    defaultBaseUrl: 'https://api.groq.com/openai/v1', defaultModel: 'llama-3.3-70b-versatile' },
  { id: 'openrouter', label: 'OpenRouter', kind: 'openai_compatible', requiresBaseUrl: false,
    defaultBaseUrl: 'https://openrouter.ai/api/v1', defaultModel: 'openai/gpt-4o-mini' },
  { id: 'custom', label: 'Otro (compatible con OpenAI)', kind: 'openai_compatible', requiresBaseUrl: true,
    defaultBaseUrl: '', defaultModel: '' },
]

export function getProviderById(id) {
  return AI_PROVIDERS.find((p) => p.id === id) ?? null
}

// Tool-calling (Herramientas en Ajustes) is only wired today for providers
// that speak the OpenAI tools format — kind 'openai_compatible'. Anthropic
// and Gemini have their own (different) tool-call schemas; add adapters for
// those later instead of pretending it works.
export function providerSupportsTools(id) {
  return getProviderById(id)?.kind === 'openai_compatible'
}
