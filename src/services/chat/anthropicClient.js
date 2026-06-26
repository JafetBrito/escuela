// Anthropic Claude client (Messages API — different shape than OpenAI's:
// `system` is a top-level field, not a message with role "system").
// `anthropic-dangerous-direct-browser-access` is Anthropic's own documented
// header for calling the API straight from a browser instead of a backend —
// without it, the request is blocked by CORS.
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const DEFAULT_MODEL = 'claude-sonnet-4-5'
const DEFAULT_MAX_TOKENS = 1024

export async function anthropicChatCompletion({ apiKey, messages, model = DEFAULT_MODEL, temperature, maxTokens }) {
  if (!apiKey) throw new Error('Missing Anthropic API key')

  const system = messages.find((m) => m.role === 'system')?.content
  const turns = messages.filter((m) => m.role !== 'system')

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      messages: turns,
      ...(system ? { system } : {}),
      max_tokens: maxTokens ?? DEFAULT_MAX_TOKENS,
      ...(temperature != null ? { temperature } : {}),
    }),
  })

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status} ${await response.text().catch(() => '')}`)
  }

  const data = await response.json()
  const content = data.content?.map((block) => block.text ?? '').join('')
  if (!content) throw new Error('Anthropic API returned no content')
  return content
}
