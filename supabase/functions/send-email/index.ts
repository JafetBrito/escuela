// supabase/functions/send-email/index.ts
//
// Envío de correo masivo HTML desde el panel admin (/admin/correos). Recibe
// { subject, html, recipientEmails }, verifica que quien llama sea admin,
// le pega la firma guardada en email_settings, y manda por SMTP de Gmail en
// lotes BCC de ~40 destinatarios (así nadie ve la lista completa de
// destinatarios y nos quedamos lejos de los límites de envío de Gmail).
//
// Secrets esperados (configurados por el usuario con `supabase secrets set`,
// NUNCA en este archivo ni en ningún otro que Claude escriba):
//   GMAIL_USER            — la cuenta de Gmail que envía (ej. admin@gmail.com)
//   GMAIL_APP_PASSWORD    — App Password de 16 caracteres de esa cuenta
// SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY los inyecta la plataforma sola en
// toda Edge Function, no hace falta configurarlos.
//
// Librería SMTP: denomailer (https://deno.land/x/denomailer). Es la librería
// SMTP para Deno más conocida/documentada en los ejemplos de Supabase Edge
// Functions que existían al momento de escribir esto — pero no hay forma de
// confirmar aquí, sin desplegar, que la versión pineada abajo sigue
// resolviendo en deno.land/x hoy. Si `supabase functions deploy` falla por
// este import, es el primer sospechoso: revisa https://deno.land/x/denomailer
// por la versión más reciente y ajusta el número de versión en la URL.
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

// ─── CORS ────────────────────────────────────────────────────────────────
// Snippet estándar de los quickstarts de Supabase Edge Functions — sin esto
// el navegador bloquea la respuesta del preflight OPTIONS antes de que
// supabase.functions.invoke() llegue a ver el resultado real.
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

// Divide un arreglo en trozos de tamaño `size` — usado para los lotes BCC.
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size))
  }
  return out
}

const BCC_BATCH_SIZE = 40

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')
  const GMAIL_USER = Deno.env.get('GMAIL_USER')
  const GMAIL_APP_PASSWORD = Deno.env.get('GMAIL_APP_PASSWORD')

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
    return jsonResponse({ success: false, error: 'config', message: 'Faltan variables de entorno de Supabase en la función.' }, 500)
  }

  // Cliente con service role — para leer profiles/email_settings y escribir
  // email_campaigns sin depender de las políticas RLS del que llama.
  const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // ─── 1) Verificar que quien llama esté autenticado y sea admin ───────────
  const authHeader = req.headers.get('Authorization') ?? ''
  const jwt = authHeader.replace(/^Bearer\s+/i, '').trim()
  if (!jwt) {
    return jsonResponse({ success: false, error: 'unauthorized', message: 'Falta el header Authorization.' }, 401)
  }

  // Cliente con la anon key + el JWT del que llama — auth.getUser(jwt) valida
  // la firma del token contra Supabase Auth en vez de decodificarlo a mano.
  const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  const { data: userData, error: userError } = await callerClient.auth.getUser(jwt)
  if (userError || !userData?.user) {
    return jsonResponse({ success: false, error: 'unauthorized', message: 'Sesión inválida o expirada.' }, 401)
  }
  const callerId = userData.user.id

  const { data: profile, error: profileError } = await serviceClient
    .from('profiles')
    .select('role')
    .eq('id', callerId)
    .maybeSingle()
  if (profileError || profile?.role !== 'admin') {
    return jsonResponse({ success: false, error: 'forbidden', message: 'Solo un administrador puede enviar correos masivos.' }, 403)
  }

  // ─── 2) Parsear el body ───────────────────────────────────────────────────
  let body: { subject?: string; html?: string; recipientEmails?: string[] }
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ success: false, error: 'bad_request', message: 'Body inválido (se esperaba JSON).' }, 400)
  }

  const subject = typeof body.subject === 'string' ? body.subject.trim() : ''
  const html = typeof body.html === 'string' ? body.html : ''
  const recipientEmails = Array.isArray(body.recipientEmails)
    ? body.recipientEmails.filter((e): e is string => typeof e === 'string' && e.trim().length > 0)
    : []

  if (!subject || !html || recipientEmails.length === 0) {
    return jsonResponse({ success: false, error: 'bad_request', message: 'Faltan subject, html o recipientEmails.' }, 400)
  }

  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    return jsonResponse({ success: false, error: 'config', message: 'GMAIL_USER/GMAIL_APP_PASSWORD no están configurados como secrets de la función.' }, 500)
  }

  // ─── 3) Firma (email_settings.key = 'signature') ─────────────────────────
  const { data: signatureRow } = await serviceClient
    .from('email_settings')
    .select('value')
    .eq('key', 'signature')
    .maybeSingle()
  const signature = signatureRow?.value ?? ''
  const finalHtml = signature ? `${html}\n${signature}` : html

  // ─── 4) Enviar por SMTP en lotes BCC ──────────────────────────────────────
  const client = new SMTPClient({
    connection: {
      hostname: 'smtp.gmail.com',
      port: 587,
      tls: false, // arranca en texto plano y sube a TLS con STARTTLS
      auth: {
        username: GMAIL_USER,
        password: GMAIL_APP_PASSWORD,
      },
    },
  })

  const batches = chunk(recipientEmails, BCC_BATCH_SIZE)
  let sentCount = 0
  let sendError: string | null = null

  try {
    for (const batch of batches) {
      await client.send({
        from: GMAIL_USER,
        to: GMAIL_USER, // el campo "To" nunca debe ir vacío
        bcc: batch,
        subject,
        html: finalHtml,
      })
      sentCount += batch.length
    }
  } catch (err) {
    sendError = err instanceof Error ? err.message : 'Error desconocido enviando por SMTP.'
  } finally {
    try {
      await client.close()
    } catch {
      // no-op — si ya se rompió la conexión no hay nada que cerrar
    }
  }

  // ─── 5) Registrar la campaña (siempre, salga bien o mal) ─────────────────
  // Se guarda `html` (lo que escribió el admin) y NO `finalHtml`, para que al
  // reusar/editar una campaña pasada el editor muestre el contenido limpio
  // sin la firma ya pegada dos veces.
  await serviceClient.from('email_campaigns').insert({
    subject,
    html_content: html,
    recipient_count: recipientEmails.length,
    sent_by: callerId,
    status: sendError ? 'failed' : 'sent',
    error_message: sendError,
  })

  if (sendError) {
    return jsonResponse({ success: false, error: 'smtp', message: sendError, sent: sentCount }, 502)
  }

  return jsonResponse({ success: true, sent: sentCount })
})
