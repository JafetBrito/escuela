import { callAiGateway } from './aiGateway'
import { useProgressStore } from '../../stores/useProgressStore'
import { useInventoryStore } from '../../stores/useInventoryStore'
import { COURSES_DATA } from '../../data/courseRegistry'

// Real function-calling tools (OpenAI tools schema) — only wired for
// providers that speak that format (see providerSupportsTools in
// aiProviderRegistry.js). Each entry pairs the schema the model sees with
// the actual function that runs when it's invoked.
const TOOL_DEFS = {
  course_progress: {
    schema: {
      type: 'function',
      function: {
        name: 'course_progress',
        description: 'Devuelve en qué clase va el estudiante en cada curso que ha empezado.',
        parameters: { type: 'object', properties: {} },
      },
    },
    run: () => {
      const { progress } = useProgressStore.getState()
      const entries = Object.entries(progress)
      if (!entries.length) return 'El estudiante no ha empezado ningún curso todavía.'
      return entries
        .map(([courseId, state]) => {
          const course = COURSES_DATA[courseId]
          const done = state.moduleProgress?.length ?? 0
          const total = course?.modules?.length ?? '?'
          return `${course?.title ?? courseId}: ${done}/${total} clases completadas, clase actual: ${state.selectedModuleId ?? 'ninguna'}.`
        })
        .join('\n')
    },
  },
  search_notes: {
    schema: {
      type: 'function',
      function: {
        name: 'search_notes',
        description: 'Busca dentro de las notas guardadas por el estudiante en la app.',
        parameters: {
          type: 'object',
          properties: { query: { type: 'string', description: 'Palabra o frase a buscar' } },
          required: ['query'],
        },
      },
    },
    run: ({ query }) => {
      const items = useInventoryStore.getState().items
      const q = (query ?? '').toLowerCase()
      const matches = items.filter((i) => i.text?.toLowerCase().includes(q))
      if (!matches.length) return `No encontré notas que mencionen "${query}".`
      return matches.slice(0, 5).map((i) => `- ${i.text}`).join('\n')
    },
  },
}

// One round of tool-calling: ask the model with tools available; if it asks
// to call one (or more), run them locally and send the results back for a
// final answer. Capped at a single round — enough for "look something up
// and answer", not a general agent loop.
export async function runToolLoop({ apiKey, providerId, baseUrl, model, messages, temperature, maxTokens, toolsEnabled }) {
  const tools = toolsEnabled.filter((id) => TOOL_DEFS[id]).map((id) => TOOL_DEFS[id].schema)
  if (!tools.length) {
    return callAiGateway({ apiKey, providerId, baseUrl, model, messages, temperature, maxTokens })
  }

  const first = await callAiGateway({ apiKey, providerId, baseUrl, model, messages, temperature, maxTokens, tools })
  // callAiGateway returns a plain string when there are no tool_calls, or
  // { content, tool_calls } when there are — same shape
  // openaiCompatibleChatCompletion used to return, which this loop already
  // expected.
  if (typeof first === 'string' || !first.tool_calls?.length) {
    return typeof first === 'string' ? first : first.content
  }

  const toolResults = first.tool_calls.map((call) => {
    const def = TOOL_DEFS[call.function.name]
    const args = JSON.parse(call.function.arguments || '{}')
    const result = def ? def.run(args) : `Herramienta desconocida: ${call.function.name}`
    return { role: 'tool', tool_call_id: call.id, content: String(result) }
  })

  const followUp = await callAiGateway({
    apiKey, providerId, baseUrl, model, temperature, maxTokens,
    messages: [...messages, { role: 'assistant', content: first.content, tool_calls: first.tool_calls }, ...toolResults],
  })
  return typeof followUp === 'string' ? followUp : followUp.content
}
