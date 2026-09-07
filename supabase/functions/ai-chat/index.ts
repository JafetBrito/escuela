// supabase/functions/ai-chat/index.ts
//
// Gateway server-side para TODA llamada a un proveedor de IA de esta app
// (mascota, NPCs de VR, "El Oráculo de Oliver", modo agente con
// herramientas). Antes cada uno de esos 4 call sites hacía un fetch()
// directo desde el navegador a la API del proveedor (ver
// src/services/chat/{minimax,deepseek,anthropic,google,openaiCompatible}Client.js,
// ahora eliminados) — pero la mayoría de las APIs de LLM no mandan headers
// CORS permisivos (están pensadas para uso server-side), así que el
// navegador bloqueaba la respuesta en silencio (fetch() rechaza con un
// "Failed to fetch" opaco, sin pista útil). Un servidor llamando a otro
// servidor no tiene restricción CORS — por eso esta función existe.
//
// La llave del usuario (BYOK, ver useAiCredentialsStore.js) sigue viviendo
// exactamente donde vivía (tabla ai_credentials, RLS dueño-only) — lo único
// que cambia es QUIÉN hace la llamada saliente al proveedor. La llave viaja
// en el body de esta función (no como Deno secret, porque es la llave de
// CADA usuario, no una sola llave del proyecto) y nunca se escribe en logs
// ni en mensajes de error — tratarla como sensible aunque solo pase por
// aquí de forma efímera, igual que ya pasaba brevemente por el navegador.
//
// No requiere secrets nuevos — SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY/
// SUPABASE_ANON_KEY los inyecta la plataforma sola en toda Edge Function.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

// ─── CORS ────────────────────────────────────────────────────────────────
// Mismo snippet que send-email/index.ts — sin esto el navegador bloquea la
// respuesta del preflight OPTIONS antes de que supabase.functions.invoke()
// llegue a ver el resultado real.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

type ChatMessage = { role: string; content: string; [key: string]: unknown }

type GatewayRequestBody = {
  providerId?: string
  apiKey?: string
  model?: string
  baseUrl?: string
  messages?: ChatMessage[]
  temperature?: number
  maxTokens?: number
  tools?: unknown[]
}

// { content } para los proveedores nativos, { content, tool_calls } para
// openai-compatible — misma forma que openaiCompatibleClient.js devolvía.
type ProviderResult = { content: string; tool_calls?: unknown[] }

// Los 4 proveedores "nativos" (shape de request/response distinta a la de
// OpenAI). Cualquier otro providerId (openai, groq, openrouter, custom, o
// cualquier otro que el front mande) se trata como openai-compatible usando
// el baseUrl que mandó el llamador — igual que aiProviderRegistry.js hace
// en el navegador, re-codificado aquí en chico porque un archivo .js de
// src/ no se puede importar dentro de una función Deno.
const NATIVE_PROVIDER_IDS = new Set(['minimax', 'deepseek', 'anthropic', 'google'])

// ─── Minimax ────────────────────────────────────────────────────────────
const MINIMAX_API_URL = 'https://api.minimax.chat/v1/text/chatcompletion_v2'

async function callMinimax({ apiKey, messages, model, temperature, maxTokens }: {
  apiKey: string; messages: ChatMessage[]; model?: string; temperature?: number; maxTokens?: number
}): Promise<ProviderResult> {
  const response = await fetch(MINIMAX_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: model || 'abab6.5s-chat',
      messages,
      ...(temperature != null ? { temperature } : {}),
      ...(maxTokens != null ? { tokens_to_generate: maxTokens } : {}),
    }),
  })
  if (!response.ok) throw new Error(`Minimax API error: ${response.status}`)
  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Minimax API returned no content')
  return { content }
}

// ─── DeepSeek ───────────────────────────────────────────────────────────
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

