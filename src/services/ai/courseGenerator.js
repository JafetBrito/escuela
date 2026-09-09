import { callAiGateway } from '../chat/aiGateway'
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
// una clase completa en HTML necesita mucho más espacio. La versión "con
// misiones" pide más porque el JSON de la clase crece con exercise+missionChat.
const OUTLINE_MAX_TOKENS = 900
const LESSON_MAX_TOKENS = 2600
const LESSON_MAX_TOKENS_WITH_MISSIONS = 3200

// Lista propia y deliberadamente CORTA — NO reutiliza SUPPORTED_LANGUAGES/
// LANGUAGE_NAMES de src/i18n. Esa lista incluye locales curados a mano sin
// traducción real (náhuatl, yup'ik, dakota, "pirata", castellano antiguo,
// etc.) pensados para strings de interfaz ya revisadas — dejar que un LLM
// genérico invente contenido educativo libre en esos idiomas es un riesgo
// real de contenido inexacto o irrespetuoso, muy distinto a texto de UI ya
// curado. Aquí solo idiomas donde un LLM mayor típicamente escribe bien.
export const ORACLE_LANGUAGES = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'pt', label: 'Português' },
  { code: 'it', label: 'Italiano' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文' },
]

export const ORACLE_DIFFICULTIES = [
  { id: 'principiante', label: 'Principiante' },
  { id: 'intermedio', label: 'Intermedio' },
  { id: 'avanzado', label: 'Avanzado' },
]

const LANGUAGE_INSTRUCTION = (language) => {
  const found = ORACLE_LANGUAGES.find((l) => l.code === language)
  return found && found.code !== 'es'
    ? `\n\nEscribe TODO el contenido (títulos, descripciones, texto) en ${found.label}, aunque estas instrucciones estén en español.`
    : ''
}

function buildOutlineSystemPrompt({ difficulty, audience, moduleCount, language }) {
  const difficultyLabel = ORACLE_DIFFICULTIES.find((d) => d.id === difficulty)?.label ?? 'Intermedio'
  return `Eres un diseñador curricular experto. Te dan un tema y debes planear un curso completo, dividido en clases progresivas.

Nivel del curso: ${difficultyLabel}.${audience?.trim() ? `\nPúblico objetivo: ${audience.trim()}.` : ''}

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

El array "modules" debe tener EXACTAMENTE ${moduleCount} elementos, en orden lógico de aprendizaje.${LANGUAGE_INSTRUCTION(language)}`
}

function buildLessonSystemPrompt({ includeMissions, language }) {
  const missionsFields = includeMissions
    ? `,
  "exercise": "una consigna corta de reflexión o práctica para que el alumno aplique lo aprendido en esta clase (string vacío \\"\\" si de verdad no aplica)",
  "missionChat": { "label": "una instrucción corta pidiéndole al alumno que le cuente algo a su mascota sobre esta clase", "hint": "una pista de 1 línea sobre cómo responder" }`
    : ''
  return `Eres un profesor experto escribiendo el contenido completo de una clase para un curso online. Te dan el tema del curso, el título de la clase y una breve descripción de qué debe cubrir.

Responde ÚNICAMENTE con JSON estricto, sin bloques de código markdown (nada de \`\`\`), sin explicación antes ni después — solo el objeto JSON, empezando directamente con "{".

Formato exacto:
{
  "content": "HTML completo de la clase (NO markdown): usa <h2>, <h3>, <p>, <ul>/<li>, <strong>, <code> según haga falta. Debe ser sustancial — varios párrafos bien explicados, con ejemplos.",
  "quiz": {
    "question": "Una pregunta de opción múltiple sobre el contenido de la clase",
    "options": ["opción A", "opción B", "opción C", "opción D"],
    "correctIndex": 0
  },
  "imageQuery": "una frase corta y específica en inglés para buscar UNA imagen real relacionada en Wikimedia Commons (ej. \\"Louis Armstrong trumpet 1950s\\"), o \\"\\" si no hay nada visual obvio que buscar",
  "resourceQuery": "un título o tema concreto para buscar UN artículo relacionado en Wikipedia, o \\"\\" si no aplica"${missionsFields}
}

"options" debe tener EXACTAMENTE 4 elementos, y "correctIndex" debe ser el índice (0 a 3) de la opción correcta.${LANGUAGE_INSTRUCTION(language)}`
}

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
  const baseUrl = connection.baseUrl || provider?.defaultBaseUrl

  return callAiGateway({
    apiKey, messages, providerId: connection.providerId,
    model: connection.model || provider?.defaultModel, baseUrl, temperature, maxTokens,
  })
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

