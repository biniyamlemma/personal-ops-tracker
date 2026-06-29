import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export const useProfilesStore = defineStore('profiles', () => {
  const profiles = ref([])
  const profileDepartments = ref({})
  const loading = ref(false)

  function departmentsMap(data) {
    const map = {}
    for (const row of data ?? []) {
      if (!map[row.profile_id]) map[row.profile_id] = []
      map[row.profile_id].push(row.department_id)
    }
    profileDepartments.value = map
  }

  async function fetchProfileDepartments() {
    const { data, error } = await supabase
      .from('profile_departments')
      .select('profile_id, department_id')

    if (error) {
      const map = {}
      for (const p of profiles.value) {
        if (p.department_id) map[p.id] = [p.department_id]
      }
      profileDepartments.value = map
      return
    }
    departmentsMap(data)
    return data
  }

  async function fetchProfiles() {
    loading.value = true
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name')

    if (!error) profiles.value = data ?? []
    await fetchProfileDepartments()
    loading.value = false
    return data
  }

  function getDepartmentIds(profileId) {
    return profileDepartments.value[profileId] ?? []
  }

  async function updateProfile(id, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    const idx = profiles.value.findIndex((p) => p.id === id)
    if (idx !== -1) profiles.value[idx] = data
    return data
  }

  async function setProfileDepartments(profileId, departmentIds) {
    const { error: deleteError } = await supabase
      .from('profile_departments')
      .delete()
      .eq('profile_id', profileId)

    if (deleteError) throw deleteError

    if (departmentIds.length > 0) {
      const { error: insertError } = await supabase
        .from('profile_departments')
        .insert(
          departmentIds.map((department_id) => ({
            profile_id: profileId,
            department_id,
          }))
        )

      if (insertError) throw insertError
    }

    profileDepartments.value[profileId] = [...departmentIds]

    await updateProfile(profileId, {
      department_id: departmentIds[0] ?? null,
    })
  }

  async function createUser({ email, password, full_name, role, department_ids }) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) throw new Error('You must be signed in')

    const res = await fetch('/api/create-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ email, password, full_name, role, department_ids }),
    })

    let data = {}
    try {
      data = await res.json()
    } catch {
      // non-JSON response (e.g. Vite 404 page in dev)
    }

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(
          'Add User API is not available in Vite dev mode. Run `npx vercel dev` locally, or use your deployed Vercel URL.'
        )
      }
      throw new Error(data.error || `Failed to create user (${res.status})`)
    }

    return data
  }

  function getById(id) {
    return profiles.value.find((p) => p.id === id)
  }

  function getName(id) {
    const profile = getById(id)
    return profile?.full_name ?? 'Unassigned'
  }

  return {
    profiles,
    profileDepartments,
    loading,
    fetchProfiles,
    fetchProfileDepartments,
    getDepartmentIds,
    updateProfile,
    setProfileDepartments,
    createUser,
    getById,
    getName,
  }
})
