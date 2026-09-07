import { minimaxChatCompletion } from '../chat/minimaxClient'
import { deepseekChatCompletion } from '../chat/deepseekClient'
import { anthropicChatCompletion } from '../chat/anthropicClient'
import { googleChatCompletion } from '../chat/googleClient'
import { openaiCompatibleChatCompletion } from '../chat/openaiCompatibleClient'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { useAiCredentialsStore } from '../../stores/useAiCredentialsStore'
import { useCourseContentStore } from '../../stores/useCourseContentStore'
import { getProviderById } from '../../data/aiProviderRegistry'
import { supabase } from '../supabase/client'

// El Oráculo de Oliver — generador de cursos completos con la conexión de IA
// del propio alumno (BYOK, mismo patrón que src/services/chat/npcTransport.js
// y transports.js, ver esos archivos para el "por qué" de esta forma de
// llamar a los 4 proveedores nativos + el genérico OpenAI-compatible).
//
// A diferencia del chat, aquí necesitamos SIEMPRE una respuesta JSON
// estricta y bien formada — ningún proveedor de los que ya soporta esta app
// tiene un "modo JSON" nativo cableado (ver aiProviderRegistry.js), así que
// la única defensa es el prompting ("responde SOLO JSON") + un parseo
// tolerante (parseAiJson, que pela un posible cerco de ```json) + UN reintento
// pidiéndole al modelo que corrija su propia salida si el primer parseo falla.

// maxTokens deliberadamente más alto que el default de chat
// (useSettingsStore, pensado para respuestas cortas de chat) — un temario o
// una clase completa en HTML necesita mucho más espacio.
const OUTLINE_MAX_TOKENS = 900
const LESSON_MAX_TOKENS = 2600

const OUTLINE_SYSTEM_PROMPT = `Eres un diseñador curricular experto. Te dan un tema y debes planear un curso completo, dividido en clases progresivas, de nivel introductorio a intermedio.

Responde ÚNICAMENTE con JSON estricto, sin bloques de código markdown (nada de \`\`\`), sin explicación antes ni después — solo el objeto JSON, empezando directamente con "{".

Formato exacto:
{
  "title": "Título corto y atractivo del curso",
  "description": "Descripción de 1-2 frases",
  "icon": "un solo emoji representativo",
  "color": "#rrggbb",
  "category": "una etiqueta corta relacionada con el tema",
  "modules": [
    { "title": "Título de la clase", "description": "Una frase describiendo qué se aprende" }
  ]
}

El array "modules" debe tener entre 5 y 8 elementos, en orden lógico de aprendizaje.`

const LESSON_SYSTEM_PROMPT = `Eres un profesor experto escribiendo el contenido completo de una clase para un curso online. Te dan el tema del curso, el título de la clase y una breve descripción de qué debe cubrir.

Responde ÚNICAMENTE con JSON estricto, sin bloques de código markdown (nada de \`\`\`), sin explicación antes ni después — solo el objeto JSON, empezando directamente con "{".

Formato exacto:
{
  "content": "HTML completo de la clase (NO markdown): usa <h2>, <h3>, <p>, <ul>/<li>, <strong>, <code> según haga falta. Debe ser sustancial — varios párrafos bien explicados, con ejemplos.",
  "quiz": {
    "question": "Una pregunta de opción múltiple sobre el contenido de la clase",
    "options": ["opción A", "opción B", "opción C", "opción D"],
    "correctIndex": 0
  }
}

"options" debe tener EXACTAMENTE 4 elementos, y "correctIndex" debe ser el índice (0 a 3) de la opción correcta.`

// Mensaje mostrado cuando no hay conexión de IA activa — mismo estilo que el
// fallback de npcTransport.js, pero sin las variantes multi-idioma (esta
// función solo se usa en español desde OraclePage.jsx).
const NO_CONNECTION_MESSAGE =
  'No tienes una conexión de IA activa. Conecta una en Ajustes → Núcleo para poder generar un curso.'

async function callAi(systemPrompt, userPrompt, maxTokens) {
  const { activeCredentialId, temperature } = useSettingsStore.getState()
  const connection = useAiCredentialsStore.getState().connections.find((c) => c.id === activeCredentialId)
  if (!connection) throw new Error(NO_CONNECTION_MESSAGE)

  const provider = getProviderById(connection.providerId)
  const apiKey = await useAiCredentialsStore.getState().getApiKeyForCall(connection.id)
  if (!apiKey) throw new Error('No pudimos leer tu conexión de IA — revisa Ajustes → Núcleo.')

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]
  const args = { apiKey, messages, model: connection.model || provider?.defaultModel, temperature, maxTokens }

  if (provider?.kind === 'native') {
    if (connection.providerId === 'minimax') return minimaxChatCompletion(args)
    if (connection.providerId === 'deepseek') return deepseekChatCompletion(args)
    if (connection.providerId === 'anthropic') return anthropicChatCompletion(args)
    if (connection.providerId === 'google') return googleChatCompletion(args)
  }
  const baseUrl = connection.baseUrl || provider?.defaultBaseUrl
  const message = await openaiCompatibleChatCompletion({ ...args, baseUrl })
  return message.content
}

