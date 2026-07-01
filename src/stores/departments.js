import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './auth'

const DEFAULT_AREAS = ['Work', 'Personal', 'Home', 'Money', 'Health', 'Projects']

export const useDepartmentsStore = defineStore('departments', () => {
  const departments = ref([])
  const loading = ref(false)

  async function ensureDefaultAreas() {
    const auth = useAuthStore()
    if (!auth.user) return

    const { data: existing } = await supabase
      .from('departments')
      .select('id')
      .eq('user_id', auth.user.id)
      .limit(1)

    if (existing?.length) return

    const rows = DEFAULT_AREAS.map((name) => ({
      name,
      user_id: auth.user.id,
    }))

    await supabase.from('departments').insert(rows)
  }

  async function fetchDepartments() {
    loading.value = true
    await ensureDefaultAreas()

    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name')

    if (!error) departments.value = data ?? []
    loading.value = false
    return data
  }

  async function createDepartment(name) {
    const auth = useAuthStore()
    const { data, error } = await supabase
      .from('departments')
      .insert({ name, user_id: auth.user.id })
      .select()
      .single()

    if (error) throw error
    departments.value.push(data)
    departments.value.sort((a, b) => a.name.localeCompare(b.name))
    return data
  }

  async function updateDepartment(id, name) {
    const { data, error } = await supabase
      .from('departments')
      .update({ name })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    const idx = departments.value.findIndex((d) => d.id === id)
    if (idx !== -1) departments.value[idx] = data
    return data
  }

  async function deleteDepartment(id) {
    const { error } = await supabase.from('departments').delete().eq('id', id)
    if (error) throw error
    departments.value = departments.value.filter((d) => d.id !== id)
  }

  function getById(id) {
    return departments.value.find((d) => d.id === id)
  }

  return {
    departments,
    loading,
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getById,
  }
})
