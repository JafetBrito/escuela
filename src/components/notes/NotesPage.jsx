/**
 * ============================================================================
 * 📝 PÁGINA DE NOTAS E INTEGRACIÓN CON NOTION (NotesPage)
 * ============================================================================
 * Este archivo maneja la vista del "Cuaderno Digital" del estudiante.
 * Tiene dos responsabilidades principales que NO deben mezclarse:
 * 1. Mostrar las notas/links locales (guardados en el Zustand InventoryStore).
 * 2. Sincronizar y leer notas externas desde la API de Notion del usuario.
 * * ⚠️ ADVERTENCIA SOBRE SEGURIDAD Y CREDENCIALES:
 * Las credenciales de Notion (`notionApiKey` y `notionDatabaseId`) NO vienen 
 * de un archivo `.env`. Se obtienen del `useSettingsStore`, lo que significa 
 * que son ingresadas por el propio usuario y probablemente viven en su 
 * LocalStorage. Nunca intentes loggear (console.log) estas llaves en 
 * producción ni enviarlas a servidores de terceros no autorizados.
 * ============================================================================
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import AppTopBar from '../shared/AppTopBar'
import MascotCompanion from '../mascot/MascotCompanion'
import Inventory from '../inventory/Inventory'
import { useInventoryStore } from '../../stores/useInventoryStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { isNotionConfigured, fetchNotionPages } from '../../services/notion/notionClient'
import PageVideoModal from '../shared/PageVideoModal'

/**
 * ----------------------------------------------------------------------------
 * 🧩 COMPONENTE: NotionSection (Panel de Sincronización)
 * ----------------------------------------------------------------------------
 * Maneja exclusivamente la comunicación con Notion.
 * REGLA DE ARQUITECTURA: Las páginas obtenidas de Notion se guardan en el 
 * ESTADO LOCAL (`useState`), no en Zustand. Esto significa que si el usuario 
 * cambia de ruta y vuelve, las notas se limpian de la pantalla y deberá 
 * presionar "Sincronizar" nuevamente. Esto evita saturar la memoria global.
 */
