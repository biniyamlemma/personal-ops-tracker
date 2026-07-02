<template>
  <div class="mx-auto max-w-2xl space-y-6">
    <div class="card p-4 sm:p-5">
      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 class="font-medium text-zinc-900 dark:text-zinc-50">Reminders</h3>
          <p class="mt-0.5 text-sm text-zinc-500">Email and in-app alerts on your schedule</p>
        </div>
        <button class="btn-primary w-full !py-2 !text-xs sm:w-auto sm:!py-1.5" @click="openCreate">
          New reminder
        </button>
      </div>
      <ReminderList @edit="openEdit" />
    </div>

    <CreateReminderModal
      v-model="showModal"
      :editing-reminder="editingReminder"
      @saved="editingReminder = null"
      @created="editingReminder = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import ReminderList from '../components/reminders/ReminderList.vue'
import CreateReminderModal from '../components/reminders/CreateReminderModal.vue'
import { useRemindersStore } from '../stores/reminders'

const reminders = useRemindersStore()
const showModal = ref(false)
const editingReminder = ref(null)

function openCreate() {
  editingReminder.value = null
  showModal.value = true
}

function openEdit(reminder) {
  editingReminder.value = reminder
  showModal.value = true
}

watch(showModal, (open) => {
  if (!open) editingReminder.value = null
})

onMounted(() => reminders.fetchReminders())
</script>
