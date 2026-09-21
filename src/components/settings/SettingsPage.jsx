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
import { useThemeStore, THEMES } from '../../stores/useThemeStore'
import { SHOP_ITEMS } from '../../data/shopRegistry'
import { getMascotById } from '../../data/mascotRegistry'
import { buildProgressSnapshot } from '../../services/persistence/progressSnapshot'
import { saveLocalSnapshot } from '../../services/persistence/localStore'
import { isSupabaseConfigured, supabase } from '../../services/supabase/client'
import { hasProfanity } from '../../utils/profanityFilter'
import { providerSupportsTools } from '../../data/aiProviderRegistry'
import { useI18n, SUPPORTED_LANGUAGES, LANGUAGE_NAMES, tr } from '../../i18n'

const ROLE_LABELS = {
  admin: 'Administrador',
  student: 'Alumno',
}

// El tema "Reina Nefertiti" se desbloquea comprándolo en la Tienda (ver
// shopRegistry.js, id 'reina-nefertiti') — por eso NO vive en esta lista fija,
// se agrega dinámicamente en el render solo si useShopStore.isOwned() es true.
const BASE_THEMES = THEMES.filter((t) => t.id !== 'desert')
const NEFERTITI_THEME = THEMES.find((t) => t.id === 'desert')

// Dos grupos separados en el riel de navegación: preferencias de cuenta vs.
// configuración de la IA — antes eran 13 pestañas sueltas en una sola lista,
// mezclando ambas cosas sin ninguna jerarquía visual.
const ACCOUNT_CATEGORIES = [
  { id: 'cuenta', label: '👤 Cuenta' },
  { id: 'apariencia', label: '🎨 Apariencia' },
  { id: 'interfaz', label: '🖐️ Widgets flotantes' },
]

const AI_CATEGORIES = [
  { id: 'nucleo', label: tr('🧠 Núcleo (conexión)', '🧠 Core (connection)') },
  { id: 'identidad', label: '✨ Identidad y Alma' },
  { id: 'personalidad', label: '🎭 Personalidad' },
  { id: 'usuario', label: '🙋 Usuario' },
  { id: 'agentes', label: '🤖 Agentes' },
  { id: 'herramientas', label: '🛠️ Herramientas' },
  { id: 'heartbeat', label: '💓 Heartbeat' },
  { id: 'memoria', label: '🧩 Memoria' },
  { id: 'notion', label: '🗒️ Notion' },
  { id: 'chats', label: '💬 Chats' },
]

