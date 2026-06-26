// Google Gemini client (generateContent API — its own shape: "contents"
// with role "user"/"model" instead of "user"/"assistant", system prompt as
// a separate top-level field, and the API key goes in the query string).
const DEFAULT_MODEL = 'gemini-2.0-flash'

export async function googleChatCompletion({ apiKey, messages, model = DEFAULT_MODEL, temperature, maxTokens }) {
  if (!apiKey) throw new Error('Missing Google API key')

  const system = messages.find((m) => m.role === 'system')?.content
  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }))

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
      generationConfig: {
        ...(temperature != null ? { temperature } : {}),
        ...(maxTokens != null ? { maxOutputTokens: maxTokens } : {}),
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Google API error: ${response.status} ${await response.text().catch(() => '')}`)
  }

  const data = await response.json()
  const content = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('')
  if (!content) throw new Error('Google API returned no content')
  return content
}
