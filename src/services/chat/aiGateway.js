import { supabase } from '../supabase/client'

// Único punto del navegador que "llama a la IA" — internamente invoca la
// Edge Function ai-chat (supabase/functions/ai-chat/index.ts), que hace el
// fetch() real al proveedor del lado del servidor. Antes cada uno de los 4
// call sites (npcTransport.js, transports.js, toolRuntime.js,
// courseGenerator.js) despachaba directo a uno de los 5 archivos cliente
// (minimaxClient.js, deepseekClient.js, anthropicClient.js, googleClient.js,
// openaiCompatibleClient.js, ahora eliminados) con un fetch() desde el
// navegador — bloqueado en silencio por CORS en al menos DeepSeek. Ver la
// Edge Function para el porqué completo.
//
// Forma de retorno pensada para ser un reemplazo mínimo de esos 5 archivos:
// los 4 proveedores "nativos" devolvían un string plano, y
// openaiCompatibleChatCompletion devolvía { content, tool_calls? } — así que
// aquí devolvemos un string plano cuando no hay tool_calls, y el objeto
// completo cuando sí los hay (el único caso real es toolRuntime.js, que ya
// esperaba ese shape).
export async function callAiGateway({ apiKey, providerId, model, baseUrl, messages, temperature, maxTokens, tools }) {
  if (!apiKey) throw new Error('Missing API key')

  const { data, error } = await supabase.functions.invoke('ai-chat', {
    body: { providerId, apiKey, model, baseUrl, messages, temperature, maxTokens, tools },
  })

  // Igual que useEmailStore.sendEmail: cuando la función responde con un
  // status != 2xx, supabase-js NO mete el JSON de error en `error.message`
  // (queda el genérico "Edge Function returned a non-2xx status code") — el
  // body real vive en `error.context` (el Response crudo), hay que leerlo
  // aparte para propagar el mensaje real del proveedor (ej. "DeepSeek API
  // error: 401") en vez de un mensaje genérico inútil.
  if (error) {
    let message = error.message
    if (error.context && typeof error.context.json === 'function') {
      try {
        const body = await error.context.clone().json()
        if (body?.message) message = body.message
      } catch {
        // el body no era JSON parseable — se queda con el mensaje genérico
      }
    }
    throw new Error(message)
  }

  if (!data?.success) {
    throw new Error(data?.message || 'Error desconocido llamando a la IA.')
  }

  if (data.tool_calls?.length) {
    return { content: data.content, tool_calls: data.tool_calls }
  }
  return data.content
}