export async function generateCourseOutline(topic, { difficulty = 'intermedio', audience = '', moduleCount = 6, language = 'es' } = {}) {
  const userPrompt = `Tema del curso: "${topic}"`
  return callAiForJson(buildOutlineSystemPrompt({ difficulty, audience, moduleCount, language }), userPrompt, OUTLINE_MAX_TOKENS)
}

export async function generateLessonContent(
  topic, courseTitle, moduleTitle, moduleDescription,
  { includeMissions = false, language = 'es' } = {},
) {
  const userPrompt = `Curso: "${courseTitle}" (tema general: ${topic})\nClase: "${moduleTitle}"\nQué debe cubrir: ${moduleDescription}`
  const maxTokens = includeMissions ? LESSON_MAX_TOKENS_WITH_MISSIONS : LESSON_MAX_TOKENS
  return callAiForJson(buildLessonSystemPrompt({ includeMissions, language }), userPrompt, maxTokens)
}

// Estimado de costo ANTES de generar, mostrado en el formulario — a
// propósito en llamadas/tokens, NUNCA en dinero: esta app no rastrea precios
// por proveedor/modelo (es BYOK, cada quien paga su propia llave), así que
// cualquier cifra en $ sería inventada. "Peor caso" asume que cada llamada
// necesita su único reintento de auto-corrección (ver callAiForJson).
export function estimateGenerationCost({ moduleCount, includeMissions }) {
  const lessonMaxTokens = includeMissions ? LESSON_MAX_TOKENS_WITH_MISSIONS : LESSON_MAX_TOKENS
  const aiCallsBest = 1 + moduleCount
  const aiCallsWorst = aiCallsBest * 2
  const estimatedOutputTokens = OUTLINE_MAX_TOKENS + moduleCount * lessonMaxTokens
  return { aiCallsBest, aiCallsWorst, estimatedOutputTokens }
}

// ─── Imágenes y recursos reales — mejor esfuerzo, fuentes abiertas ────────
// Corre EN EL NAVEGADOR del alumno (mismo lugar que el resto de las llamadas
// BYOK) — por eso no puede mandar un header User-Agent propio (los
// navegadores lo prohíben en fetch(), a diferencia del `curl -A "..."` que sí
// se pudo usar desde un agente/Node para el curso de Medicina). En su lugar
// se usa el mecanismo CORS que MediaWiki documenta para apps web:
// `&origin=*` habilita Access-Control-Allow-Origin para peticiones anónimas
// del navegador — tráfico normal y esperado (un puñado de llamadas por
// curso generado), nada parecido al scraping masivo.
const ALLOWED_LICENSES = /public domain|cc0|cc[- ]by(?:[- ]sa)?/i

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

function stripHtml(s) {
  return String(s ?? '').replace(/<[^>]*>/g, '').trim()
}

async function resolveImage(query) {
  if (!query?.trim()) return null
  try {
    const search = await fetch(
      `https://commons.wikimedia.org/w/api.php?action=query&list=search&srnamespace=6&srlimit=5&format=json&origin=*&srsearch=${encodeURIComponent(query)}`,
    ).then((r) => r.json())
    for (const hit of search?.query?.search ?? []) {
      const info = await fetch(
        `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(hit.title)}&prop=imageinfo&iiprop=url|extmetadata&format=json&origin=*`,
      ).then((r) => r.json())
      const imageinfo = Object.values(info?.query?.pages ?? {})[0]?.imageinfo?.[0]
      const license = imageinfo?.extmetadata?.LicenseShortName?.value ?? ''
      if (imageinfo?.url && ALLOWED_LICENSES.test(license)) {
        const artist = stripHtml(imageinfo.extmetadata?.Artist?.value)
        return { url: imageinfo.url, credit: artist || 'Wikimedia Commons', license }
      }
    }
  } catch (err) {
    console.warn('[courseGenerator] resolveImage omitido:', err)
  }
  return null
}

