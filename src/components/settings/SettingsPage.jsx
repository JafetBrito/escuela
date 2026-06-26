import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import ProgressSync from '../learning/ProgressSync'
import MascotCompanion from '../mascot/MascotCompanion'
import PageVideoModal from '../shared/PageVideoModal'
import CurrencyBadge from '../shared/CurrencyBadge'
import LevelBadge from '../shared/LevelBadge'
import AiCoreSection from './AiCoreSection'
import AiMemorySection from './AiMemorySection'
import { useChatHistoryStore } from '../../stores/useChatHistoryStore'
import { useMascotStore } from '../../stores/useMascotStore'
import { useAuthStore } from '../../stores/useAuthStore'
import { useCurrencyStore } from '../../stores/useCurrencyStore'
import { useSettingsStore, AI_TONES, AI_VERBOSITY, AGENT_MODES, AI_TOOLS } from '../../stores/useSettingsStore'
import { useAiCredentialsStore } from '../../stores/useAiCredentialsStore'
import { useShopStore } from '../../stores/useShopStore'
import { usePopupPositionStore } from '../../stores/usePopupPositionStore'
import { SHOP_ITEMS } from '../../data/shopRegistry'
import { getMascotById } from '../../data/mascotRegistry'
import { buildProgressSnapshot } from '../../services/persistence/progressSnapshot'
import { saveLocalSnapshot } from '../../services/persistence/localStore'
import { isSupabaseConfigured } from '../../services/supabase/client'
import { providerSupportsTools } from '../../data/aiProviderRegistry'

const ROLE_LABELS = {
  admin: 'Administrador',
  student: 'Alumno',
}

const CATEGORIES = [
  { id: 'cuenta', label: '👤 Cuenta' },
  { id: 'nucleo', label: '🧠 Núcleo' },
  { id: 'identidad', label: '✨ Identidad y Alma' },
  { id: 'personalidad', label: '🎭 Personalidad' },
  { id: 'usuario', label: '🙋 Usuario' },
  { id: 'agentes', label: '🤖 Agentes' },
  { id: 'herramientas', label: '🛠️ Herramientas' },
  { id: 'heartbeat', label: '💓 Heartbeat' },
  { id: 'memoria', label: '🧩 Memoria' },
  { id: 'notion', label: '🗒️ Notion' },
  { id: 'chats', label: '💬 Chats' },
  { id: 'interfaz', label: '🖐️ Interfaz' },
]