// Pela un posible cerco ```json ... ``` (o ``` ... ```) antes de parsear.
// Lanza si el resultado no es JSON válido — el llamador decide si reintenta.
export function parseAiJson(raw) {
  const cleaned = String(raw ?? '')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
  return JSON.parse(cleaned)
}

// Llama a la IA y, si la respuesta no parsea como JSON, le pide UNA vez que
// corrija su propia salida antes de rendirse. Compartido por outline y
// lesson content — misma estrategia de recuperación para ambos.
async function callAiForJson(systemPrompt, userPrompt, maxTokens) {
  const first = await callAi(systemPrompt, userPrompt, maxTokens)
  try {
    return parseAiJson(first)
  } catch {
    const correction = await callAi(
      systemPrompt,
      `Tu respuesta anterior no era JSON válido. Responde de nuevo, ÚNICAMENTE con el JSON estricto pedido, sin ningún texto ni cerco de markdown alrededor. Esto es lo que habías respondido:\n\n${first}`,
      maxTokens,
    )
    return parseAiJson(correction) // si vuelve a fallar, se propaga el error
  }
}

export async function generateCourseOutline(topic) {
  const userPrompt = `Tema del curso: "${topic}"`
  return callAiForJson(OUTLINE_SYSTEM_PROMPT, userPrompt, OUTLINE_MAX_TOKENS)
}

export async function generateLessonContent(topic, courseTitle, moduleTitle, moduleDescription) {
  const userPrompt = `Curso: "${courseTitle}" (tema general: ${topic})\nClase: "${moduleTitle}"\nQué debe cubrir: ${moduleDescription}`
  return callAiForJson(LESSON_SYSTEM_PROMPT, userPrompt, LESSON_MAX_TOKENS)
}

// Sin librería de slugs en el resto del repo — versión mínima: minúsculas,
// sin acentos, todo lo que no sea alfanumérico se vuelve "-", sin guiones
// repetidos ni al inicio/final.
export function slugify(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Construye el objeto final del curso con la forma exacta que
// LearningInterface.jsx/ModuleQuiz.jsx/TextLesson.jsx esperan (ver
// investigación en el plan): ids de módulo NUMÉRICOS empezando en 1 (un id
// string deja ese módulo inalcanzable — LearningInterface.jsx hace
// Number(moduleId) sobre el parámetro de la URL), sin `type`/`videoId` (sin
// generación de video en esta versión), y `noChat: true` para que
// missionsRegistry.js no exija además una misión de chat con la mascota.
export function assembleCourse({ outline, lessons, userId }) {
  const id = `${slugify(outline.title)}-${crypto.randomUUID().slice(0, 8)}`

  const modules = lessons.map((lesson, i) => ({
    id: i + 1,
    order: i + 1,
    title: outline.modules[i]?.title ?? lesson.title ?? `Clase ${i + 1}`,
    description: outline.modules[i]?.description ?? '',
    content: lesson.content,
    quiz: {
      question: lesson.quiz.question,
      options: lesson.quiz.options,
      correctIndex: lesson.quiz.correctIndex,
    },
    resources: [],
    noChat: true,
  }))

  return {
    id,
    title: outline.title,
    description: outline.description,
    icon: outline.icon,
    color: outline.color,
    category: outline.category,
    subcategory: null,
    difficulty: null,
    locked: false,
    modules,
    translations: {},
    created_by: userId,
    ai_generated: true,
    ai_instructions: null,
  }
}

// Guarda el curso ya ensamblado y refresca el store en memoria para que
// getCourseData/hasCourseData (courseRegistry.js, un Proxy sobre
// useCourseContentStore) lo vean de inmediato — sin este refresh, redirigir
// a /learn/:id justo después chocaría con la caché vieja (el store solo
// carga una vez al arrancar la app, ver useCourseContentStore.js).
export async function saveGeneratedCourse(course) {
  const { data, error } = await supabase.from('courses').insert(course).select().single()
  if (error) throw error
  useCourseContentStore.setState({ loaded: false })
  await useCourseContentStore.getState().fetchAll()
  return data
}
