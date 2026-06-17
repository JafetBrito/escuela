/**
 * ============================================================================
 * 💬 PANEL DE COMENTARIOS CONECTADO A DB (CommentsPanel.jsx)
 * ============================================================================
 * 
 * 
 * 
 * 
 * Este archivo marca un punto de inflexión en tu proyecto porque es el primero que analizamos que habla directamente con 
 * una base de datos real (Supabase).

Documentar componentes conectados a la base de datos a "nivel dios" requiere ir más allá de React.
 Tenemos que explicar cómo se maneja la memoria local para evitar memory leaks (fugas de memoria) 
 y dejar advertencias claras sobre la seguridad del backend, específicamente las políticas de Supabase.

Aquí tienes el código blindado. Notarás que hice mucho énfasis en explicar por qué usas la variable active 
dentro del useEffect, ya que es un patrón avanzado que los desarrolladores junior suelen borrar sin saber el daño que causan.


 * Este componente renderiza el hilo de comentarios de una clase y permite a 
 * los alumnos autenticados publicar nuevos mensajes.
 * * 🏗️ ARQUITECTURA (Supabase + Zustand):
 * - Lee la sesión actual del usuario desde `useAuthStore`.
 * - Hace peticiones HTTP directas a la tabla `course_comments` en Supabase.
 * * ⚠️ ADVERTENCIA CRÍTICA DE SEGURIDAD (Para el Backend):
 * Dado que el frontend hace un `.insert()` directo a Supabase, la tabla 
 * `course_comments` DEBE tener activado RLS (Row Level Security) en el panel 
 * de Supabase. 
 * Regla de RLS requerida: Solo los usuarios autenticados pueden insertar, y 
 * el `user_id` del insert debe coincidir con el `auth.uid()` del usuario.
 * ============================================================================
 */

import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../../services/supabase/client'
import { useAuthStore } from '../../stores/useAuthStore'

/**
 * Tipado de las Props del componente.
 * @param {Object} props
 * @param {string} props.courseId - ID del curso actual (ej: 'curso-demo').
 * @param {number|string} props.moduleId - ID de la clase/módulo actual (ej: 1).
 * @param {string} [props.className] - Clases de Tailwind adicionales para el contenedor.
 */
export default function CommentsPanel({ courseId, moduleId, className = '' }) {
  // --- 1. ESTADO GLOBAL (Autenticación) ---
  const session = useAuthStore((s) => s.session)
  const profile = useAuthStore((s) => s.profile)
  
  // --- 2. ESTADO LOCAL ---
  const [comments, setComments] = useState([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Verifica si el proyecto tiene las llaves de Supabase (.env) configuradas.
  const configured = isSupabaseConfigured()

  // --- 3. EFECTOS SECUNDARIOS (Lectura de Base de Datos) ---
  useEffect(() => {
    if (!configured) return
    
    // 🛡️ PATRÓN DE PROTECCIÓN CONTRA 'RACE CONDITIONS' Y 'MEMORY LEAKS'
    // Si el usuario cambia de clase rápido, el componente se desmonta antes de que 
    // Supabase responda. Si intentamos hacer setComments() en un componente 
    // desmontado, React lanzará un error. Esta bandera lo previene.
    let active = true

    const load = async () => {
      const { data, error: fetchError } = await supabase
        .from('course_comments')
        .select('id, author_name, content, created_at')
        .eq('course_id', courseId)
        .eq('module_id', moduleId)
        .order('created_at', { ascending: true }) // Orden cronológico (más viejos arriba)

      // Si el componente ya se desmontó, abortamos la actualización del estado.
      if (!active) return
      
      if (fetchError) {
        setError(fetchError.message)
        return
      }
      
      setComments(data ?? [])
    }

    load()
    
    // Función de limpieza (Cleanup): Se ejecuta cuando el componente se desmonta.
    return () => {
      active = false
    }
  }, [configured, courseId, moduleId]) // Se vuelve a ejecutar si el alumno cambia de clase.

  // --- 4. MANEJADORES DE EVENTOS (Escritura en Base de Datos) ---
  
  /**
   * Envía un nuevo comentario a la tabla de Supabase.
   * Utiliza la estrategia de "Esperar confirmación del servidor" antes de 
   * actualizar la UI, en lugar de "Optimistic UI".
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    
    setLoading(true)
    setError('')

    // Fallback en cascada para el nombre del autor: 
    // Nombre del perfil -> Correo electrónico -> 'Alumno' genérico.
    const authorName = profile?.display_name || session?.user?.email || 'Alumno'
    
    const { data, error: insertError } = await supabase
      .from('course_comments')
      .insert({
        course_id: courseId,
        module_id: moduleId,
        user_id: session.user.id,
        author_name: authorName,
        content: content.trim(),
      })
      // Pedimos que Supabase nos devuelva exactamente el objeto insertado 
      // para poder renderizarlo inmediatamente sin tener que recargar todo.
      .select('id, author_name, content, created_at')
      .single()

    setLoading(false)
    
    if (insertError) {
      setError(insertError.message)
      return
    }
    
    // Agregamos el nuevo comentario al final de la lista existente.
    setComments((prev) => [...prev, data])
    setContent('') // Limpiamos la caja de texto.
  }

  // --- 5. RENDERIZADO DE INTERFAZ ---
  return (
    <div className={`flex flex-col rounded-xl border border-border bg-surface p-4 ${className}`}>
      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">
        Comentarios de esta clase
      </p>

      {/* Manejo de estado sin configuración */}
      {!configured ? (
        <p className="text-sm text-text-muted">Los comentarios estarán disponibles pronto.</p>
      ) : (
        <>
          {/* LISTA DE COMENTARIOS */}
          <ul className="flex flex-col gap-3 text-sm">
            {comments.length ? (
              comments.map((comment) => (
                <li key={comment.id} className="rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-text">{comment.author_name}</span>
                    <span className="text-xs text-text-muted">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-text-muted">{comment.content}</p>
                </li>
              ))
            ) : (
              <li className="text-text-muted">Aún no hay comentarios. ¡Sé el primero!</li>
            )}
          </ul>

          {/* FORMULARIO DE CREACIÓN (Protegido por autenticación) */}
          {session ? (
            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escribe un comentario sobre esta clase…"
                rows={3}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none focus:border-primary"
              />
              {error && <p className="text-xs text-danger">{error}</p>}
              <button
                type="submit"
                disabled={loading || !content.trim()}
                className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-background hover:bg-primary-hover disabled:opacity-60"
              >
                {loading ? 'Enviando…' : 'Comentar'}
              </button>
            </form>
          ) : (
            <p className="mt-4 text-sm text-text-muted">Inicia sesión para dejar un comentario.</p>
          )}
        </>
      )}
    </div>
  )
}