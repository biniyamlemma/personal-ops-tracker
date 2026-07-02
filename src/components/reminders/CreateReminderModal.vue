<template>
  <Modal v-model="open" :title="isEditing ? 'Edit reminder' : 'New reminder'">
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div>
        <label class="label">Title</label>
        <input v-model="form.title" type="text" required placeholder="e.g. Pay rent" class="input-field" />
      </div>
      <div>
        <label class="label">Message</label>
        <textarea v-model="form.message" rows="2" placeholder="Optional details..." class="input-field resize-none" />
      </div>
      <div>
        <label class="label">Email</label>
        <input v-model="form.email" type="email" required placeholder="you@example.com" class="input-field" />
      </div>
      <div>
        <label class="label">Repeat</label>
        <select v-model="form.recurrence" class="input-field">
          <option v-for="opt in RECURRENCE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
        <p v-if="recurrenceHint" class="mt-1 text-xs text-zinc-400">{{ recurrenceHint }}</p>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="label">Reminder date</label>
          <input v-model="form.date" type="date" required class="input-field" />
        </div>
        <div>
          <label class="label">Time</label>
          <input v-model="form.time" type="time" required class="input-field" />
        </div>
      </div>
      <div>
        <label class="label">Timezone</label>
        <select v-model="form.timezone" class="input-field">
          <option v-for="opt in TIMEZONE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <div class="flex justify-end gap-3 pt-2">
        <button type="button" class="btn-secondary" @click="open = false">Cancel</button>
        <button type="submit" :disabled="submitting" class="btn-primary">
          {{ submitting ? 'Saving...' : isEditing ? 'Save changes' : 'Create reminder' }}
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup>
import { ref, watch, reactive, computed } from 'vue'
import Modal from '../common/Modal.vue'
import { useAuthStore } from '../../stores/auth'
import { useRemindersStore } from '../../stores/reminders'
import {
  RECURRENCE_OPTIONS,
  TIMEZONE_OPTIONS,
  formatReminderDateTime,
} from '../../lib/reminderSchedule'

const props = defineProps({
  modelValue: Boolean,
  defaultTitle: String,
  workItemId: String,
  editingReminder: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'created', 'saved'])

const auth = useAuthStore()
const reminders = useRemindersStore()

const open = ref(props.modelValue)
const submitting = ref(false)
const error = ref('')

const isEditing = computed(() => !!props.editingReminder)

const form = reactive({
  title: '',
  message: '',
  email: '',
  recurrence: 'none',
  date: '',
  time: '09:00',
  timezone: 'UTC',
})

const recurrenceHint = computed(() => {
  if (!form.date || form.recurrence === 'none') return ''
  const [y, m, d] = form.date.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  if (form.recurrence === 'monthly') {
    return `Repeats on day ${d} of every month`
  }
  if (form.recurrence === 'weekly') {
    return `Repeats every ${date.toLocaleDateString('en-US', { weekday: 'long' })}`
  }
  if (form.recurrence === 'daily') {
    return 'Repeats every day at this time'
  }
  return ''
})

function defaultEmail() {
  return auth.profile?.notification_email || auth.profile?.email || ''
}

function defaultTimezone() {
  return auth.profile?.timezone || 'Africa/Addis_Ababa'
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function resetForm() {
  Object.assign(form, {
    title: props.defaultTitle ?? '',
    message: '',
    email: defaultEmail(),
    recurrence: 'none',
    date: todayStr(),
    time: '09:00',
    timezone: defaultTimezone(),
  })
  error.value = ''
}

function populateFromReminder(reminder) {
  const tz = defaultTimezone()
  const { date, time } = formatReminderDateTime(reminder.remind_at, tz)
  Object.assign(form, {
    title: reminder.title,
    message: reminder.message ?? '',
    email: reminder.email,
    recurrence: reminder.recurrence,
    date,
    time,
    timezone: tz,
  })
  error.value = ''
}

watch(() => props.modelValue, (val) => {
  open.value = val
  if (val) {
    if (props.editingReminder) populateFromReminder(props.editingReminder)
    else resetForm()
  }
})
watch(open, (val) => emit('update:modelValue', val))
watch(() => props.editingReminder, (reminder) => {
  if (open.value && reminder) populateFromReminder(reminder)
})

async function handleSubmit() {
  submitting.value = true
  error.value = ''
  try {
    const payload = {
      title: form.title,
      message: form.message,
      email: form.email,
      recurrence: form.recurrence,
      date: form.date,
      time: form.time,
      timezone: form.timezone,
      work_item_id: props.workItemId || null,
    }

    if (isEditing.value) {
      const item = await reminders.saveReminder(props.editingReminder.id, payload)
      emit('saved', item)
    } else {
      const item = await reminders.createReminder(payload)
      emit('created', item)
    }
    open.value = false
    resetForm()
  } catch (e) {
    error.value = e.message
  } finally {
    submitting.value = false
  }
}
</script>
