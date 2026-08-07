// Supabase client for accounts, licenses, comments and cloud progress sync.
// Works entirely from the browser — no custom backend needed.
import { createClient } from '@supabase/supabase-js'

// Respaldo hardcodeado: el pipeline de despliegue de Hostinger no pasa de
// forma confiable ni las variables de su panel ni .env.production al build
// real (confirmado dos veces comparando el bundle servido — nunca cambiaba).
// Estos valores son públicos por diseño: la anon key está protegida por las
// políticas RLS de cada tabla, no por estar oculta, así que es seguro que
// vivan directamente en el código fuente como último recurso.
// Un valor de entorno corrupto (visto en producción: Vercel tenía
// VITE_SUPABASE_ANON_KEY con la vista ENMASCARADA de la llave pegada por
// error — "eyJhbGci••••••••••" en vez de la llave real) rompe TODO fetch a
// Supabase con un error de bajísimo nivel del navegador ("String contains
// non ISO-8859-1 code point"), sin ninguna pista de cuál valor lo causó.
// Se valida el formato antes de confiar en la variable de entorno; si no
// calza con un JWT/URL real, se usa el respaldo limpio de abajo en vez de
// tumbar el login de todos los alumnos por una variable mal copiada.
const isCleanUrl = (v) => typeof v === 'string' && /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(v.trim())
const isCleanJwt = (v) => typeof v === 'string' && /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(v.trim())

const envUrl = import.meta.env.VITE_SUPABASE_URL
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const SUPABASE_URL = isCleanUrl(envUrl) ? envUrl.trim() : 'https://ukucmognrcvsaibgniei.supabase.co'
const SUPABASE_ANON_KEY = isCleanJwt(envKey)
  ? envKey.trim()
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdWNtb2ducmN2c2FpYmduaWVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0Mzg5MzUsImV4cCI6MjA5NzAxNDkzNX0.NS7HW05smWHw2GvYDca3UNF5OOqeTB4jilxg8bq5q5E'

if (envKey && !isCleanJwt(envKey)) {
  // eslint-disable-next-line no-console
  console.error('[supabase/client] VITE_SUPABASE_ANON_KEY en el entorno no tiene forma de JWT válido — usando el respaldo. Revisa la variable en Vercel.')
}

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
}

export const supabase = isSupabaseConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null
