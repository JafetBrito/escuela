// Supabase client for accounts, licenses, comments and cloud progress sync.
// Works entirely from the browser — no custom backend needed.
import { createClient } from '@supabase/supabase-js'

// Respaldo hardcodeado: el pipeline de despliegue de Hostinger no pasa de
// forma confiable ni las variables de su panel ni .env.production al build
// real (confirmado dos veces comparando el bundle servido — nunca cambiaba).
// Estos valores son públicos por diseño: la anon key está protegida por las
// políticas RLS de cada tabla, no por estar oculta, así que es seguro que
// vivan directamente en el código fuente como último recurso.
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://ukucmognrcvsaibgniei.supabase.co'
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrdWNtb2ducmN2c2FpYmduaWVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0Mzg5MzUsImV4cCI6MjA5NzAxNDkzNX0.NS7HW05smWHw2GvYDca3UNF5OOqeTB4jilxg8bq5q5E'

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
}

export const supabase = isSupabaseConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null
