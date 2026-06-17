/**
 * ============================================================================
 * 📝 MODAL DE EDICIÓN DE NOTAS (NoteModal.jsx)
 * ============================================================================
 * Este componente es una ventana flotante para editar o ver el detalle de una 
 * nota o link. 
 * * 🏗️ PATRÓN DE ARQUITECTURA: "Estado Borrador" (Draft State)
 * Este componente copia los valores iniciales de la nota a su estado local 
 * (`text` y `url`). Esto permite al usuario editar sin modificar la base de 
 * datos global al instante. La tienda (Zustand) solo se actualiza si se 
 * presiona "Guardar". Si se presiona "Cancelar" o la "X", los cambios locales 
 * simplemente se destruyen al desmontar el componente.
 * * ⚠️ ADVERTENCIA DE UI (Tailwind):
 * Este contenedor usa `fixed inset-0 z-50`. El `z-50` asegura que bloquee 
 * toda la pantalla. Si algún otro elemento de la app (como un TopBar o la 
 * mascota 3D) aparece por encima de este modal, revisa que no tengan un 
 * z-index mayor a 50.
 * ============================================================================
 */

import { useState } from 'react'
import { useInventoryStore } from '../../stores/useInventoryStore'

/**
 * Tipado de las Props para evitar que este modal crashee por recibir datos incompletos.
 * @typedef {Object} InventoryItem
 * @property {string|number} id - Identificador único de la nota.
 * @property {'note'|'link'} type - Determina qué campos se muestran en el formulario.
 * @property {string} [text] - Contenido principal o descripción.
 * @property {string} [url] - Enlace (solo si type es 'link').
 * @property {string} [moduleTitle] - Nombre de la clase a la que pertenece (si aplica).
 */

/**
 * @param {Object} props
 * @param {InventoryItem} props.item - La nota o link que se va a editar.
 * @param {Function} props.onClose - Función callback del padre para desmontar el modal.
 */
export default function NoteModal({ item, onClose }) {
  // --- 1. ACCIONES DEL ESTADO GLOBAL ---
  const updateItem = useInventoryStore((s) => s.updateItem)
  const removeItem = useInventoryStore((s) => s.removeItem)

  // --- 2. ESTADO LOCAL (El "Borrador") ---
  // Inicializamos el estado con los valores de la nota actual. 
  // Nota técnica: Como el modal se desmonta al cerrarse, no necesitamos un useEffect 
  // para escuchar cambios en la prop `item`.
  const [text, setText] = useState(item.text ?? '')
  const [url, setUrl] = useState(item.url ?? '')

  // --- 3. MANEJADORES DE EVENTOS ---
  
  /**
   * Empuja los cambios locales al estado global y cierra el modal.
   */
  const handleSave = () => {
    updateItem(item.id, { 
      text: text.trim(), 
      ...(item.type === 'link' ? { url: url.trim() } : {}) 
    })
    onClose()
  }

  /**
   * Elimina el objeto directamente de la base de datos y cierra el modal.
   */
  const handleDelete = () => {
    removeItem(item.id)
    onClose()
  }

  // --- 4. RENDERIZADO ---
  return (
    // 🔲 OVERLAY OSCURO (Fondo bloqueador)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      
      {/* 🪟 CONTENEDOR DEL MODAL */}
      <div className="tech-panel flex w-full max-w-lg flex-col overflow-hidden">
        
        {/* CABECERA */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <p className="tech-label text-sm">
            {item.type === 'link' ? '🔗 Link' : '📝 Nota'}
            {item.moduleTitle ? ` — ${item.moduleTitle}` : ' — General'}
          </p>
          <button 
            onClick={onClose} 
            className="text-text-muted hover:text-text" 
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* CUERPO DEL MODAL (Formulario) */}
        <div className="flex flex-col gap-3 p-5">
          {item.type === 'link' && (
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              className="tech-input rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
          )}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe tu nota…"
            className="h-40 resize-none rounded-lg border border-border bg-background p-3 text-sm text-text outline-none focus:border-primary"
          />
        </div>

        {/* PIE DEL MODAL (Acciones) */}
        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <button 
            onClick={handleDelete} 
            className="text-sm text-text-muted hover:text-danger"
          >
            Eliminar
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={onClose} 
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-text"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave} 
              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-background hover:bg-primary-hover"
            >
              Guardar
            </button>
          </div>
        </div>
        
      </div>
    </div>
  )
}