export default function SettingsPage() {
  const { t, lang, setLang } = useI18n()
  const navigate = useNavigate()
  const [category, setCategory] = useState('cuenta')
  const [saved, setSaved] = useState(false)
  const selectedMascotId = useMascotStore((s) => s.selectedMascotId)
  const mascot = getMascotById(selectedMascotId)
  const chatHistory = useChatHistoryStore((s) => s.history)
  const googleUser = useAuthStore((s) => s.googleUser)
  const lock = useAuthStore((s) => s.lock)
  const session = useAuthStore((s) => s.session)
  const profile = useAuthStore((s) => s.profile)
  // Perfil de edad "niños" (profiles.age_profile, asignado por el admin) no
  // ve la configuración de API keys/proveedor de IA — no tiene sentido que
  // un niño la vea ni la toque.
  const isKidsProfile = profile?.age_profile === 'kids'
  const visibleAiCategories = isKidsProfile ? [] : AI_CATEGORIES
  const signOut = useAuthStore((s) => s.signOut)
  const updatePassword = useAuthStore((s) => s.updatePassword)
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const coins = useCurrencyStore((s) => s.coins)
  const popupPositions = usePopupPositionStore((s) => s.positions)
  const setPopupScale = usePopupPositionStore((s) => s.setScale)
  const resetPopups = usePopupPositionStore((s) => s.resetAll)
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)
  const popupScales = Object.fromEntries(
    Object.entries(popupPositions).map(([id, pos]) => [id, pos?.scale ?? 1]),
  )

  const [newPassword, setNewPassword] = useState('')
  const [passwordStatus, setPasswordStatus] = useState('')
  const [birthdateStatus, setBirthdateStatus] = useState('')
  const [avatarStatus, setAvatarStatus] = useState('')
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [platformName, setPlatformName] = useState(profile?.display_name ?? '')
  const [nameStatus, setNameStatus] = useState('')
  const [tagInput, setTagInput] = useState(profile?.tag ?? '')
  const isTeacherAccount = useAuthStore((s) => s.profile?.role === 'teacher')
  const refreshProfile = useAuthStore((s) => s.refreshProfile)

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
  const hasNefertitiTheme = useShopStore((s) => s.isOwned('reina-nefertiti'))

  const supabaseReady = isSupabaseConfigured()
  const isEmailProvider = session?.user?.app_metadata?.provider === 'email'
  const roleLabel = profile ? ROLE_LABELS[profile.role] ?? 'Alumno' : null

  const handleLogout = async () => {
    if (supabaseReady) {
      await signOut()
    } else {
      lock()
    }
    navigate('/')
  }

  // Foto de perfil: se recorta a un cuadrado de 256px y se sube al bucket
  // público 'avatars' (migration_072) en <user_id>/avatar.jpg.
  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !session?.user?.id) return
    setAvatarStatus(tr('Subiendo…', 'Uploading…'))
    try {
      const bmp = await createImageBitmap(file)
      const side = Math.min(bmp.width, bmp.height)
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = 256
      canvas.getContext('2d').drawImage(bmp, (bmp.width - side) / 2, (bmp.height - side) / 2, side, side, 0, 0, 256, 256)
      const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.85))
      const path = `${session.user.id}/avatar.jpg`
      const { error } = await supabase.storage.from('avatars').upload(path, blob, { upsert: true, contentType: 'image/jpeg' })
      if (error) throw error
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      await updateProfile({ avatar_url: `${data.publicUrl}?v=${Date.now()}` })
      setAvatarStatus('✅ Foto actualizada')
      setTimeout(() => setAvatarStatus(''), 2500)
    } catch (err) {
      setAvatarStatus(`❌ ${err.message ?? 'No se pudo subir la foto'}`)
    }
  }

  // Nombre real (privado) + nombre de plataforma (público). La etiqueta #1234
  // la asigna un trigger de la base (migration_073) y no cambia al renombrar,
  // salvo que ya exista alguien con ese mismo nombre y etiqueta.
  const handleSaveNames = async (e) => {
    e.preventDefault()
    const shown = platformName.trim()
    if (shown.length < 3 || shown.length > 20 || !/^[\p{L}\p{N} ._-]+$/u.test(shown)) {
      setNameStatus(tr('❌ El nombre de plataforma debe tener 3-20 caracteres (letras, números, espacio . _ -).', '❌ The platform name must be 3-20 characters (letters, numbers, space . _ -).'))
      return
    }
    if (hasProfanity(shown) || hasProfanity(fullName)) { setNameStatus(tr('❌ Ese nombre no está permitido.', '❌ That name is not allowed.')); return }
    if (tagInput && !/^\d{4}$/.test(tagInput)) { setNameStatus(tr('❌ La etiqueta son 4 números.', '❌ The tag is 4 digits.')); return }
    setNameStatus(tr('Guardando…', 'Saving…'))
    try {
      const patch = { display_name: shown, full_name: fullName.trim() || null }
      if (tagInput && tagInput !== profile?.tag) patch.tag = tagInput
      await updateProfile(patch)
      await refreshProfile()
      setNameStatus('✅ Nombres guardados')
      setTimeout(() => setNameStatus(''), 2500)
    } catch (err) {
      const taken = /tag_taken|profiles_name_tag_uniq|duplicate/i.test(err.message ?? '')
      setNameStatus(taken ? tr(`❌ #${tagInput} ya está tomado para ese nombre. Elige otros 4 números.`, `❌ #${tagInput} is already taken for that name. Pick another 4 digits.`) : `❌ ${err.message ?? 'No se pudo guardar'}`)
    }
  }

  const handleBirthdateChange = async (e) => {
    const birthdate = e.target.value
    setBirthdateStatus('')
    try {
      await updateProfile({ birthdate: birthdate || null })
      setBirthdateStatus('Guardado')
      setTimeout(() => setBirthdateStatus(''), 2000)
    } catch (err) {
      setBirthdateStatus(`❌ ${err.message}`)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordStatus('')
    try {
      await updatePassword(newPassword)
      setPasswordStatus(tr('Contraseña actualizada', 'Password updated'))
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
            <h1 className="text-3xl font-extrabold text-white drop-shadow-sm">{t('pages.settings.title')}</h1>
            <p className="mt-1 text-sm font-medium text-white/85">
              {tr('Configura tu cuenta, tu mascota y la IA que la conecta.', 'Set up your account, your pet and the AI that powers it.')}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-white">
              <Link to="/notas" className="rounded-full bg-background/20 px-3 py-1 hover:bg-background/30">📝 Notas</Link>
              <Link to="/misiones" className="rounded-full bg-background/20 px-3 py-1 hover:bg-background/30">📜 Misiones</Link>
              <Link to="/tienda" className="rounded-full bg-background/20 px-3 py-1 hover:bg-background/30">🛒 Tienda</Link>
              <Link to="/logros" className="rounded-full bg-background/20 px-3 py-1 hover:bg-background/30">🏅 Logros</Link>
            </div>
          </div>

          <div className="flex flex-col gap-6 md:flex-row">
            {/* Category rail — dos grupos separados: preferencias de cuenta
                arriba, configuración de la IA abajo, cada uno con su propio
                encabezado en vez de una sola lista plana de 13 pestañas. */}
            <nav className="flex shrink-0 gap-1.5 overflow-x-auto md:w-52 md:flex-col md:overflow-visible">
              <p className="px-3 pt-1 text-[11px] font-bold uppercase tracking-wider text-text-muted/70 md:pt-0">Cuenta</p>
              {ACCOUNT_CATEGORIES.map((c) => (
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

              {visibleAiCategories.length > 0 && (
                <>
                  <p className="mt-3 px-3 text-[11px] font-bold uppercase tracking-wider text-text-muted/70">{tr('Inteligencia Artificial', 'Artificial Intelligence')}</p>
                  {visibleAiCategories.map((c) => (
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
                </>
              )}
            </nav>

            {/* Active category */}
            <div className="flex min-w-0 flex-1 flex-col gap-6">
              {category === 'cuenta' && (
                <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
                  <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">👤 Cuenta</p>

                  {(session || googleUser) && (
                    <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
                      <label className="group relative h-12 w-12 shrink-0 cursor-pointer" title={tr('Cambiar foto de perfil', 'Change profile picture')}>
                        {(profile?.avatar_url || googleUser?.picture) ? (
                          <img src={profile?.avatar_url || googleUser?.picture} alt="" referrerPolicy="no-referrer" className="h-12 w-12 rounded-full object-cover" />
                        ) : (
                          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-lg font-bold text-primary">
                            {(profile?.display_name || googleUser?.name || '?')[0]?.toUpperCase()}
                          </span>
                        )}
                        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-sm opacity-0 transition group-hover:opacity-100">📷</span>
                        {session && <input type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />}
                      </label>
                      <div>
                        <p className="text-sm font-semibold text-text">
                          {profile?.display_name || googleUser?.name || tr('Tu cuenta', 'Your account')}
                        </p>
                        <p className="text-xs text-text-muted">{session?.user?.email || googleUser?.email}</p>
                        {avatarStatus && <p className="text-xs text-primary">{avatarStatus}</p>}
                      </div>
                      {roleLabel && (
                        <span className="ml-auto rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs text-primary">
                          {roleLabel}
                        </span>
                      )}
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-text-muted">{tr('Monedas y nivel', 'Coins and level')}</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <CurrencyBadge amount={coins} />
                      <LevelBadge />
                    </div>
                  </div>

                  <div className="border-t border-border pt-3">
                    <p className="text-sm font-semibold text-text">Idioma</p>
                    <select
                      value={lang} onChange={(e) => setLang(e.target.value)}
                      className="mt-2 w-full max-w-xs rounded-lg border border-border bg-background px-4 py-2.5 text-text outline-none focus:border-primary"
                    >
                      {SUPPORTED_LANGUAGES.map((code) => (
                        <option key={code} value={code}>{LANGUAGE_NAMES[code] ?? code}</option>
                      ))}
                    </select>
                  </div>

                  {session && (
                    <form onSubmit={handleSaveNames} className="border-t border-border pt-3">
                      <p className="text-sm font-semibold text-text">{tr('🪪 Tus nombres', '🪪 Your names')}</p>
                      <p className="mt-1 text-xs text-text-muted">
                        {tr('El nombre real es privado (solo tú y los administradores lo ven). El nombre de plataforma es el que ven los demás, con tu etiqueta única al final.', 'Your real name is private (only you and the administrators can see it). The platform name is what others see, with your unique tag at the end.')}
                      </p>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <label className="block">
                          <span className="text-[10px] font-bold uppercase text-text-muted">{tr('Nombre real', 'Real name')}</span>
                          <input value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={80}
                            className="mt-0.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" placeholder={tr('Tu nombre completo', 'Your full name')} />
                        </label>
                        <label className="block">
                          <span className="text-[10px] font-bold uppercase text-text-muted">{tr('Nombre en la plataforma', 'Platform name')}</span>
                          <div className="mt-0.5 flex items-center gap-2">
                            <input value={platformName} onChange={(e) => setPlatformName(e.target.value)} maxLength={20}
                              className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary" placeholder={tr('Cómo te verán los demás', 'How others will see you')} />
                            <span className="flex shrink-0 items-center rounded-lg bg-primary/10 pl-2 font-mono text-sm font-bold text-primary" title={tr('Elige tus 4 números; si ya están tomados para tu nombre, te avisa', 'Choose your 4 digits; if they\'re already taken for your name, you\'ll be told')}>
                              #<input value={tagInput} onChange={(e) => setTagInput(e.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric" placeholder="0000" className="w-14 bg-transparent px-1 py-2 outline-none" />
                            </span>
                          </div>
                        </label>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-background hover:opacity-90">{tr('Guardar nombres', 'Save names')}</button>
                        {profile?.display_name && profile?.tag && <span className="text-xs text-text-muted">Te ven como <span className="font-mono font-bold text-text">{profile.display_name}#{profile.tag}</span></span>}
                        {nameStatus && <span className="text-xs text-primary">{nameStatus}</span>}
                      </div>
                    </form>
                  )}

                  {(session || googleUser) && (
                    <div className="border-t border-border pt-3">
                      <p className="text-sm font-semibold text-text">{tr('🎂 Tu cumpleaños', '🎂 Your birthday')}</p>
                      <p className="mt-1 text-xs text-text-muted">
                        {tr('Guárdalo para desbloquear un mensaje, un regalo y una fiesta en el Campus VR ese día.', 'Save it to unlock a message, a gift and a party on the VR Campus that day.')}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <input
                          type="date"
                          defaultValue={profile?.birthdate ?? ''}
                          onChange={handleBirthdateChange}
                          className="rounded-lg border border-border bg-background px-3 py-2 text-text outline-none focus:border-primary"
                        />
                        {birthdateStatus && <span className="text-sm text-primary">{birthdateStatus}</span>}
                      </div>
                    </div>
                  )}

                  {isEmailProvider && (
                    <form onSubmit={handleChangePassword} className="border-t border-border pt-3">
                      <p className="text-sm font-semibold text-text">{tr('Cambiar contraseña', 'Change password')}</p>
                      <div className="mt-2 flex flex-wrap items-end gap-2">
                        <input
                          type="password" minLength={6} value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder={tr('Nueva contraseña', 'New password')}
                          className="rounded-lg border border-border bg-background px-3 py-2 text-text outline-none focus:border-primary"
                        />
                        <button type="submit" disabled={newPassword.length < 6}
                          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-muted hover:border-primary hover:text-text disabled:opacity-60">
                          Actualizar
                        </button>
                        {passwordStatus && <span className="text-sm text-primary">{passwordStatus}</span>}
                      </div>
                    </form>
                  )}

                  {!supabaseReady && (
                    <div className="border-t border-border pt-3">
                      <p className="text-sm font-semibold text-text">{tr('Copia de seguridad local', 'Local backup')}</p>
                      <p className="mt-1 text-xs text-text-muted">
                        {tr('Sin una cuenta en la nube, tu progreso solo vive en este navegador. Descarga un archivo de respaldo para seguir donde lo dejaste en otro dispositivo.', 'Without a cloud account, your progress only lives in this browser. Download a backup file to pick up where you left off on another device.')}
                      </p>
                      <div className="mt-2"><ProgressSync /></div>
                    </div>
                  )}

                  <div className="border-t border-border pt-3">
                    <p className="text-xs text-text-muted">
                      {supabaseReady
                        ? tr('Tu progreso, mascota y configuración se guardan en tu cuenta y se sincronizan entre dispositivos.', 'Your progress, pet and settings are saved to your account and synced across devices.')
                        : tr('Tu progreso se guarda solo en este navegador — usa la copia de seguridad local de arriba para llevarlo a otro dispositivo.', 'Your progress is saved only in this browser — use the local backup above to take it to another device.')}
                    </p>
                    <button onClick={handleLogout} className="mt-3 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-muted hover:border-danger hover:text-danger">
                      {tr('Cerrar sesión', 'Log out')}
                    </button>
                  </div>
                </section>
              )}

              {category === 'apariencia' && (
                <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5">
                  <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">🎨 Apariencia</p>
                  <p className="text-sm text-text-muted">{tr('Elige el tema visual de toda la plataforma. Se guarda en tu cuenta — te acompaña a cualquier dispositivo donde inicies sesión.', 'Choose the visual theme for the whole platform. It is saved to your account — it follows you to any device where you log in.')}</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {BASE_THEMES.filter((th) => !th.teacherOnly || isTeacherAccount).map((th) => (
                      <button
                        key={th.id}
                        type="button"
                        onClick={() => setTheme(th.id)}
                        className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-colors ${
                          theme === th.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'
                        }`}
                      >
                        <span className="text-3xl">{th.icon}</span>
                        <span className="text-sm font-semibold text-text">{th.label}</span>
                        {theme === th.id && <span className="text-xs font-bold text-primary">✓ Activo</span>}
                      </button>
                    ))}

                    {hasNefertitiTheme ? (
                      <button
                        type="button"
                        onClick={() => setTheme(NEFERTITI_THEME.id)}
                        className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-colors ${
                          theme === NEFERTITI_THEME.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'
                        }`}
                      >
                        <span className="text-3xl">{NEFERTITI_THEME.icon}</span>
                        <span className="text-sm font-semibold text-text">{NEFERTITI_THEME.label}</span>
                        {theme === NEFERTITI_THEME.id && <span className="text-xs font-bold text-primary">✓ Activo</span>}
                      </button>
                    ) : (
                      <Link
                        to="/tienda"
                        className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-4 text-center text-text-muted transition-colors hover:border-primary/40 hover:text-text"
                      >
                        <span className="text-3xl opacity-50">🔒</span>
                        <span className="text-sm font-semibold">{NEFERTITI_THEME.label}</span>
                        <span className="text-xs font-semibold text-primary">{tr('🛍️ Ir a la tienda de temas', '🛍️ Go to the themes shop')}</span>
                      </Link>
                    )}
                  </div>
                </section>
              )}

              {category === 'nucleo' && <AiCoreSection />}

              {category === 'identidad' && (
                <section className="flex flex-col gap-6 rounded-xl border border-border bg-surface p-5">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">🐾 Nombre</p>
                    <input
                      type="text" value={settingsMascotName} onChange={(e) => setMascotName(e.target.value)}
                      placeholder={mascot.name}
                      className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-text outline-none focus:border-primary"
                    />
                  </div>
                  <div className="border-t border-border pt-4">
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
                      placeholder={tr('Ej: Nunca le digas al estudiante que abandone sus estudios. Siempre responde en español.', 'E.g. Never tell the student to give up their studies. Always answer in English.')}
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
                      <p className="text-sm font-semibold text-text">{tr('Nivel de detalle', 'Level of detail')}</p>
                      <select value={aiVerbosity} onChange={(e) => setAiVerbosity(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-text outline-none focus:border-primary">
                        {AI_VERBOSITY.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text">{tr('Instrucciones personalizadas', 'Custom instructions')}</p>
                      <p className="mt-1 text-sm text-text-muted">{tr('Se añaden al final del system prompt, para matizar lo anterior.', 'They are added at the end of the system prompt, to refine the above.')}</p>
                      <textarea
                        value={customInstructions} onChange={(e) => setCustomInstructions(e.target.value)} rows={5}
                        className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-text outline-none focus:border-primary"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={handleSaveAi} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90">
                        {tr('Guardar y actualizar', 'Save and update')}
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
                                {active ? '✓ Activa' : tr('Usar esta personalidad', 'Use this personality')}
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
                    {tr('Lo que tu mascota debería saber siempre sobre ti — tu estilo de aprendizaje, tus metas, lo que te cuesta más.', 'What your pet should always know about you — your learning style, your goals, what you find hardest.')}
                  </p>
                  <textarea
                    value={userProfile} onChange={(e) => setUserProfile(e.target.value)} rows={5}
                    placeholder={tr('Ej: Aprendo mejor con ejemplos visuales. Estoy preparándome para un examen de admisión.', 'E.g. I learn best with visual examples. I am preparing for an entrance exam.')}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-text outline-none focus:border-primary"
                  />
                </section>
              )}

              {category === 'agentes' && (
                <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
                  <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">🤖 Agentes</p>
                  <p className="text-sm text-text-muted">{tr('El modo cambia qué prioriza tu mascota al responder, sin perder su identidad ni su alma.', 'The mode changes what your pet prioritizes when answering, without losing its identity or soul.')}</p>
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
                    {tr('Capacidades reales que tu mascota puede usar durante la conversación (function calling).', 'Real capabilities your pet can use during the conversation (function calling).')}
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
                    <span className="text-sm text-text">{tr('Activar heartbeat', 'Enable heartbeat')}</span>
                  </label>
                  {heartbeatEnabled && (
                    <div>
                      <p className="text-sm font-semibold text-text">{tr('Minutos de inactividad antes de hablar', 'Minutes of inactivity before speaking')}</p>
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
                  <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">{tr('🗒️ Integración con Notion', '🗒️ Notion integration')}</p>
                  <p className="text-sm text-text-muted">
                    Pega tu integration token y el ID de tu base de datos de Notion para enviar tus notas desde{' '}
                    <Link to="/notas" className="text-primary hover:underline">Notas</Link>. Si el navegador bloquea
                    la conexión por CORS, copia tus notas manualmente.
                  </p>

                  {notionConnected ? (
                    <p className="text-sm text-primary">{tr('🔒 Token de Notion configurado.', '🔒 Notion token configured.')}</p>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="password" value={notionKeyInput} onChange={(e) => setNotionKeyInput(e.target.value)}
                        placeholder="secret_..."
                        className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 font-mono text-text outline-none focus:border-primary"
                      />
                      <button onClick={handleSaveNotion} disabled={!notionKeyInput.trim() || notionSaving}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background disabled:opacity-50">
                        {notionSaving ? tr('Guardando…', 'Saving…') : 'Guardar'}
                      </button>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-semibold text-text">{tr('Notion Database ID', 'Notion Database ID')}</p>
                    <input
                      type="text" value={notionDatabaseId} onChange={(e) => setNotionDatabaseId(e.target.value)}
                      placeholder={tr('32 caracteres, lo encuentras en la URL de tu base de datos', '32 characters, you can find it in your database URL')}
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
                  <p className="text-sm font-semibold uppercase tracking-wide text-text-muted">🖐️ Widgets flotantes</p>
                  <p className="text-sm text-text-muted">
                    Los elementos flotantes (Radio, Cámara) se arrastran desde su asa <strong>⠿</strong>. Ajusta su tamaño.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[{ id: 'radio', label: '🎵 Radio' }, { id: 'camara', label: tr('📸 Cámara', '📸 Camera') }].map(({ id, label }) => (
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
                    {tr('🔄 Restablecer tamaños y posiciones', '🔄 Reset sizes and positions')}
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