function NotionSection() {
  // 1. Obtenemos las credenciales configuradas por el usuario
  const notionApiKey = useSettingsStore((s) => s.notionApiKey)
  const notionDatabaseId = useSettingsStore((s) => s.notionDatabaseId)
  const configured = isNotionConfigured({ notionApiKey, notionDatabaseId })

  // 2. Estado Local de la petición HTTP
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pages, setPages] = useState(null)

  /**
   * Ejecuta la llamada a la API de Notion a través de nuestro cliente.
   * Maneja los estados de 'loading' y 'error' para dar feedback en la UI.
   */
  const handleSync = async () => {
    setLoading(true)
    setError(null)
    
    const result = await fetchNotionPages({ notionApiKey, notionDatabaseId })
    
    if (result.ok) {
      setPages(result.pages)
    } else {
      setError(result.error)
    }
    
    setLoading(false)
  }

  return (
    <section className="tech-panel overflow-hidden rounded-2xl">
      {/* HEADER DEL PANEL DE NOTION */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🗒️</span>
          <div>
            <p className="font-bold text-white">Integración con Notion</p>
            <p className="text-xs text-white/70">
              Envía tus notas a una base de datos de Notion y consulta lo que ya tienes ahí.
            </p>
          </div>
        </div>
        {/* Badge indicador de estado */}
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            configured ? 'bg-green-500/20 text-green-300' : 'bg-amber-500/20 text-amber-300'
          }`}
        >
          {configured ? '🟢 Conectado' : '🟡 No configurado'}
        </span>
      </div>

      {/* CUERPO DEL PANEL (Lógica condicional según configuración) */}
      <div className="flex flex-col gap-3 p-4">
        {!configured ? (
          // ESTADO 1: El usuario no ha metido sus llaves API
          <p className="text-sm text-text-muted">
            Configura tu <span className="font-semibold">API key</span> y{' '}
            <span className="font-semibold">Database ID</span> de Notion en{' '}
            <Link to="/ajustes" className="text-primary hover:underline">
              Ajustes
            </Link>{' '}
            para enviar y leer notas desde tu base de datos.
          </p>
        ) : (
          // ESTADO 2: Configurado, listo para sincronizar o mostrando resultados
          <>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSync}
                disabled={loading}
                className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-background transition-colors hover:bg-primary-hover disabled:opacity-60"
              >
                {loading ? 'Sincronizando…' : '🔄 Sincronizar desde Notion'}
              </button>
              
              {/* Contador de páginas obtenidas */}
              {pages && (
                <span className="text-xs text-text-muted">
                  {pages.length} {pages.length === 1 ? 'página encontrada' : 'páginas encontradas'}
                </span>
              )}
            </div>

            {/* Renderizado de Errores de Red/API */}
            {error && <p className="text-sm text-danger">⚠️ {error}</p>}

            {/* Renderizado de la lista de páginas (Links externos a Notion) */}
            {pages && pages.length > 0 && (
              <div className="flex flex-col gap-2">
                {pages.map((page) => (
                  <a
                    key={page.id}
                    href={page.url}
                    target="_blank"
                    rel="noreferrer" // Medida de seguridad obligatoria al usar target="_blank"
                    className="tech-card flex items-center gap-2 p-2.5 text-sm text-text transition-colors hover:border-primary"
                  >
                    <span>📄</span>
                    <span className="truncate">{page.title}</span>
                  </a>
                ))}
              </div>
            )}

            {/* Empty State: Sincronizó pero la base de datos está vacía */}
            {pages && pages.length === 0 && (
              <p className="text-sm text-text-muted">No se encontraron páginas en tu base de datos.</p>
            )}
          </>
        )}
      </div>
    </section>
  )
}

/**
 * ----------------------------------------------------------------------------
 * 🖥️ COMPONENTE PRINCIPAL: NotesPage
 * ----------------------------------------------------------------------------
 * Es el contenedor padre. Su lógica de negocio es simplemente leer cuántas
 * notas y links tiene guardados el usuario internamente para el contador superior.
 */
export default function NotesPage() {
  // Leemos el inventario completo desde el estado global de Zustand
  const items = useInventoryStore((s) => s.items)
  
  // Filtramos para obtener los contadores visuales
  const noteCount = items.filter((i) => i.type === 'note').length
  const linkCount = items.filter((i) => i.type === 'link').length

  return (
    <div className="flex min-h-screen flex-col bg-background text-text">
      <AppTopBar />
      <PageVideoModal pageKey="notas" />

      <main className="flex-1 px-4 py-8 md:px-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          
          {/* HEADER HERO DE LA PÁGINA */}
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-primary/80 to-primary px-6 py-8 shadow-lg">
            <h1 className="text-3xl font-extrabold text-background drop-shadow-sm">📝 Notas</h1>
            <p className="mt-1 text-sm font-medium text-background/80">
              Tu cuaderno digital: guarda ideas, enlaces y resúmenes de cada clase.
            </p>
            
            {/* Badges de estadísticas locales */}
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="rounded-full bg-background/20 px-3 py-1 text-xs font-semibold text-background">
                📝 {noteCount} {noteCount === 1 ? 'nota' : 'notas'}
              </span>
              <span className="rounded-full bg-background/20 px-3 py-1 text-xs font-semibold text-background">
                🔗 {linkCount} {linkCount === 1 ? 'enlace' : 'enlaces'}
              </span>
            </div>
          </div>

          {/* MÓDULO EXTERNO (Notion API) */}
          <NotionSection />

          {/* MÓDULO INTERNO (Inventario Local de Notas) */}
          <section className="flex flex-col gap-3">
            <p className="tech-label">// Tu inventario de notas</p>
            <p className="text-sm text-text-muted">
              Haz clic en una nota para abrirla en una ventana emergente y editarla.
            </p>
            
            {/* NOTA TÉCNICA: El componente <Inventory /> no recibe props porque 
              él mismo se conecta a `useInventoryStore` por dentro. 
              Aquí solo se está instanciando visualmente. 
            */}
            <Inventory />
          </section>
        </div>
      </main>

      <MascotCompanion />
    </div>
  )
}