// Generic client for any provider that speaks the OpenAI chat-completions
// format — covers OpenAI itself, Groq, Mistral, OpenRouter, xAI/Grok,
// Together, Fireworks, local Ollama/LM Studio, and anything else exposing
// a `/chat/completions` endpoint. baseUrl is provided by the user (or a
// built-in default for known providers) since this is what makes the
// adapter generic instead of one-per-provider.
export async function openaiCompatibleChatCompletion({
  apiKey,
  baseUrl,
  messages,
  model,
  temperature,
  maxTokens,
  tools,
}) {
  if (!apiKey) throw new Error('Missing API key')
  if (!baseUrl) throw new Error('Missing base URL')

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
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
      ...(tools?.length ? { tools } : {}),
    }),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${await response.text().catch(() => '')}`)
  }

  const data = await response.json()
  const message = data.choices?.[0]?.message
  if (!message) throw new Error('API returned no message')
  return message // { content, tool_calls? } — caller decides how to handle tool_calls
}
