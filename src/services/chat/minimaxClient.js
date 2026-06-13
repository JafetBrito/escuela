// Minimax chat completions client (OpenAI-compatible message format).
// The API key travels embedded in the user's license file (see keyCrypto.js)
// and is sent directly from the browser — acceptable for this architecture
// per the project's security model (no backend to proxy it through).
//
// Verify endpoint/model names against current Minimax docs before shipping;
// adjust MINIMAX_API_URL / default model as needed.
const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_v2'
const DEFAULT_MODEL = 'abab6.5s-chat'

export async function minimaxChatCompletion({ apiKey, messages, model = DEFAULT_MODEL }) {
  if (!apiKey) {
    throw new Error('Missing Minimax API key')
  }

  const response = await fetch(MINIMAX_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages }),
  })

  if (!response.ok) {
    throw new Error(`Minimax API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('Minimax API returned no content')
  }
  return content
}
