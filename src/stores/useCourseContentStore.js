import { create } from 'zustand'
import { supabase } from '../services/supabase/client'
import { cacheGet, cacheSet } from '../utils/idbCache'

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
const CACHE_KEY = 'courses-v1'

// OJO: NO usar el embed `profiles!teacher_id(...)` acá — a diferencia de
// student_tasks (donde profiles!student_id sí resuelve porque apunta a
// profiles), `courses.teacher_id` referencia auth.users(id), no
// profiles(id) directo. PostgREST no puede inferir esa relación
// transitiva y devuelve error en TODA la consulta ("could not find a
// relationship"), lo que dejaba `catalog`/`courses` vacíos y bloqueaba
// la entrada a absolutamente todos los cursos (bug real, encontrado
// 2026-09-07). El nombre del profesor se resuelve aparte, en
// CourseRoadmapPage.jsx, con una consulta propia y aislada.
async function refresh(set) {
  const { data, error } = await supabase.from('courses').select('*')
  if (error) {
    // `loaded` se pone en true IGUAL en el error (con catálogo vacío): ProtectedRoute bloquea
    // toda la app hasta que sea true, y si se queda en false NADIE entra a ninguna ruta.
    console.error('[useCourseContentStore.fetchAll]', error)
    set((st) => (st.loaded ? { loading: false } : { loaded: true, loading: false }))
    return []
  }
  const catalog = data ?? []
  set({ catalog, courses: Object.fromEntries(catalog.map((c) => [c.id, c])), loaded: true, loading: false })
  cacheSet(CACHE_KEY, catalog)
  return catalog
}

export const useCourseContentStore = create((set, get) => ({
  catalog: [],       // array de las 48 filas (incluye `modules`, no solo metadata)
  courses: {},        // { [id]: fila } — derivado de `catalog`, para lookup por id
  loaded: false,
  loading: false,

  // Stale-while-revalidate: la tabla completa (con todas las lecciones) es pesada y
  // ProtectedRoute bloquea el render hasta que `loaded` es true. Si ya hay una copia de la
  // visita anterior (IndexedDB), se usa AL INSTANTE y se refresca en segundo plano; solo la
  // primera visita (sin copia) espera a la red. Lo refrescado queda en el store y en la
  // caché para la próxima carga — los componentes que ya montaron siguen con la copia.
  fetchAll: async () => {
    if (get().loaded || get().loading) return get().catalog
    set({ loading: true })
    const cached = await cacheGet(CACHE_KEY)
    if (Array.isArray(cached) && cached.length > 0) {
      set({ catalog: cached, courses: Object.fromEntries(cached.map((c) => [c.id, c])), loaded: true, loading: false })
      refresh(set) // sin await: no bloquea
      return cached
    }
    return refresh(set)
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
