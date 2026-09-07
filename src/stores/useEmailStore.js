import { create } from 'zustand'
import { supabase } from '../services/supabase/client'

// Store dedicado a la herramienta de correo masivo de /admin/correos
// (plantillas guardadas, historial de envíos y la firma). Se separa de
// useAdminUsersStore porque es un área nueva y autocontenida — ese store
// sigue siendo la fuente de "lista de personas", este es "qué se les manda".
export const useEmailStore = create((set, get) => ({
  templates: [],
  campaigns: [],
  signature: '',
  loading: false,
  sending: false,
  error: null,

  fetchTemplates: async () => {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) console.error('[useEmailStore.fetchTemplates]', error)
    set({ templates: data ?? [] })
    return { data, error }
  },

  saveTemplate: async ({ name, subject, html_content }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('email_templates')
      .insert({ name, subject, html_content, created_by: user?.id ?? null })
      .select()
      .maybeSingle()
    if (!error) {
      set((s) => ({ templates: [data, ...s.templates] }))
    }
    return { data, error }
  },

  deleteTemplate: async (id) => {
    const { error } = await supabase.from('email_templates').delete().eq('id', id)
    if (!error) {
      set((s) => ({ templates: s.templates.filter((t) => t.id !== id) }))
    }
    return { error }
  },

  // Últimos 50 envíos — suficiente para el historial de /admin/correos sin
  // cargar años de campañas de una sola vez.
  fetchCampaigns: async () => {
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) console.error('[useEmailStore.fetchCampaigns]', error)
    set({ campaigns: data ?? [] })
    return { data, error }
  },

  fetchSignature: async () => {
    const { data, error } = await supabase
      .from('email_settings')
      .select('value')
      .eq('key', 'signature')
      .maybeSingle()
    if (error) console.error('[useEmailStore.fetchSignature]', error)
    set({ signature: data?.value ?? '' })
    return { data, error }
  },

  saveSignature: async (html) => {
    const { error } = await supabase
      .from('email_settings')
      .upsert({ key: 'signature', value: html, updated_at: new Date().toISOString() })
    if (!error) set({ signature: html })
    return { error }
  },

  // Invoca la Edge Function send-email. El envío real (SMTP, verificación de
  // admin, límite de lotes BCC) vive del lado del servidor — este store solo
  // llama y refresca el historial si salió bien.
  //
  // Cuando la función responde con un status != 2xx, supabase-js NO mete el
  // JSON de error en `error.message` (queda el genérico "Edge Function
  // returned a non-2xx status code") — el body real vive en
  // `error.context`, que es el Response crudo. Hay que leerlo aparte para
  // mostrarle al admin el motivo real (403 no-admin, 502 falla de SMTP, etc.)
  // en vez de un mensaje genérico inútil.
  sendEmail: async ({ subject, html, recipientEmails }) => {
    set({ sending: true, error: null })
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { subject, html, recipientEmails },
    })

    let message = error?.message ?? null
    if (error?.context && typeof error.context.json === 'function') {
      try {
        const body = await error.context.clone().json()
        if (body?.message) message = body.message
      } catch {
        // el body no era JSON parseable — se queda con el mensaje genérico
      }
    }

    set({ sending: false, error: message })
    if (!error) {
      await get().fetchCampaigns()
    }
    return { data, error: error ? { ...error, message } : null }
  },
}))
