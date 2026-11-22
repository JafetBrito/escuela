import { callAiGateway } from '../../services/chat/aiGateway'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { useAiCredentialsStore } from '../../stores/useAiCredentialsStore'
import { getProviderById } from '../../data/aiProviderRegistry'
import { parseAiJson } from '../../services/ai/courseGenerator'

// Asistente de IA del editor de Oliver Racing: traduce preguntas y misiones y genera preguntas nuevas con la conexión de IA del propio usuario
// (la misma de Ajustes → Núcleo; BYOK). Siempre pide JSON estricto y reintenta una vez si no parsea (mismo patrón que courseGenerator.js).
const LANG_NAME = { en: 'English', fr: 'Français' }
const NO_CONNECTION = 'No tienes una conexión de IA activa. Conecta una en Ajustes → Núcleo.'

async function callAi(system, user, maxTokens) {
  const { activeCredentialId, temperature } = useSettingsStore.getState()
  const connection = useAiCredentialsStore.getState().connections.find((c) => c.id === activeCredentialId)
  if (!connection) throw new Error(NO_CONNECTION)
  const provider = getProviderById(connection.providerId)
  const apiKey = await useAiCredentialsStore.getState().getApiKeyForCall(connection.id)
  if (!apiKey) throw new Error('No pudimos leer tu conexión de IA — revisa Ajustes → Núcleo.')
  return callAiGateway({
    apiKey, messages: [{ role: 'system', content: system }, { role: 'user', content: user }], providerId: connection.providerId,
    model: connection.model || provider?.defaultModel, baseUrl: connection.baseUrl || provider?.defaultBaseUrl, temperature, maxTokens,
  })
}
async function aiJson(system, user, maxTokens) {
  const first = await callAi(system, user, maxTokens)
  try { return parseAiJson(first) } catch {
    return parseAiJson(await callAi(system, `Tu respuesta anterior no era JSON válido. Responde de nuevo ÚNICAMENTE con el JSON pedido, sin texto ni cercos de markdown. Esto habías respondido:\n\n${first}`, maxTokens))
  }
}

// Traduce una pregunta (texto, correcta, trampas, dato y explicación detallada) → { q, ok, bad: [], fact, deep: 'párrafo1|párrafo2' }
export async function translateQuestion(q, lang) {
  const system = `Eres un traductor educativo. Traduce al ${LANG_NAME[lang]} una pregunta de un juego de aprendizaje, conservando el sentido, el tono claro y los nombres propios. Responde SOLO un JSON con este formato exacto: {"q":"","ok":"","bad":["",""],"fact":"","deep":"párrafo 1|párrafo 2"}. "bad" debe tener el mismo número de elementos que el original. En "deep" separa los párrafos con el carácter |.`
  const out = await aiJson(system, JSON.stringify({ q: q.q, ok: q.ok, bad: q.bad, fact: q.fact, deep: (q.deep || []).join('|') }), 1500)
  return { q: String(out.q || ''), ok: String(out.ok || ''), bad: (out.bad || []).map(String), fact: String(out.fact || ''), deep: String(out.deep || '') }
}

// Traduce una misión (nombre, introducción y episodios de la historia) → { name, intro, story: [] }
export async function translateMission(m, lang) {
  const system = `Eres un traductor educativo. Traduce al ${LANG_NAME[lang]} el nombre, la introducción y los episodios de historia de una misión de un juego de aprendizaje. Responde SOLO un JSON: {"name":"","intro":"","story":["","","",""]} con el mismo número de episodios que el original.`
  const out = await aiJson(system, JSON.stringify({ name: m.name, intro: m.intro, story: m.story }), 1800)
  return { name: String(out.name || ''), intro: String(out.intro || ''), story: (out.story || []).map(String) }
}

// Genera `count` preguntas nuevas de un tema y dificultad (0 muy fácil … 4 muy difícil), con explicación detallada de 2 párrafos
export async function generateQuestions({ worldName, levelName, topic, lvl, count, existing = [] }) {
  const system = `Eres un autor de preguntas educativas para un juego de carreras llamado Oliver Racing, del mundo "${worldName}" (nivel "${levelName}"). Escribe preguntas de opción múltiple correctas, claras y verificables, en español. Cada pregunta tiene UNA respuesta correcta y 2 trampas plausibles pero claramente incorrectas, un dato curioso breve (1 oración), un emoji que la ilustre y una explicación detallada de DOS párrafos (separados por el carácter |) que explique por qué la respuesta es correcta con contexto interesante y por qué las otras no. Dificultad: ${lvl} en una escala de 0 (muy fácil, primaria) a 4 (difícil, universitaria). Responde SOLO un JSON: {"questions":[{"q":"","ok":"","bad":["",""],"fact":"","img":"🙂","deep":"párrafo 1|párrafo 2"}]} con exactamente ${count} preguntas. No repitas estas ya existentes: ${existing.slice(0, 60).join(' / ')}`
  const out = await aiJson(system, `Tema: ${topic}`, 3800)
  return (out.questions || []).map((x) => ({ t: topic, lvl, q: String(x.q || ''), ok: String(x.ok || ''), bad: (x.bad || []).map(String).slice(0, 2), fact: String(x.fact || ''), img: String(x.img || '💡'), deep: String(x.deep || '').split('|').filter(Boolean) }))
}
