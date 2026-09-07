import { useEffect, useState } from 'react'
import AdminShell from './AdminShell'
import { useAuthStore } from '../../stores/useAuthStore'
import { supabase } from '../../services/supabase/client'

// Página admin mínima para el prefijo global de "actitud" que la Edge
// Function ai-chat (supabase/functions/ai-chat/index.ts) antepone a TODA
// llamada de IA (mascota, NPCs de VR, El Oráculo de Oliver). Un solo campo,
// así que no se justifica un store dedicado (ver criterio de
// AdminEmailsPage.jsx/useEmailStore.js para la herramienta de correo, que sí
// tiene varias piezas de estado) — un useState + dos llamadas directas a
// Supabase (RLS admin-only ya cubre la tabla, ver migration_052.sql) basta.
const SETTINGS_KEY = 'system_prompt_prefix'

export default function AdminAiSettingsPage() {
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const [draft, setDraft] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!isAdmin?.()) return
    let cancelled = false
    supabase
      .from('ai_gateway_settings')
      .select('value')
      .eq('key', SETTINGS_KEY)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) console.error('[AdminAiSettingsPage] load failed:', error)
        setDraft(data?.value ?? '')
        setLoaded(true)
      })
    return () => { cancelled = true }
  }, [isAdmin])

  if (!isAdmin?.()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-text-muted">
        Acceso restringido a administradores.
      </div>
    )
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    const { error } = await supabase
      .from('ai_gateway_settings')
      .upsert({ key: SETTINGS_KEY, value: draft, updated_at: new Date().toISOString() })
    setSaving(false)
    setMessage(error ? `❌ ${error.message}` : '✅ Guardado.')
  }

  return (
    <AdminShell>
      <div className="space-y-4">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-8 shadow-lg">
          <h1 className="text-3xl font-extrabold text-white">🤖 IA</h1>
          <p className="mt-1 text-sm font-medium text-white/85">
            Prompt de sistema global que se antepone a toda llamada de IA (mascota, NPCs de VR, El Oráculo de Oliver).
            No reemplaza la personalidad/instrucciones propias de cada una — se aplica ANTES, además de esas.
          </p>
        </div>

        <div className="space-y-3 rounded-2xl border border-border bg-surface p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-text-muted">Prefijo de sistema (opcional)</p>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={8}
            disabled={!loaded}
            placeholder="Ej: Responde siempre de forma breve y motivadora, nunca uses lenguaje ofensivo…"
            className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary disabled:opacity-60"
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !loaded}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
            {message && <p className="text-xs text-text-muted">{message}</p>}
          </div>
          <p className="text-xs text-text-muted">
            Se aplica de inmediato en la próxima llamada de IA de cualquier alumno — sin necesidad de redesplegar nada.
            Déjalo vacío para no anteponer ningún prefijo.
          </p>
        </div>
      </div>
    </AdminShell>
  )
}
