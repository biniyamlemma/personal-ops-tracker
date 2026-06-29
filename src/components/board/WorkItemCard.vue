<template>
  <div
    class="card card-hover overflow-hidden"
    :class="item.status === 'blocked' ? 'ring-2 ring-rose-200/80 dark:ring-rose-500/30' : ''"
  >
    <div class="flex items-stretch">
      <button
        type="button"
        class="drag-handle flex shrink-0 cursor-grab items-center border-r border-slate-100/80 px-2.5 text-slate-300 transition hover:bg-indigo-50/50 hover:text-indigo-400 active:cursor-grabbing dark:border-white/5 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
        title="Drag to change status"
        @click.stop
      >
        <svg class="h-4 w-5" viewBox="0 0 20 20" fill="currentColor">
          <circle cx="7" cy="5" r="1.5" /><circle cx="13" cy="5" r="1.5" />
          <circle cx="7" cy="10" r="1.5" /><circle cx="13" cy="10" r="1.5" />
          <circle cx="7" cy="15" r="1.5" /><circle cx="13" cy="15" r="1.5" />
        </svg>
      </button>

      <RouterLink
        :to="{ name: 'work-item-detail', params: { id: item.id } }"
        class="min-w-0 flex-1 p-4"
      >
        <div class="mb-2.5 flex items-start justify-between gap-2">
          <h3 class="text-sm font-semibold leading-snug text-slate-800 dark:text-white">{{ item.title }}</h3>
          <Badge v-if="item.status === 'blocked'" variant="rose">Blocked</Badge>
        </div>
        <div class="flex items-center justify-between text-xs text-slate-500">
          <div class="flex items-center gap-1.5">
            <Avatar :name="assigneeName" size="sm" />
            <span>{{ assigneeName }}</span>
          </div>
          <span v-if="item.due_date" :class="isOverdue ? 'font-semibold text-rose-500' : ''">
            {{ formattedDueDate }}
          </span>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { format, isPast, parseISO } from 'date-fns'
import { useProfilesStore } from '../../stores/profiles'
import Avatar from '../common/Avatar.vue'
import Badge from '../common/Badge.vue'

const props = defineProps({ item: { type: Object, required: true } })
const profiles = useProfilesStore()

const assigneeName = computed(() =>
  props.item.assigned_to ? profiles.getName(props.item.assigned_to) : 'Unassigned'
)

const formattedDueDate = computed(() => {
  if (!props.item.due_date) return null
  return format(parseISO(props.item.due_date), 'MMM d')
})

const isOverdue = computed(() => {
  if (!props.item.due_date || props.item.status === 'completed') return false
  return isPast(parseISO(props.item.due_date))
})
</script>
