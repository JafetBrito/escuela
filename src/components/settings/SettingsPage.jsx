import AppTopBar from '../shared/AppTopBar'
import { useChatStore } from '../../stores/useChatStore'
import { useMascotStore } from '../../stores/useMascotStore'
import { useSettingsStore, CHAT_MODELS, AI_TONES, AI_VERBOSITY } from '../../stores/useSettingsStore'
import { getMascotById } from '../../data/mascotRegistry'
import { downloadProgress } from '../../services/persistence/jsonFile'

export default function SettingsPage() {
  const selectedMascotId = useMascotStore((s) => s.selectedMascotId)
  const mascot = getMascotById(selectedMascotId)
  const messages = useChatStore((s) => s.messages)

  const settingsMascotName = useSettingsStore((s) => s.mascotName)
  const setMascotName = useSettingsStore((s) => s.setMascotName)
  const minimaxApiKey = useSettingsStore((s) => s.minimaxApiKey)
  const setMinimaxApiKey = useSettingsStore((s) => s.setMinimaxApiKey)
  const chatModel = useSettingsStore((s) => s.chatModel)
  const setChatModel = useSettingsStore((s) => s.setChatModel)
  const aiTone = useSettingsStore((s) => s.aiTone)
  const setAiTone = useSettingsStore((s) => s.setAiTone)
  const aiVerbosity = useSettingsStore((s) => s.aiVerbosity)
  const setAiVerbosity = useSettingsStore((s) => s.setAiVerbosity)

  const displayName = settingsMascotName || mascot.name

  const handleExportChat = () => {
    const date = new Date().toISOString().slice(0, 10)
    downloadProgress(messages, `chat-${displayName.toLowerCase()}-${date}.json`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto flex max-w-2xl flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold">Ajustes</h1>
            <p className="mt-1 text-sm text-text-muted">
              Configura tu mascota, tu IA y tu cuenta.
            </p>
          </div>

          <section className="flex flex-col gap-6 rounded-xl border border-border bg-surface p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">
              Mascota
            </p>

            <div>
              <p className="text-sm font-semibold text-text">Nombre de tu mascota</p>
              <input
                type="text"
                value={settingsMascotName}
                onChange={(e) => setMascotName(e.target.value)}
                placeholder={mascot.name}
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-text outline-none focus:border-primary"
              />
            </div>
          </section>

          <section className="flex flex-col gap-6 rounded-xl border border-border bg-surface p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">
              Inteligencia artificial
            </p>

            <div>
              <p className="text-sm font-semibold text-text">Minimax API key</p>
              <p className="mt-1 text-sm text-text-muted">
                Tu mascota usa esta clave para responder en el chat. Si la dejas vacía verás
                respuestas de demostración.
              </p>
              <input
                type="text"
                value={minimaxApiKey}
                onChange={(e) => setMinimaxApiKey(e.target.value)}
                placeholder="mx-..."
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 font-mono text-text outline-none focus:border-primary"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-text">Modelo de chat</p>
              <select
                value={chatModel}
                onChange={(e) => setChatModel(e.target.value)}
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-text outline-none focus:border-primary"
              >
                {CHAT_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-sm font-semibold text-text">Personalidad</p>
              <p className="mt-1 text-sm text-text-muted">
                Define el tono con el que tu mascota te responde.
              </p>
              <select
                value={aiTone}
                onChange={(e) => setAiTone(e.target.value)}
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-text outline-none focus:border-primary"
              >
                {AI_TONES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-sm font-semibold text-text">Nivel de detalle</p>
              <p className="mt-1 text-sm text-text-muted">
                Qué tan largas son las respuestas de tu mascota.
              </p>
              <select
                value={aiVerbosity}
                onChange={(e) => setAiVerbosity(e.target.value)}
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-text outline-none focus:border-primary"
              >
                {AI_VERBOSITY.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">
              Conversación con tu IA
            </p>
            <p className="text-sm text-text-muted">
              Descarga tu chat actual con {displayName} como archivo JSON para guardarlo.
            </p>
            <button
              onClick={handleExportChat}
              disabled={messages.length === 0}
              className="self-start rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              💾 Guardar conversación
            </button>
          </section>
        </div>
      </main>
    </div>
  )
}
