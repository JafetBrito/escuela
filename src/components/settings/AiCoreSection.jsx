import { useState } from 'react'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { useAiCredentialsStore } from '../../stores/useAiCredentialsStore'
import { AI_PROVIDERS, getProviderById } from '../../data/aiProviderRegistry'
import { testCredential } from '../../services/chat/transports'

const EMPTY_FORM = { providerId: AI_PROVIDERS[0].id, label: '', apiKey: '', baseUrl: '', model: '' }

// "Núcleo / Cerebro": qué proveedor+modelo usa la mascota, y el
// administrador de conexiones (la llave nunca se vuelve a mostrar una vez
// guardada — ver useAiCredentialsStore.js).
export default function AiCoreSection() {
  const connections = useAiCredentialsStore((s) => s.connections)
  const activeCredentialId = useSettingsStore((s) => s.activeCredentialId)
  const setActiveCredentialId = useSettingsStore((s) => s.setActiveCredentialId)
  const temperature = useSettingsStore((s) => s.temperature)
  const setTemperature = useSettingsStore((s) => s.setTemperature)
  const maxTokens = useSettingsStore((s) => s.maxTokens)
  const setMaxTokens = useSettingsStore((s) => s.setMaxTokens)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [testStatus, setTestStatus] = useState(null) // null | 'testing' | { ok, error }
  const [saving, setSaving] = useState(false)

  const provider = getProviderById(form.providerId)
  const needsBaseUrl = provider?.requiresBaseUrl || (provider?.kind === 'openai_compatible' && !provider?.defaultBaseUrl)

  const handleTest = async () => {
    setTestStatus('testing')
    const result = await testCredential({
      providerId: form.providerId,
      apiKey: form.apiKey,
      baseUrl: form.baseUrl || provider?.defaultBaseUrl,
      model: form.model || provider?.defaultModel,
    })
    setTestStatus(result)
  }

  const handleSave = async () => {
    if (!form.apiKey.trim()) return
    setSaving(true)
    try {
      const id = await useAiCredentialsStore.getState().saveCredential({
        providerId: form.providerId,
        apiKey: form.apiKey.trim(),
        baseUrl: form.baseUrl.trim() || null,
        model: form.model.trim() || null,
        label: form.label.trim() || provider?.label,
      })
      setActiveCredentialId(id)
      setForm(EMPTY_FORM)
      setTestStatus(null)
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (id) => {
    await useAiCredentialsStore.getState().removeCredential(id)
    if (activeCredentialId === id) setActiveCredentialId(null)
  }

  return (
    <section className="flex flex-col gap-6 rounded-xl border border-border bg-surface p-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">🧠 Núcleo / Cerebro</p>
        <p className="mt-1 text-sm text-text-muted">
          Conecta casi cualquier IA con API: las nativas (MiniMax, DeepSeek, Anthropic, Google) o
          cualquier endpoint compatible con OpenAI (OpenAI, Groq, OpenRouter, y más). Las llaves se
          guardan cifradas en el servidor y nunca vuelven a mostrarse — ni siquiera un administrador
          puede leerlas.
        </p>
      </div>

      {connections.length === 0 && (
        <p className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-text-muted">
          Sin conexiones todavía. Verás respuestas de demostración hasta que agregues una.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {connections.map((c) => {
          const p = getProviderById(c.providerId)
          const active = activeCredentialId === c.id
          return (
            <div
              key={c.id}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${
                active ? 'border-primary bg-primary/5' : 'border-border bg-background'
              }`}
            >
              <button
                type="button"
                onClick={() => setActiveCredentialId(c.id)}
                title="Usar esta conexión"
                className={`shrink-0 text-lg ${active ? '' : 'opacity-30 hover:opacity-70'}`}
              >
                {active ? '⭐' : '☆'}
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-text">{c.label || p?.label || c.providerId}</p>
                <p className="truncate text-xs text-text-muted">
                  {p?.label ?? c.providerId} · {c.model || p?.defaultModel || 'modelo por defecto'} · 🔒 llave configurada
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(c.id)}
                className="shrink-0 rounded-lg border border-border px-2 py-1 text-xs text-text-muted hover:border-danger hover:text-danger"
              >
                Quitar
              </button>
            </div>
          )
        })}
      </div>

      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="self-start rounded-lg border border-primary/40 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
        >
          ➕ Agregar conexión
        </button>
      ) : (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4">
          <div>
            <p className="text-xs font-semibold text-text-muted">Proveedor</p>
            <select
              value={form.providerId}
              onChange={(e) => setForm((f) => ({ ...f, providerId: e.target.value, baseUrl: '', model: '' }))}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary"
            >
              {AI_PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>

          {needsBaseUrl && (
            <div>
              <p className="text-xs font-semibold text-text-muted">Base URL</p>
              <input
                type="text"
                value={form.baseUrl}
                onChange={(e) => setForm((f) => ({ ...f, baseUrl: e.target.value }))}
                placeholder="https://api.tuservicio.com/v1"
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-text outline-none focus:border-primary"
              />
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-text-muted">API key</p>
            <input
              type="password"
              value={form.apiKey}
              onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
              placeholder="••••••••••••"
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-text outline-none focus:border-primary"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-text-muted">Modelo (opcional)</p>
              <input
                type="text"
                value={form.model}
                onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                placeholder={provider?.defaultModel || 'modelo por defecto'}
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-text-muted">Nombre (opcional)</p>
              <input
                type="text"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                placeholder={provider?.label}
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={!form.apiKey.trim() || testStatus === 'testing'}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-muted hover:border-primary hover:text-text disabled:opacity-50"
            >
              {testStatus === 'testing' ? 'Probando…' : '🔌 Probar conexión'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!form.apiKey.trim() || saving}
              className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-background disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Guardar conexión'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setTestStatus(null) }}
              className="rounded-lg px-3 py-1.5 text-xs text-text-muted hover:text-text"
            >
              Cancelar
            </button>
            {testStatus && testStatus !== 'testing' && (
              <span className={`text-xs ${testStatus.ok ? 'text-primary' : 'text-danger'}`}>
                {testStatus.ok ? '✅ Conexión exitosa' : `❌ ${testStatus.error}`}
              </span>
            )}
          </div>
        </div>
      )}

      <div>
        <p className="text-sm font-semibold text-text">
          Creatividad (temperature): {temperature.toFixed(2)}
        </p>
        <input
          type="range" min="0" max="1" step="0.05"
          value={temperature}
          onChange={(e) => setTemperature(Number(e.target.value))}
          className="mt-2 w-full accent-primary"
        />
      </div>

      <div>
        <p className="text-sm font-semibold text-text">Longitud máxima de respuesta</p>
        <input
          type="number" min="50" max="4000" step="50"
          value={maxTokens}
          onChange={(e) => setMaxTokens(Number(e.target.value))}
          className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-text outline-none focus:border-primary"
        />
      </div>
    </section>
  )
}
