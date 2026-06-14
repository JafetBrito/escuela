// Minimal Notion API client to push notes to a user's database. Only the
// configuration (API key + database id) lives in Ajustes — actual requests
// from the browser may be blocked by Notion's CORS policy, so failures are
// returned as `{ ok: false, error }` instead of thrown.
const NOTION_VERSION = '2022-06-28'

export function isNotionConfigured({ notionApiKey, notionDatabaseId } = {}) {
  return Boolean(notionApiKey && notionDatabaseId)
}

export async function pushNoteToNotion({ notionApiKey, notionDatabaseId }, note) {
  if (!isNotionConfigured({ notionApiKey, notionDatabaseId })) {
    return { ok: false, error: 'Notion no está configurado.' }
  }

  const title = note.text?.slice(0, 200) || note.url || 'Nota de Oliver School'

  try {
    const res = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${notionApiKey}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { database_id: notionDatabaseId },
        properties: {
          Name: { title: [{ text: { content: title } }] },
        },
        children: [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ text: { content: note.url ? `${note.text ?? ''}\n${note.url}` : note.text ?? '' } }],
            },
          },
        ],
      }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => null)
      return { ok: false, error: body?.message || `Notion respondió ${res.status}` }
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err.message || 'No se pudo conectar con Notion (posible bloqueo CORS).' }
  }
}
