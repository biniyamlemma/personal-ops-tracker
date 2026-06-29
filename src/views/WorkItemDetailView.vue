<template>
  <div v-if="loading" class="py-16 text-center text-zinc-400">Loading...</div>

  <div v-else-if="item" class="mx-auto max-w-4xl space-y-6">
    <button class="btn-ghost !px-0" @click="$router.back()">
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Back to board
    </button>

    <div class="card overflow-hidden">
      <!-- Header -->
      <div class="border-b border-zinc-100 bg-zinc-50/50 px-6 py-5 dark:border-zinc-800 dark:bg-zinc-900/30">
        <div class="flex flex-wrap items-start gap-3">
          <Badge :variant="statusVariant">{{ formatStatus(item.status) }}</Badge>
          <h2 class="w-full text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {{ item.title }}
          </h2>
          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500">
            <span class="flex items-center gap-1.5">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M2.25 21h19.5M3.75 9.75V6.75A2.25 2.25 0 016 3.75h12A2.25 2.25 0 0120.25 6.75v3M3.75 21V9.75h16.5V21" />
              </svg>
              {{ departmentName }}
            </span>
            <span class="flex items-center gap-1.5">
              <Avatar :name="assigneeName" size="sm" />
              {{ assigneeName }}
            </span>
            <span v-if="item.due_date" class="flex items-center gap-1.5">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              Due {{ formattedDueDate }}
            </span>
          </div>
        </div>
      </div>

      <!-- Status pipeline -->
      <div class="px-6 py-5">
        <StatusPipeline
          :current-status="item.status"
          :item-title="item.title"
          @change="changeStatus"
        />
      </div>

      <div v-if="item.status === 'blocked' && item.block_reason" class="mx-6 mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900/40 dark:bg-rose-950/30">
        <p class="text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400">Block Reason</p>
        <p class="mt-1 text-sm text-rose-700 dark:text-rose-300">{{ item.block_reason }}</p>
      </div>

      <div v-if="item.description" class="border-t border-zinc-100 px-6 py-5 dark:border-zinc-800">
        <h3 class="mb-2 text-sm font-semibold text-zinc-900 dark:text-white">Description</h3>
        <p class="whitespace-pre-wrap text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {{ item.description }}
        </p>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <div class="card p-6">
        <h3 class="mb-4 font-semibold text-zinc-900 dark:text-white">Comments</h3>
        <WorkItemComments :work-item-id="item.id" :comments="workItems.comments" />
      </div>
      <div class="card p-6">
        <h3 class="mb-4 font-semibold text-zinc-900 dark:text-white">Activity</h3>
        <ActivityTimeline :activities="workItems.activities" />
      </div>
    </div>
  </div>

  <div v-else class="py-16 text-center text-zinc-400">Work item not found</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { format, parseISO } from 'date-fns'
import WorkItemComments from '../components/work-items/WorkItemComments.vue'
import ActivityTimeline from '../components/work-items/ActivityTimeline.vue'
import StatusPipeline from '../components/work-items/StatusPipeline.vue'
import Badge from '../components/common/Badge.vue'
import Avatar from '../components/common/Avatar.vue'
import { formatStatus } from '../lib/constants'
import { useWorkItemsStore } from '../stores/workItems'
import { useDepartmentsStore } from '../stores/departments'
import { useProfilesStore } from '../stores/profiles'
import { useRealtime } from '../composables/useRealtime'

const route = useRoute()
const workItems = useWorkItemsStore()
const departments = useDepartmentsStore()
const profiles = useProfilesStore()
const loading = ref(true)
const item = computed(() => workItems.currentItem)

useRealtime(route.params.id)

const statusVariant = computed(() => ({
  planned: 'default', in_progress: 'brand', blocked: 'rose', completed: 'emerald',
}[item.value?.status] ?? 'default'))

const departmentName = computed(() => departments.getById(item.value?.department_id)?.name ?? 'Unknown')
const assigneeName = computed(() => item.value?.assigned_to ? profiles.getName(item.value.assigned_to) : 'Unassigned')
const formattedDueDate = computed(() => item.value?.due_date ? format(parseISO(item.value.due_date), 'MMMM d, yyyy') : null)

async function changeStatus(newStatus) {
  if (newStatus === 'blocked') {
    const reason = prompt('Why is this item blocked?')
    if (!reason) return
    await workItems.updateStatus(item.value.id, newStatus, reason)
  } else {
    await workItems.updateStatus(item.value.id, newStatus)
  }
}

onMounted(async () => {
  await workItems.fetchWorkItem(route.params.id)
  await Promise.all([workItems.fetchComments(route.params.id), workItems.fetchActivities(route.params.id)])
  loading.value = false
})
</script>
