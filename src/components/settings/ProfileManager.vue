<template>
  <div class="card p-5">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="font-semibold text-zinc-900 dark:text-white">Team Members</h3>
      <button class="btn-primary !py-1.5 !text-xs" @click="openAddUser">Add User</button>
    </div>

    <div class="space-y-2">
      <div
        v-for="profile in profiles.profiles"
        :key="profile.id"
        class="rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-800"
      >
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div class="flex items-center gap-3">
            <Avatar :name="profile.full_name" />
            <div>
              <p class="text-sm font-medium text-zinc-900 dark:text-white">{{ profile.full_name }}</p>
              <p class="text-xs text-zinc-500">{{ profile.email }}</p>
              <div class="mt-1.5 flex flex-wrap gap-1">
                <span
                  v-for="deptId in profiles.getDepartmentIds(profile.id)"
                  :key="deptId"
                  class="rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                >
                  {{ departmentName(deptId) }}
                </span>
                <span
                  v-if="profiles.getDepartmentIds(profile.id).length === 0"
                  class="text-[11px] text-zinc-400"
                >
                  No departments
                </span>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <select
              :value="profile.role"
              class="input-field !w-auto !py-1.5 !text-xs"
              @change="updateRole(profile.id, $event.target.value)"
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
            <button
              class="btn-secondary !py-1.5 !text-xs"
              @click="openEditDepartments(profile)"
            >
              Departments
            </button>
          </div>
        </div>
      </div>
    </div>

    <p v-if="error" class="mt-3 text-sm text-rose-600">{{ error }}</p>

    <!-- Add User -->
    <Modal v-model="showAdd" title="Add User">
      <form class="space-y-4" @submit.prevent="handleAddUser">
        <div>
          <label class="label">Full Name</label>
          <input v-model="form.full_name" type="text" required class="input-field" />
        </div>
        <div>
          <label class="label">Email</label>
          <input v-model="form.email" type="email" required class="input-field" />
        </div>
        <div>
          <label class="label">Password</label>
          <input v-model="form.password" type="password" required minlength="6" class="input-field" />
        </div>
        <div>
          <label class="label">Role</label>
          <select v-model="form.role" class="input-field">
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label class="label">Departments</label>
          <DepartmentCheckboxGroup v-model="form.department_ids" :departments="departments.departments" />
        </div>

        <p v-if="addError" class="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">
          {{ addError }}
        </p>

        <div class="flex justify-end gap-3 pt-2">
          <button type="button" class="btn-secondary" @click="showAdd = false">Cancel</button>
          <button type="submit" :disabled="adding" class="btn-primary">
            {{ adding ? 'Creating...' : 'Create User' }}
          </button>
        </div>
      </form>
    </Modal>

    <!-- Edit Departments -->
    <Modal v-model="showDeptEdit" :title="`Departments — ${editingProfile?.full_name}`">
      <DepartmentCheckboxGroup v-model="editDeptIds" :departments="departments.departments" />
      <p v-if="deptError" class="mt-3 text-sm text-rose-600">{{ deptError }}</p>
      <div class="mt-4 flex justify-end gap-3">
        <button type="button" class="btn-secondary" @click="showDeptEdit = false">Cancel</button>
        <button type="button" class="btn-primary" :disabled="savingDepts" @click="saveDepartments">
          {{ savingDepts ? 'Saving...' : 'Save' }}
        </button>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import Avatar from '../common/Avatar.vue'
import Modal from '../common/Modal.vue'
import DepartmentCheckboxGroup from '../common/DepartmentCheckboxGroup.vue'
import { useProfilesStore } from '../../stores/profiles'
import { useDepartmentsStore } from '../../stores/departments'

const profiles = useProfilesStore()
const departments = useDepartmentsStore()

const error = ref('')
const showAdd = ref(false)
const adding = ref(false)
const addError = ref('')

const showDeptEdit = ref(false)
const editingProfile = ref(null)
const editDeptIds = ref([])
const savingDepts = ref(false)
const deptError = ref('')

const form = reactive({
  full_name: '',
  email: '',
  password: '',
  role: 'employee',
  department_ids: [],
})

function departmentName(id) {
  return departments.getById(id)?.name ?? 'Unknown'
}

function resetForm() {
  Object.assign(form, {
    full_name: '', email: '', password: '', role: 'employee', department_ids: [],
  })
  addError.value = ''
}

function openAddUser() {
  resetForm()
  showAdd.value = true
}

function openEditDepartments(profile) {
  editingProfile.value = profile
  editDeptIds.value = [...profiles.getDepartmentIds(profile.id)]
  deptError.value = ''
  showDeptEdit.value = true
}

async function updateRole(id, role) {
  try {
    await profiles.updateProfile(id, { role })
  } catch (e) {
    error.value = e.message
  }
}

async function saveDepartments() {
  if (!editingProfile.value) return
  savingDepts.value = true
  deptError.value = ''
  try {
    await profiles.setProfileDepartments(editingProfile.value.id, editDeptIds.value)
    showDeptEdit.value = false
  } catch (e) {
    deptError.value = e.message
  } finally {
    savingDepts.value = false
  }
}

async function handleAddUser() {
  adding.value = true
  addError.value = ''
  try {
    await profiles.createUser({ ...form })
    showAdd.value = false
    resetForm()
    await profiles.fetchProfiles()
  } catch (e) {
    addError.value = e.message
  } finally {
    adding.value = false
  }
}
</script>
