import { create } from 'zustand'
import { supabase } from '../services/supabase/client'

// Store chico y enfocado solo en "el admin gestiona el perfil de edad de
// cada alumno" (profiles.age_profile) — no se reutiliza useTasksStore.js
// porque esto no es temáticamente parte de Tareas.
export const useAdminUsersStore = create((set) => ({
  students: [],
  loading: false,

  fetchStudents: async () => {
    set({ loading: true })
    const { data } = await supabase
      .from('profiles')
      .select('id, email, display_name, age_profile')
      .eq('role', 'student')
      .order('display_name')
    set({ students: data ?? [], loading: false })
  },

  setAgeProfile: async (studentId, ageProfile) => {
    const { error } = await supabase
      .from('profiles')
      .update({ age_profile: ageProfile })
      .eq('id', studentId)
    if (!error) {
      set((s) => ({
        students: s.students.map((st) => (st.id === studentId ? { ...st, age_profile: ageProfile } : st)),
      }))
    }
    return { error }
  },
}))
