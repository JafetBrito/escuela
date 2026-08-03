import { create } from 'zustand'
import { supabase } from '../services/supabase/client'

// Fuente de verdad de los cursos — reemplaza src/data/courses.json (catálogo)
// y src/data/courseRegistry.js (contenido) por la tabla public.courses
// (migration_024.sql), para que un admin pueda editar un curso desde
// /admin/cursos sin que nadie tenga que tocar código ni hacer un deploy.
//
// Se carga TODO (catálogo + `modules` de los 19 cursos con contenido) de una
// sola vez al arrancar (ver App.jsx), no por curso bajo demanda — a
// propósito, no por descuido: courseRegistry.js expone getCourseData()/
// hasCourseData() como funciones planas (no hooks) para que los ~13
// componentes que ya las llaman no tengan que cambiar ni una línea. Si el
// contenido se cargara curso-por-curso bajo demanda, esas funciones
// devolverían `null` en el primer render y NUNCA se volverían a llamar solas
// cuando el fetch resolviera — un componente que no está suscrito al store
// vía el hook `useCourseContentStore()` no se re-renderiza cuando el store
// cambia por su cuenta. Cargar todo de una vez, antes de que cualquier ruta
// protegida monte su primer componente (ver el gate en ProtectedRoute.jsx),
// evita ese hueco por completo. El costo extra de payload es real pero no es
// una regresión: hoy los 19 archivos de contenido YA viven sin lazy-loading
// dentro del bundle inicial de JS (ninguno pasa por React.lazy), así que
// esto reemplaza "bundleado siempre" por "descargado siempre" — mismo orden
// de magnitud, no peor.
export const useCourseContentStore = create((set, get) => ({
  catalog: [],       // array de las 48 filas (incluye `modules`, no solo metadata)
  courses: {},        // { [id]: fila } — derivado de `catalog`, para lookup por id
  loaded: false,
  loading: false,

  fetchAll: async () => {
    if (get().loaded || get().loading) return get().catalog
    set({ loading: true })
    const { data, error } = await supabase.from('courses').select('*')
    if (error) {
      // OJO: `loaded` se pone en true IGUAL en el error (con catálogo
      // vacío) — no en false. ProtectedRoute.jsx bloquea el render de toda
      // la app hasta que `loaded` sea true; si esto se queda en false para
      // siempre (ej. porque migration_024/025.sql todavía no se corrieron
      // en Supabase y la tabla `courses` no existe), NADIE puede entrar a
      // ninguna ruta protegida — pantalla de "Cargando…" infinita para
      // todo el mundo. Mejor degradar a "sin cursos" que tumbar la app
      // entera mientras la migración no esté aplicada.
      console.error('[useCourseContentStore.fetchAll]', error)
      set({ loaded: true, loading: false })
      return []
    }
    const catalog = data ?? []
    const courses = Object.fromEntries(catalog.map((c) => [c.id, c]))
    set({ catalog, courses, loaded: true, loading: false })
    return catalog
  },

  // Usado por AdminCoursesPage — sube el curso completo de una sola vez
  // (mismo criterio que AdminExamsPage.saveExam: un upsert de todo el
  // bloque, no llamadas por módulo).
  saveCourse: async (course) => {
    const { data, error } = await supabase
      .from('courses')
      .upsert({ ...course, updated_at: new Date().toISOString() }, { onConflict: 'id' })
      .select()
      .single()
    if (!error && data) {
      set((s) => ({
        courses: { ...s.courses, [data.id]: data },
        catalog: s.catalog.some((c) => c.id === data.id)
          ? s.catalog.map((c) => (c.id === data.id ? data : c))
          : [...s.catalog, data],
      }))
    }
    return { data, error }
  },
}))