async function callDeepseek({ apiKey, messages, model, temperature, maxTokens }: {
  apiKey: string; messages: ChatMessage[]; model?: string; temperature?: number; maxTokens?: number
}): Promise<ProviderResult> {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: model || 'deepseek-chat',
      messages,
      ...(temperature != null ? { temperature } : {}),
      ...(maxTokens != null ? { max_tokens: maxTokens } : {}),
    }),
  })
  if (!response.ok) throw new Error(`DeepSeek API error: ${response.status}`)
  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('DeepSeek API returned no content')
  return { content }
}

// ─── Anthropic (Claude) ────────────────────────────────────────────────
// Messages API — `system` es un campo aparte de nivel superior, no un
// mensaje con role "system", y necesita el header
// anthropic-dangerous-direct-browser-access cuando se llama directo desde
// un navegador; aquí ya no hace falta (la llamada sale del servidor), pero
// no molesta dejarlo.
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_DEFAULT_MAX_TOKENS = 1024

async function callAnthropic({ apiKey, messages, model, temperature, maxTokens }: {
  apiKey: string; messages: ChatMessage[]; model?: string; temperature?: number; maxTokens?: number
}): Promise<ProviderResult> {
  const system = messages.find((m) => m.role === 'system')?.content
  const turns = messages.filter((m) => m.role !== 'system')

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: model || 'claude-sonnet-4-5',
      messages: turns,
      ...(system ? { system } : {}),
      max_tokens: maxTokens ?? ANTHROPIC_DEFAULT_MAX_TOKENS,
      ...(temperature != null ? { temperature } : {}),
    }),
  })
  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status} ${await response.text().catch(() => '')}`)
  }
  const data = await response.json()
  const content = data.content?.map((block: { text?: string }) => block.text ?? '').join('')
  if (!content) throw new Error('Anthropic API returned no content')
  return { content }
}

// ─── Google (Gemini) ────────────────────────────────────────────────────
// generateContent API — "contents" con role "user"/"model" en vez de
// "user"/"assistant", prompt de sistema como campo aparte, y la llave va en
// el query string en vez de un header de auth.
async function callGoogle({ apiKey, messages, model, temperature, maxTokens }: {
  apiKey: string; messages: ChatMessage[]; model?: string; temperature?: number; maxTokens?: number
}): Promise<ProviderResult> {
  const system = messages.find((m) => m.role === 'system')?.content
  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }))

  const modelId = model || 'gemini-2.0-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`
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
  const content = data.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text ?? '')
    .join('')
  if (!content) throw new Error('Google API returned no content')
  return { content }
}

