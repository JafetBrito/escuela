/**
 * ============================================================================
 * 🗃️ COMPONENTE: INVENTARIO DE NOTAS (Inventory.jsx)
 * ============================================================================
 * Este componente es POLIMÓRFICO. Se utiliza en dos contextos muy diferentes:
 * * 1. MODO "GLOBAL" (En NotesPage.jsx):
 * Se invoca como `<Inventory />` (sin props). 
 * Comportamiento: Muestra TODAS las notas guardadas en el Zustand.
 * * 2. MODO "CLASE" (Dentro de un curso/módulo específico):
 * Se invoca como `<Inventory moduleId={1} moduleTitle="Presentación" />`.
 * Comportamiento: Permite al usuario elegir si la nota es "Para esta clase" 
 * o "General". Muestra las notas divididas en dos secciones.
 * * ⚙️ ESTADO: 
 * Este componente lee y escribe en la base de datos de Zustand local y 
 * se conecta a Notion para enviar información, no para recibirla.
 * ============================================================================
 */

import { useState } from 'react'
import { useInventoryStore } from '../../stores/useInventoryStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { isNotionConfigured, pushNoteToNotion } from '../../services/notion/notionClient'
import NoteModal from './NoteModal'

/**
 * Tipado de las Props para que el editor de código ayude a los desarrolladores.
 * * @param {Object} props
 * @param {string} [props.className] - Clases adicionales de Tailwind (opcional).
 * @param {string|number} [props.moduleId] - El ID del módulo actual si estamos dentro de un curso.
 * @param {string} [props.moduleTitle] - El título legible del módulo actual.
 */