export default function SettingsPage() {
  const navigate = useNavigate()
  const [category, setCategory] = useState('cuenta')
  const [saved, setSaved] = useState(false)
  const selectedMascotId = useMascotStore((s) => s.selectedMascotId)
  const mascot = getMascotById(selectedMascotId)
  const chatHistory = useChatHistoryStore((s) => s.history)
  const license = useAuthStore((s) => s.license)
  const googleUser = useAuthStore((s) => s.googleUser)
  const lock = useAuthStore((s) => s.lock)
  const session = useAuthStore((s) => s.session)
  const profile = useAuthStore((s) => s.profile)
  const signOut = useAuthStore((s) => s.signOut)
  const updatePassword = useAuthStore((s) => s.updatePassword)
  const coins = useCurrencyStore((s) => s.coins)
  const popupPositions = usePopupPositionStore((s) => s.positions)
  const setPopupScale = usePopupPositionStore((s) => s.setScale)
  const resetPopups = usePopupPositionStore((s) => s.resetAll)
  const popupScales = Object.fromEntries(
    Object.entries(popupPositions).map(([id, pos]) => [id, pos?.scale ?? 1]),
  )

  const [newPassword, setNewPassword] = useState('')
  const [passwordStatus, setPasswordStatus] = useState('')

  const settingsMascotName = useSettingsStore((s) => s.mascotName)
  const setMascotName = useSettingsStore((s) => s.setMascotName)
  const identity = useSettingsStore((s) => s.identity)
  const setIdentity = useSettingsStore((s) => s.setIdentity)
  const soulRules = useSettingsStore((s) => s.soulRules)
  const setSoulRules = useSettingsStore((s) => s.setSoulRules)
  const userProfile = useSettingsStore((s) => s.userProfile)
  const setUserProfile = useSettingsStore((s) => s.setUserProfile)
  const aiTone = useSettingsStore((s) => s.aiTone)
  const setAiTone = useSettingsStore((s) => s.setAiTone)
  const aiVerbosity = useSettingsStore((s) => s.aiVerbosity)
  const setAiVerbosity = useSettingsStore((s) => s.setAiVerbosity)
  const customInstructions = useSettingsStore((s) => s.customInstructions)
  const setCustomInstructions = useSettingsStore((s) => s.setCustomInstructions)
  const agentMode = useSettingsStore((s) => s.agentMode)
  const setAgentMode = useSettingsStore((s) => s.setAgentMode)
  const toolsEnabled = useSettingsStore((s) => s.toolsEnabled)
  const toggleTool = useSettingsStore((s) => s.toggleTool)
  const heartbeatEnabled = useSettingsStore((s) => s.heartbeatEnabled)
  const setHeartbeatEnabled = useSettingsStore((s) => s.setHeartbeatEnabled)
  const heartbeatMinutes = useSettingsStore((s) => s.heartbeatMinutes)
  const setHeartbeatMinutes = useSettingsStore((s) => s.setHeartbeatMinutes)
  const notionDatabaseId = useSettingsStore((s) => s.notionDatabaseId)
  const setNotionDatabaseId = useSettingsStore((s) => s.setNotionDatabaseId)
  const activeCredentialId = useSettingsStore((s) => s.activeCredentialId)
  const activeConnection = useAiCredentialsStore((s) => s.connections.find((c) => c.id === activeCredentialId))
  const toolsSupported = activeConnection ? providerSupportsTools(activeConnection.providerId) : false
  const purchased = useShopStore((s) => s.purchased)

  const [notionKeyInput, setNotionKeyInput] = useState('')
  const [notionSaving, setNotionSaving] = useState(false)
  const notionConnected = useAiCredentialsStore((s) => s.connections.some((c) => c.providerId === 'notion'))

  const ownedPrompts = SHOP_ITEMS.filter(
    (item) => item.kind === 'ai-prompt' && purchased.includes(item.id),
  )

  const displayName = settingsMascotName || mascot.name
  const historyDays = Object.keys(chatHistory).sort((a, b) => b.localeCompare(a))

  const accessLabel = license
    ? license.type === 'full'
      ? 'Completo (todos los cursos)'
      : `Un curso (${license?.courseId ?? '—'})`
    : 'Todos los cursos · primeras 2 clases gratis'

  const supabaseReady = isSupabaseConfigured()
  const isEmailProvider = session?.user?.app_metadata?.provider === 'email'
  const roleLabel = profile
    ? `${ROLE_LABELS[profile.role] ?? 'Alumno'} (${license ? 'con llave' : 'sin llave'})`
    : null

  const handleLogout = async () => {
    if (supabaseReady) {
      await signOut()
    } else {
      lock()
    }
    navigate('/')
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordStatus('')
    try {
      await updatePassword(newPassword)
      setPasswordStatus('Contraseña actualizada')
      setNewPassword('')
    } catch (err) {
      setPasswordStatus(err.message)
    } finally {
      setTimeout(() => setPasswordStatus(''), 3000)
    }
  }

  const handleSaveAi = () => {
    saveLocalSnapshot(buildProgressSnapshot())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSaveNotion = async () => {
    if (!notionKeyInput.trim()) return
    setNotionSaving(true)
    try {
      await useAiCredentialsStore.getState().saveCredential({
        providerId: 'notion', apiKey: notionKeyInput.trim(), label: 'Notion',
      })
      setNotionKeyInput('')
    } finally {
      setNotionSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <PageVideoModal pageKey="ajustes" />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-slate-600 to-slate-800 px-6 py-8 shadow-lg">
            <h1 className="text-3xl font-extrabold text-white drop-shadow-sm">⚙️ Ajustes</h1>
            <p className="mt-1 text-sm font-medium text-white/85">
              Configura tu cuenta, tu mascota y la IA que la conecta.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-white">
              <Link to="/notas" className="rounded-full bg-background/20 px-3 py-1 hover:bg-background/30">📝 Notas</Link>
              <Link to="/misiones" className="rounded-full bg-background/20 px-3 py-1 hover:bg-background/30">📜 Misiones</Link>
              <Link to="/tienda" className="rounded-full bg-background/20 px-3 py-1 hover:bg-background/30">🛒 Tienda</Link>
              <Link to="/logros" className="rounded-full bg-background/20 px-3 py-1 hover:bg-background/30">🏅 Logros</Link>
            </div>
          </div>

          <div className="flex flex-col gap-6 md:flex-row">
            {/* Category rail */}
            <nav className="flex shrink-0 gap-1.5 overflow-x-auto md:w-48 md:flex-col md:overflow-visible">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`shrink-0 rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors ${
                    category === c.id ? 'bg-primary text-background' : 'text-text-muted hover:bg-surface'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </nav>

            {/* Active category */}
            <div className="flex min-w-0 flex-1 flex-col gap-6">
              {category === 'cuenta' && (
                <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
                  <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">👤 Cuenta</p>

                  {(session || googleUser) && (
                    <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
                      {(profile?.avatar_url || googleUser?.picture) && (
                        <img src={profile?.avatar_url || googleUser?.picture} alt="" className="h-10 w-10 rounded-full" />
                      )}
                      <div>
                        <p className="text-sm font-semibold text-text">
                          {profile?.display_name || googleUser?.name || 'Tu cuenta'}
                        </p>
                        <p className="text-xs text-text-muted">{session?.user?.email || googleUser?.email}</p>
                      </div>
                      {roleLabel && (
                        <span className="ml-auto rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs text-primary">
                          {roleLabel}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                    <div>
                      <p className="text-text-muted">Licencia</p>
                      <p className="font-mono text-text">{license?.licenseId ?? '—'}</p>
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
                    <Link to="/unlock" className="rounded-lg border border-primary/30 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10">
                      🔑 Canjear otra llave
                    </Link>
                    <button onClick={handleLogout} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-muted hover:border-danger hover:text-danger">
                      Cerrar sesión
                    </button>
                  </div>

                  {isEmailProvider && (
                    <form onSubmit={handleChangePassword} className="mt-2 flex flex-wrap items-end gap-2">
                      <label className="flex flex-col gap-1 text-sm">
                        Cambiar contraseña
                        <input
                          type="password" minLength={6} value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Nueva contraseña"
                          className="rounded-lg border border-border bg-background px-3 py-2 text-text outline-none focus:border-primary"
                        />
                      </label>
                      <button type="submit" disabled={newPassword.length < 6}
                        className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-muted hover:border-primary hover:text-text disabled:opacity-60">
                        Actualizar
                      </button>
                      {passwordStatus && <span className="text-sm text-primary">{passwordStatus}</span>}
                    </form>
                  )}

                  <p className="text-xs text-text-muted">
                    {supabaseReady
                      ? 'Tu progreso, mascota y configuración se guardan en tu cuenta y se sincronizan entre dispositivos.'
                      : '"Descargar llave" guarda un archivo con tu licencia y todo tu progreso. Úsalo para seguir donde lo dejaste en otro navegador.'}
                  </p>

                  <div className="border-t border-border pt-3">
                    <p className="text-sm font-semibold text-text">Nombre de tu mascota</p>
                    <input
                      type="text" value={settingsMascotName} onChange={(e) => setMascotName(e.target.value)}
                      placeholder={mascot.name}
                      className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-text outline-none focus:border-primary"
                    />
                  </div>
                </section>
              )}

              {category === 'nucleo' && <AiCoreSection />}

              {category === 'identidad' && (
                <section className="flex flex-col gap-6 rounded-xl border border-border bg-surface p-5">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">✨ Identidad</p>
                    <p className="mt-1 text-sm text-text-muted">Quién es {displayName} — su biografía, gustos, forma de ser.</p>
                    <textarea
                      value={identity} onChange={(e) => setIdentity(e.target.value)} rows={4}
                      placeholder={`Ej: ${displayName} es curioso, le encanta la ciencia y siempre cuenta un dato interesante antes de responder.`}
                      className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-text outline-none focus:border-primary"
                    />
                  </div>
                  <div className="border-t border-border pt-4">
                    <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">🕊️ Alma</p>
                    <p className="mt-1 text-sm text-text-muted">
                      Reglas innegociables, con la prioridad más alta de todo el system prompt — por
                      encima de la identidad y la personalidad.
                    </p>
                    <textarea
                      value={soulRules} onChange={(e) => setSoulRules(e.target.value)} rows={4}
                      placeholder="Ej: Nunca le digas al estudiante que abandone sus estudios. Siempre responde en español."
                      className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-text outline-none focus:border-primary"
                    />
                  </div>
                </section>
              )}

              {category === 'personalidad' && (
                <>
                  <section className="flex flex-col gap-6 rounded-xl border border-border bg-surface p-5">
                    <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">🎭 Personalidad</p>
                    <div>
                      <p className="text-sm font-semibold text-text">Tono</p>
                      <select value={aiTone} onChange={(e) => setAiTone(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-text outline-none focus:border-primary">
                        {AI_TONES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text">Nivel de detalle</p>
                      <select value={aiVerbosity} onChange={(e) => setAiVerbosity(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-text outline-none focus:border-primary">
                        {AI_VERBOSITY.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text">Instrucciones personalizadas</p>
                      <p className="mt-1 text-sm text-text-muted">Se añaden al final del system prompt, para matizar lo anterior.</p>
                      <textarea
                        value={customInstructions} onChange={(e) => setCustomInstructions(e.target.value)} rows={5}
                        className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-text outline-none focus:border-primary"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={handleSaveAi} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90">
                        Guardar y actualizar
                      </button>
                      {saved && <span className="text-sm text-primary">✅ Cambios guardados</span>}
                    </div>
                  </section>

                  {ownedPrompts.length > 0 && (
                    <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
                      <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">🧠 Personalidades compradas</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {ownedPrompts.map((item) => {
                          const active = customInstructions.trim() === item.promptText.trim()
                          return (
                            <div key={item.id} className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3">
                              <p className="flex items-center gap-2 text-sm font-bold text-text">
                                <span className="text-lg">{item.icon}</span> {item.name}
                              </p>
                              <p className="text-xs text-text-muted">{item.description}</p>
                              <button
                                onClick={() => setCustomInstructions(item.promptText)}
                                disabled={active}
                                className={`mt-1 self-start rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                                  active ? 'cursor-default bg-primary/20 text-primary' : 'border border-border text-text-muted hover:border-primary/40 hover:text-text'
                                }`}
                              >
                                {active ? '✓ Activa' : 'Usar esta personalidad'}
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </section>
                  )}
                </>
              )}

              {category === 'usuario' && (
                <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
                  <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">🙋 Usuario</p>
                  <p className="text-sm text-text-muted">
                    Lo que tu mascota debería saber siempre sobre ti — tu estilo de aprendizaje, tus metas, lo que te cuesta más.
                  </p>
                  <textarea
                    value={userProfile} onChange={(e) => setUserProfile(e.target.value)} rows={5}
                    placeholder="Ej: Aprendo mejor con ejemplos visuales. Estoy preparándome para un examen de admisión."
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-text outline-none focus:border-primary"
                  />
                </section>
              )}

              {category === 'agentes' && (
                <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
                  <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">🤖 Agentes</p>
                  <p className="text-sm text-text-muted">El modo cambia qué prioriza tu mascota al responder, sin perder su identidad ni su alma.</p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {AGENT_MODES.map((m) => (
                      <button
                        key={m.id} type="button" onClick={() => setAgentMode(m.id)}
                        className={`rounded-xl border-2 p-3 text-left transition-all ${
                          agentMode === m.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/30'
                        }`}
                      >
                        <p className="font-bold text-text">{m.label}</p>
                        <p className="mt-1 text-xs text-text-muted">{m.prompt}</p>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {category === 'herramientas' && (
                <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
                  <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">🛠️ Herramientas</p>
                  <p className="text-sm text-text-muted">
                    Capacidades reales que tu mascota puede usar durante la conversación (function calling).
                  </p>
                  {!toolsSupported && (
                    <p className="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-text-muted">
                      ⚠️ Tu conexión activa en Núcleo no soporta herramientas todavía (solo proveedores
                      compatibles con OpenAI: OpenAI, Groq, OpenRouter, u "Otro"). DeepSeek, MiniMax,
                      Anthropic y Google llegarán en una próxima versión.
                    </p>
                  )}
                  <div className="flex flex-col gap-2">
                    {AI_TOOLS.map((t) => (
                      <label key={t.id} className="flex items-start gap-3 rounded-lg border border-border bg-background px-3 py-2.5">
                        <input
                          type="checkbox"
                          checked={toolsEnabled.includes(t.id)}
                          onChange={() => toggleTool(t.id)}
                          disabled={!toolsSupported}
                          className="mt-0.5"
                        />
                        <div>
                          <p className="text-sm font-semibold text-text">{t.label}</p>
                          <p className="text-xs text-text-muted">{t.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </section>
              )}

              {category === 'heartbeat' && (
                <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
                  <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">💓 Heartbeat</p>
                  <p className="text-sm text-text-muted">
                    Tu mascota te escribe algo por su cuenta si llevas un rato sin interactuar — solo
                    mientras tienes la app abierta (no es un mensaje en segundo plano cuando cierras el
                    navegador; eso requeriría infraestructura adicional en el servidor).
                  </p>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={heartbeatEnabled} onChange={(e) => setHeartbeatEnabled(e.target.checked)} />
                    <span className="text-sm text-text">Activar heartbeat</span>
                  </label>
                  {heartbeatEnabled && (
                    <div>
                      <p className="text-sm font-semibold text-text">Minutos de inactividad antes de hablar</p>
                      <input
                        type="number" min="2" max="120" value={heartbeatMinutes}
                        onChange={(e) => setHeartbeatMinutes(Number(e.target.value))}
                        className="mt-2 w-32 rounded-lg border border-border bg-background px-3 py-2 text-text outline-none focus:border-primary"
                      />
                    </div>
                  )}
                </section>
              )}

              {category === 'memoria' && <AiMemorySection />}

              {category === 'notion' && (
                <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
                  <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">🗒️ Integración con Notion</p>
                  <p className="text-sm text-text-muted">
                    Pega tu integration token y el ID de tu base de datos de Notion para enviar tus notas desde{' '}
                    <Link to="/notas" className="text-primary hover:underline">Notas</Link>. Si el navegador bloquea
                    la conexión por CORS, copia tus notas manualmente.
                  </p>

                  {notionConnected ? (
                    <p className="text-sm text-primary">🔒 Token de Notion configurado.</p>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="password" value={notionKeyInput} onChange={(e) => setNotionKeyInput(e.target.value)}
                        placeholder="secret_..."
                        className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 font-mono text-text outline-none focus:border-primary"
                      />
                      <button onClick={handleSaveNotion} disabled={!notionKeyInput.trim() || notionSaving}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background disabled:opacity-50">
                        {notionSaving ? 'Guardando…' : 'Guardar'}
                      </button>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-semibold text-text">Notion Database ID</p>
                    <input
                      type="text" value={notionDatabaseId} onChange={(e) => setNotionDatabaseId(e.target.value)}
                      placeholder="32 caracteres, lo encuentras en la URL de tu base de datos"
                      className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 font-mono text-text outline-none focus:border-primary"
                    />
                  </div>
                </section>
              )}

              {category === 'chats' && (
                <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
                  <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">💬 Chats</p>
                  <p className="text-sm text-text-muted">
                    Cada día que conversas con {displayName} se guarda por separado. Consulta o descarga tus
                    conversaciones en la sección{' '}
                    <Link to="/chats" className="text-primary hover:underline">Chats</Link> del menú
                    {historyDays.length > 0 && ` (${historyDays.length} ${historyDays.length === 1 ? 'día guardado' : 'días guardados'})`}.
                  </p>
                </section>
              )}

              {category === 'interfaz' && (
                <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
                  <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">🖐️ Interfaz</p>
                  <p className="text-sm text-text-muted">
                    Los elementos flotantes (Radio, Cámara) se arrastran desde su asa <strong>⠿</strong>. Ajusta su tamaño.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[{ id: 'radio', label: '🎵 Radio' }, { id: 'camara', label: '📸 Cámara' }].map(({ id, label }) => (
                      <div key={id} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-text">{label}</span>
                          <span className="text-text-muted">{Math.round((popupScales[id] ?? 1) * 100)}%</span>
                        </div>
                        <input
                          type="range" min="0.6" max="1.6" step="0.05"
                          value={popupScales[id] ?? 1}
                          onChange={(e) => setPopupScale(id, Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    ))}
                  </div>
                  <button onClick={resetPopups} className="self-start rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-muted transition-colors hover:border-danger/40 hover:text-danger">
                    🔄 Restablecer tamaños y posiciones
                  </button>
                </section>
              )}
            </div>
          </div>
        </div>
      </main>

      <MascotCompanion />
    </div>
  )
}