async function resolveResource(query, lang = 'es') {
  if (!query?.trim()) return null
  const wikiLang = ORACLE_LANGUAGES.some((l) => l.code === lang) ? lang : 'es'
  try {
    const search = await fetch(
      `https://${wikiLang}.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srsearch=${encodeURIComponent(query)}`,
    ).then((r) => r.json())
    const hit = search?.query?.search?.[0]
    if (!hit) return null
    return { label: hit.title, url: `https://${wikiLang}.wikipedia.org/wiki/${encodeURIComponent(hit.title.replace(/ /g, '_'))}` }
  } catch (err) {
    console.warn('[courseGenerator] resolveResource omitido:', err)
  }
  return null
}

// Resuelve imagen + recurso de una clase ya generada (en paralelo) — nunca
// lanza: un fallo de red, sin resultados, o una licencia no aceptable se
// traduce en `null`, y esa clase simplemente queda sin imagen/recurso.
export async function enrichLessonWithMedia(lesson, { language = 'es' } = {}) {
  const [image, resource] = await Promise.all([
    resolveImage(lesson.imageQuery),
    resolveResource(lesson.resourceQuery, language),
  ])
  return { ...lesson, image, resource }
}

// Sin librería de slugs en el resto del repo — versión mínima: minúsculas,
// sin acentos, todo lo que no sea alfanumérico se vuelve "-", sin guiones
// repetidos ni al inicio/final.
export function slugify(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Construye el objeto final del curso con la forma exacta que
// LearningInterface.jsx/ModuleQuiz.jsx/TextLesson.jsx esperan (ver
// investigación en el plan): ids de módulo NUMÉRICOS empezando en 1 (un id
// string deja ese módulo inalcanzable — LearningInterface.jsx hace
// Number(moduleId) sobre el parámetro de la URL), sin `type`/`videoId` (sin
// generación de video en esta versión), y `noChat: true` cuando no hay
// misiones (para que missionsRegistry.js no exija además una conversación
// con la mascota).
export function assembleCourse({ outline, lessons, userId, difficulty = null, includeMissions = false }) {
  const id = `${slugify(outline.title)}-${crypto.randomUUID().slice(0, 8)}`

  const modules = lessons.map((lesson, i) => {
    const imageBlock = lesson.image
      ? `<img src="${escapeHtml(lesson.image.url)}" alt="${escapeHtml(outline.modules[i]?.title ?? '')}" style="width:100%;max-width:420px;display:block;margin:0 auto 1rem auto;border-radius:12px;background:#fff" /><p style="text-align:center;font-size:0.75rem;opacity:.6;margin-top:-0.75rem;margin-bottom:1.5rem">${escapeHtml(lesson.image.credit)} — ${escapeHtml(lesson.image.license)}, Wikimedia Commons</p>`
      : ''

    const base = {
      id: i + 1,
      order: i + 1,
      title: outline.modules[i]?.title ?? lesson.title ?? `Clase ${i + 1}`,
      description: outline.modules[i]?.description ?? '',
      content: imageBlock + lesson.content,
      quiz: {
        question: lesson.quiz.question,
        options: lesson.quiz.options,
        correctIndex: lesson.quiz.correctIndex,
      },
      resources: lesson.resource ? [lesson.resource] : [],
    }

    if (includeMissions && lesson.exercise?.trim()) {
      return {
        ...base,
        exercises: [{ id: `m${i + 1}-1`, type: 'challenge', prompt: lesson.exercise.trim(), solution: '' }],
        missions: lesson.missionChat?.label ? { chat: { label: lesson.missionChat.label, hint: lesson.missionChat.hint ?? '' } } : undefined,
      }
    }
    return { ...base, exercises: [], noChat: true }
  })

  return {
    id,
    title: outline.title,
    description: outline.description,
    icon: outline.icon,
    color: outline.color,
    category: outline.category,
    subcategory: null,
    difficulty,
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

// Llamado desde "Mis Cursos IA" cuando el alumno pide revisión humana — ver
// migration_060.sql (función de confianza que valida dueño, cambia el
// estado, y notifica a todos los admins en una sola operación).
export async function requestCourseReview(courseId) {
  const { error } = await supabase.rpc('request_course_review', { p_course_id: courseId })
  if (error) throw error
}