export default function Inventory({ className = '', moduleId, moduleTitle }) {
  // --- 1. CONEXIÓN A ESTADOS GLOBALES (ZUSTAND) ---
  const items = useInventoryStore((s) => s.items)
  const addItem = useInventoryStore((s) => s.addItem)
  const removeItem = useInventoryStore((s) => s.removeItem)
  
  const notionApiKey = useSettingsStore((s) => s.notionApiKey)
  const notionDatabaseId = useSettingsStore((s) => s.notionDatabaseId)

  // --- 2. ESTADOS LOCALES (FORMULARIO E INTERFAZ) ---
  const [type, setType] = useState('note') // 'note' | 'link'
  
  // Si nos pasan un moduleId, por defecto guardamos la nota para ese módulo.
  // Si no, forzamos que sea 'general'.
  const [scope, setScope] = useState(moduleId ? 'module' : 'general')
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  
  const [activeItem, setActiveItem] = useState(null) // Controla el NoteModal
  
  // Diccionario para manejar el estado visual de subida a Notion por cada nota individual.
  // Ej: { 'nota-1': 'Enviando...', 'nota-2': 'Enviado ✅' }
  const [notionStatus, setNotionStatus] = useState({})

  // --- 3. LÓGICA DE NEGOCIO ---

  /**
   * Maneja el envío del formulario para crear una nueva nota.
   * Aplica reglas de validación básicas (no crear notas vacías).
   */
  const handleAdd = (e) => {
    e.preventDefault()
    
    // Validaciones para evitar datos basura
    if (type === 'note' && !text.trim()) return
    if (type === 'link' && !url.trim()) return

    addItem({
      type,
      text: text.trim(),
      ...(type === 'link' ? { url: url.trim() } : {}), // Solo agrega URL si es un link
      ...(scope === 'module' && moduleId ? { moduleId, moduleTitle } : {}), // Etiqueta la nota con el módulo si aplica
    })
    
    // Limpieza del formulario
    setText('')
    setUrl('')
  }

  /**
   * Envía una nota específica a la base de datos de Notion del usuario.
   * Maneja el feedback visual asíncrono con temporizadores (setTimeout).
   */
  const handleSendToNotion = async (e, item) => {
    e.stopPropagation() // Evita que se abra el NoteModal al hacer clic en el botón de enviar
    
    // Validación 1: ¿Están configuradas las llaves?
    if (!isNotionConfigured({ notionApiKey, notionDatabaseId })) {
      setNotionStatus((s) => ({ ...s, [item.id]: 'Configura tu integración de Notion en Ajustes' }))
      setTimeout(() => setNotionStatus((s) => ({ ...s, [item.id]: null })), 4000)
      return
    }

    // Proceso de envío
    setNotionStatus((s) => ({ ...s, [item.id]: 'Enviando…' }))
    const result = await pushNoteToNotion({ notionApiKey, notionDatabaseId }, item)
    
    setNotionStatus((s) => ({
      ...s,
      [item.id]: result.ok ? 'Enviado a Notion ✅' : `Error: ${result.error}`,
    }))
    
    // Limpia el mensaje después de 4 segundos
    setTimeout(() => setNotionStatus((s) => ({ ...s, [item.id]: null })), 4000)
  }

  // --- 4. DERIVACIÓN DE DATOS (Filtros según el contexto) ---
  
  // Las notas exclusivas del módulo actual (Si estamos en el Modo "Global", esto está vacío).
  const moduleItems = moduleId ? items.filter((i) => i.moduleId === moduleId) : []
  
  // Regla: Cuando NO hay moduleId (Modo Global / Notas), mostramos TODO (hasta las notas de las clases).
  // Cuando SÍ hay moduleId (Modo Clase), mostramos solo las notas marcadas como generales.
  const generalItems = moduleId ? items.filter((i) => !i.moduleId) : items


  // --- 5. RENDERIZADORES DE UI (Componentización interna) ---

  /**
   * Renderiza una sola tarjeta de nota/link. 
   * Se abstrae aquí para reutilizarlo en la lista de módulos y en la lista general.
   */
  const renderItem = (item) => (
    <div
      key={item.id}
      onClick={() => setActiveItem(item)}
      className="tech-card flex cursor-pointer items-start justify-between gap-2 p-3 text-sm"
    >
      <div className="flex min-w-0 items-start gap-2">
        <span className="mt-0.5 text-base">{item.type === 'link' ? '🔗' : '📝'}</span>
        <div className="min-w-0">
          
          {/* Contenido principal */}
          {item.type === 'link' && item.url && (
            <p className="truncate text-primary">{item.url}</p>
          )}
          {item.text && <p className="truncate text-text">{item.text}</p>}
          {!item.text && !item.url && <p className="text-text-muted italic">(vacío)</p>}
          
          {/* Metadatos (Ej: Si estamos en la vista global, decimos de qué clase viene) */}
          {!moduleId && item.moduleTitle && (
            <p className="mt-0.5 text-xs text-primary">📘 {item.moduleTitle}</p>
          )}
          
          {/* Feedback de la API de Notion */}
          {notionStatus[item.id] && (
            <p className="mt-1 text-xs text-text-muted">{notionStatus[item.id]}</p>
          )}
        </div>
      </div>
      
      {/* Botonera de acciones (Notion y Eliminar) */}
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={(e) => handleSendToNotion(e, item)}
          className="text-text-muted transition-colors hover:text-primary"
          aria-label="Enviar a Notion"
          title="Enviar a Notion"
        >
          📓
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            removeItem(item.id)
          }}
          className="text-text-muted transition-colors hover:text-danger"
          aria-label="Eliminar"
        >
          ✕
        </button>
      </div>
    </div>
  )

  // --- 6. RENDERIZADO PRINCIPAL ---
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      
      {/* 🟢 SECCIÓN: FORMULARIO DE CREACIÓN */}
      <div className="tech-card p-4">
        <p className="tech-label mb-3">// Nueva entrada</p>
        <form onSubmit={handleAdd} className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            
            {/* Selector: ¿Nota o Link? */}
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="tech-input rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-text outline-none focus:border-primary"
            >
              <option value="note">📝 Nota</option>
              <option value="link">🔗 Link</option>
            </select>
            
            {/* Selector de Alcance (SOLO visible en Modo "Clase") */}
            {moduleId && (
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className="tech-input rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-text outline-none focus:border-primary"
              >
                <option value="module">Esta clase</option>
                <option value="general">General</option>
              </select>
            )}
            
            {/* Input para URL (SOLO si el tipo es Link) */}
            {type === 'link' && (
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://…"
                className="tech-input flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-text outline-none focus:border-primary"
              />
            )}
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={type === 'note' ? 'Escribe tu nota…' : 'Descripción del link (opcional)'}
            className="h-20 resize-none rounded-lg border border-border bg-background p-2 text-sm text-text outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-primary-hover"
          >
            + Agregar
          </button>
        </form>
      </div>

      {/* 🟢 SECCIÓN: LISTA DE NOTAS (Modo Clase) */}
      {moduleId && (
        <div className="flex flex-col gap-2">
          <p className="tech-label">// Notas de esta clase</p>
          {moduleItems.length === 0 ? (
            <p className="text-sm text-text-muted">Aún no tienes notas para esta clase.</p>
          ) : (
            <div className="flex flex-col gap-2">{moduleItems.map(renderItem)}</div>
          )}
        </div>
      )}

      {/* 🟢 SECCIÓN: LISTA DE NOTAS (Modo Global) */}
      <div className="flex flex-col gap-2">
        <p className="tech-label">{moduleId ? '// Notas generales' : '// Tu inventario'}</p>
        {generalItems.length === 0 ? (
          <p className="text-sm text-text-muted">No hay notas generales por ahora.</p>
        ) : (
          <div className="flex flex-col gap-2">{generalItems.map(renderItem)}</div>
        )}
      </div>

      {/* Modal para editar la nota seleccionada */}
      {activeItem && <NoteModal item={activeItem} onClose={() => setActiveItem(null)} />}
    </div>
  )
}