// ─── OpenAI-compatible (OpenAI, Groq, OpenRouter, "custom", etc.) ───────
// Cubre cualquier proveedor que hable el formato /chat/completions de
// OpenAI. Es el único que soporta `tools` (function calling) — usado por
// toolRuntime.js — y devuelve { content, tool_calls? } tal cual venía del
// proveedor, en vez de solo un string.
async function callOpenAiCompatible({ apiKey, baseUrl, messages, model, temperature, maxTokens, tools }: {
  apiKey: string; baseUrl?: string; messages: ChatMessage[]; model?: string
  temperature?: number; maxTokens?: number; tools?: unknown[]
}): Promise<ProviderResult> {
  if (!baseUrl) throw new Error('Missing base URL')

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
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
  return { content: message.content, tool_calls: message.tool_calls }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
    return jsonResponse({ success: false, error: 'config', message: 'Faltan variables de entorno de Supabase en la función.' }, 500)
  }

  // ─── 1) Verificar que quien llama esté autenticado (cualquier usuario,
  // no solo admin — hasta el chat de la mascota de un alumno pasa por
  // aquí) ─────────────────────────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization') ?? ''
  const jwt = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!jwt) {
    return jsonResponse({ success: false, error: 'unauthorized', message: 'Falta el header Authorization.' }, 401)
  }

  const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  const { data: userData, error: userError } = await callerClient.auth.getUser(jwt)
  if (userError || !userData?.user) {
    return jsonResponse({ success: false, error: 'unauthorized', message: 'Sesión inválida o expirada.' }, 401)
  }

  // ─── 2) Parsear el body ───────────────────────────────────────────────
  let body: GatewayRequestBody
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ success: false, error: 'bad_request', message: 'Body inválido (se esperaba JSON).' }, 400)
  }

  const providerId = typeof body.providerId === 'string' ? body.providerId : ''
  const apiKey = typeof body.apiKey === 'string' ? body.apiKey : ''
  const messages = Array.isArray(body.messages) ? body.messages : null

  if (!providerId || !apiKey || !messages || messages.length === 0) {
    // Nunca incluir apiKey en este (ni en ningún otro) mensaje de error.
    return jsonResponse({ success: false, error: 'bad_request', message: 'Faltan providerId, apiKey o messages.' }, 400)
  }

  // ─── 3) Prefijo global de "actitud" (ai_gateway_settings.system_prompt_prefix) ──
  // Con cliente de service role — igual que send-email lee email_settings —
  // para no depender de las políticas RLS (admin-only) de quien llama, que
  // aquí es cualquier usuario autenticado, no necesariamente un admin.
  const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const { data: prefixRow } = await serviceClient
    .from('ai_gateway_settings')
    .select('value')
    .eq('key', 'system_prompt_prefix')
    .maybeSingle()
  const prefix = prefixRow?.value?.trim()

  // Se antepone COMO UN MENSAJE DE SISTEMA ADICIONAL al principio del
  // arreglo — no reemplaza ni se mezcla con el system prompt propio del
  // llamador (personalidad de la mascota, aiPrompt de un NPC, etc.), que
  // sigue intacto justo después. Si no hay prefijo configurado, los
  // mensajes se mandan sin tocar.
  const finalMessages: ChatMessage[] = prefix
    ? [{ role: 'system', content: prefix }, ...messages]
    : messages

  // ─── 4) Despachar al proveedor correcto ────────────────────────────────
  const callArgs = {
    apiKey,
    baseUrl: typeof body.baseUrl === 'string' ? body.baseUrl : undefined,
    messages: finalMessages,
    model: typeof body.model === 'string' ? body.model : undefined,
    temperature: typeof body.temperature === 'number' ? body.temperature : undefined,
    maxTokens: typeof body.maxTokens === 'number' ? body.maxTokens : undefined,
    tools: Array.isArray(body.tools) ? body.tools : undefined,
  }

  try {
    let result: ProviderResult
    if (providerId === 'minimax') {
      result = await callMinimax(callArgs)
    } else if (providerId === 'deepseek') {
      result = await callDeepseek(callArgs)
    } else if (providerId === 'anthropic') {
      result = await callAnthropic(callArgs)
    } else if (providerId === 'google') {
      result = await callGoogle(callArgs)
    } else if (NATIVE_PROVIDER_IDS.has(providerId)) {
      // No debería llegar aquí (los 4 nativos ya están cubiertos arriba),
      // pero por si acaso se agrega un id nativo nuevo sin su rama.
      return jsonResponse({ success: false, error: 'bad_request', message: `Proveedor nativo sin implementar: ${providerId}` }, 400)
    } else {
      // Cualquier otro providerId (openai, groq, openrouter, custom, o uno
      // nuevo que el front agregue) se trata como openai-compatible.
      result = await callOpenAiCompatible(callArgs)
    }

    return jsonResponse({ success: true, content: result.content, ...(result.tool_calls ? { tool_calls: result.tool_calls } : {}) })
  } catch (err) {
    // El mensaje de error del proveedor (ej. "DeepSeek API error: 401") se
    // propaga tal cual para poder depurar — pero jamás incluye apiKey (los
    // helpers de arriba nunca lo meten en el mensaje de error).
    const message = err instanceof Error ? err.message : 'Error desconocido llamando al proveedor de IA.'
    return jsonResponse({ success: false, error: 'provider_error', message }, 502)
  }
})
