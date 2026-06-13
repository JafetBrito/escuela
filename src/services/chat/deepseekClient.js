// DeepSeek chat completions client (OpenAI-compatible message format).
// Like minimaxClient.js, the API key is sent directly from the browser —
// acceptable for this architecture per the project's security model (no
// backend to proxy it through).
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'
const DEFAULT_MODEL = 'deepseek-chat'

export async function deepseekChatCompletion({
  apiKey,
  messages,
  model = DEFAULT_MODEL,
  temperature,
  maxTokens,
}) {
  if (!apiKey) {
    throw new Error('Missing DeepSeek API key')
  }

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      ...(temperature != null ? { temperature } : {}),
      ...(maxTokens != null ? { max_tokens: maxTokens } : {}),
    }),
  })

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('DeepSeek API returned no content')
  }
  return content
}
