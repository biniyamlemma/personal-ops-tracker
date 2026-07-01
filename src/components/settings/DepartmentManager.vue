<template>
  <div class="card p-5">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="font-medium text-zinc-900 dark:text-zinc-50">Areas</h3>
      <button class="btn-primary !py-1.5 !text-xs" @click="showAdd = true">
        Add area
      </button>
    </div>

    <div v-if="showAdd" class="mb-4 flex gap-2">
      <input v-model="newName" type="text" placeholder="Area name" class="input-field flex-1" @keyup.enter="addArea" />
      <button class="btn-primary" @click="addArea">Save</button>
      <button class="btn-secondary" @click="showAdd = false">Cancel</button>
    </div>

    <div class="space-y-2">
      <div
        v-for="dept in departments.departments"
        :key="dept.id"
        class="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800"
      >
        <template v-if="editingId === dept.id">
          <input
            v-model="editName"
            type="text"
            class="input-field flex-1"
            @keyup.enter="saveEdit(dept.id)"
          />
          <div class="ml-2 flex gap-1">
            <button class="btn-primary !px-2 !py-1 !text-xs" @click="saveEdit(dept.id)">Save</button>
            <button class="btn-secondary !px-2 !py-1 !text-xs" @click="editingId = null">Cancel</button>
          </div>
        </template>
        <template v-else>
          <span class="text-sm font-medium">{{ dept.name }}</span>
          <div class="flex gap-1">
            <button class="rounded px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800" @click="startEdit(dept)">Edit</button>
            <button class="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" @click="removeArea(dept.id)">Delete</button>
          </div>
        </template>
      </div>
    </div>

    <p v-if="error" class="mt-3 text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useDepartmentsStore } from '../../stores/departments'

const departments = useDepartmentsStore()

const showAdd = ref(false)
const newName = ref('')
const editingId = ref(null)
const editName = ref('')
const error = ref('')

async function addArea() {
  if (!newName.value.trim()) return
  error.value = ''
  try {
    await departments.createDepartment(newName.value.trim())
    newName.value = ''
    showAdd.value = false
  } catch (e) {
    error.value = e.message
  }
}

function startEdit(dept) {
  editingId.value = dept.id
  editName.value = dept.name
}

async function saveEdit(id) {
  if (!editName.value.trim()) return
  try {
    await departments.updateDepartment(id, editName.value.trim())
    editingId.value = null
  } catch (e) {
    error.value = e.message
  }
}

async function removeArea(id) {
  if (!confirm('Delete this area? All items in it will also be deleted.')) return
  try {
    await departments.deleteDepartment(id)
  } catch (e) {
    error.value = e.message
  }
}
</script>
