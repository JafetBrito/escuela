import { useNavigate, Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import ProgressSync from '../learning/ProgressSync'
import CurrencyBadge from '../shared/CurrencyBadge'
import LevelBadge from '../shared/LevelBadge'
import { useChatHistoryStore, todayKey } from '../../stores/useChatHistoryStore'
import { useMascotStore } from '../../stores/useMascotStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { useCurrencyStore } from '../../stores/useCurrencyStore'
import { useSettingsStore, CHAT_MODELS, AI_TONES, AI_VERBOSITY } from '../../stores/useSettingsStore'
import { getMascotById } from '../../data/mascotRegistry'
import { downloadProgress } from '../../services/persistence/jsonFile'

export default function SettingsPage() {
  const navigate = useNavigate()
  const selectedMascotId = useMascotStore((s) => s.selectedMascotId)
  const mascot = getMascotById(selectedMascotId)
  const chatHistory = useChatHistoryStore((s) => s.history)
  const license = useAuthStore((s) => s.license)
  const lock = useAuthStore((s) => s.lock)
  const coins = useCurrencyStore((s) => s.coins)

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
  const temperature = useSettingsStore((s) => s.temperature)
  const setTemperature = useSettingsStore((s) => s.setTemperature)
  const maxTokens = useSettingsStore((s) => s.maxTokens)
  const setMaxTokens = useSettingsStore((s) => s.setMaxTokens)
  const customInstructions = useSettingsStore((s) => s.customInstructions)
  const setCustomInstructions = useSettingsStore((s) => s.setCustomInstructions)

  const displayName = settingsMascotName || mascot.name
  const historyDays = Object.keys(chatHistory).sort((a, b) => b.localeCompare(a))

  const handleExportDay = (day) => {
    downloadProgress(chatHistory[day], `chat-${displayName.toLowerCase()}-${day}.json`)
  }

  const accessLabel =
    license?.type === 'full'
      ? 'Completo (todos los cursos)'
      : `Un curso (${license?.courseId ?? '—'})`

  const handleLogout = () => {
    lock()
    navigate('/')
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

          <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">Cuenta</p>
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
              <div>
                <p className="text-text-muted">Licencia</p>
                <p className="font-mono text-text">{license?.licenseId ?? '—'}</p>
              </div>
              <div>
                <p className="text-text-muted">Plan</p>
                <p className="text-text">{license?.role ?? 'estudiante'}</p>
              </div>
              <div>
                <p className="text-text-muted">Activado</p>
                <p className="text-text">
                  {license?.issuedAt ? new Date(license.issuedAt).toLocaleDateString() : '—'}
                </p>
              </div>
              <div>
                <p className="text-text-muted">Acceso a cursos</p>
                <p className="text-text">{accessLabel}</p>
              </div>
              <div>
                <p className="text-text-muted">Monedas y nivel</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <CurrencyBadge amount={coins} />
                  <LevelBadge />
                </div>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <ProgressSync />
              <button
                onClick={handleLogout}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-muted hover:border-danger hover:text-danger"
              >
                Cerrar sesión
              </button>
            </div>
            <p className="text-xs text-text-muted">
              "Descargar llave" guarda un archivo con tu licencia y todo tu progreso (monedas,
              nivel, cursos, chats). Como todavía no hay base de datos, usa ese archivo para
              seguir donde lo dejaste en otro navegador o para probar con distintos usuarios.
            </p>
          </section>

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

            <div>
              <p className="text-sm font-semibold text-text">
                Creatividad (temperature): {temperature.toFixed(2)}
              </p>
              <p className="mt-1 text-sm text-text-muted">
                Valores bajos hacen respuestas más predecibles; valores altos las hacen más
                variadas.
              </p>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="mt-2 w-full accent-primary"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-text">Longitud máxima de respuesta</p>
              <p className="mt-1 text-sm text-text-muted">
                Tokens máximos que puede generar la IA en cada respuesta.
              </p>
              <input
                type="number"
                min="50"
                max="4000"
                step="50"
                value={maxTokens}
                onChange={(e) => setMaxTokens(Number(e.target.value))}
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-text outline-none focus:border-primary"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-text">Instrucciones personalizadas</p>
              <p className="mt-1 text-sm text-text-muted">
                Texto adicional que se añade al "system prompt" de tu mascota cuando se conecte
                una IA real (reglas, contexto extra, restricciones, etc.).
              </p>
              <textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                rows={3}
                placeholder="Ej: Siempre da ejemplos relacionados con diseño gráfico."
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-text outline-none focus:border-primary"
              />
            </div>
          </section>

          <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">Chats</p>
            <p className="text-sm text-text-muted">
              Cada día que conversas con {displayName} se guarda por separado. Consulta o
              descarga tus conversaciones en la sección{' '}
              <Link to="/chats" className="text-primary hover:underline">
                Chats
              </Link>{' '}
              del menú
              {historyDays.length > 0 && ` (${historyDays.length} ${historyDays.length === 1 ? 'día guardado' : 'días guardados'})`}.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
