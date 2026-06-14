// Minimal Notion API client to push notes to a user's database. Only the
// configuration (API key + database id) lives in Ajustes — actual requests
// from the browser may be blocked by Notion's CORS policy, so failures are
// returned as `{ ok: false, error }` instead of thrown.
const NOTION_VERSION = '2022-06-28'

export function isNotionConfigured({ notionApiKey, notionDatabaseId } = {}) {
  return Boolean(notionApiKey && notionDatabaseId)
}

// Queries the configured database and returns a flat list of page titles +
// urls so the Notas page can render a "synced from Notion" section.
export async function fetchNotionPages({ notionApiKey, notionDatabaseId }) {
  if (!isNotionConfigured({ notionApiKey, notionDatabaseId })) {
    return { ok: false, error: 'Notion no está configurado.', pages: [] }
  }

  try {
    const res = await fetch(`https://api.notion.com/v1/databases/${notionDatabaseId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${notionApiKey}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ page_size: 20 }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => null)
      return { ok: false, error: body?.message || `Notion respondió ${res.status}`, pages: [] }
    }

    const data = await res.json()
    const pages = (data.results ?? []).map((page) => {
      const titleProp = Object.values(page.properties ?? {}).find((p) => p.type === 'title')
      const title = titleProp?.title?.map((t) => t.plain_text).join('') || 'Sin título'
      return { id: page.id, title, url: page.url }
    })
    return { ok: true, pages }
  } catch (err) {
    return {
      ok: false,
      error: err.message || 'No se pudo conectar con Notion (posible bloqueo CORS).',
      pages: [],
    }
  }
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
