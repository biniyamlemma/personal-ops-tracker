<template>
  <div class="app-shell flex h-screen overflow-hidden">
    <div
      v-if="sidebar.open"
      class="fixed inset-0 z-30 bg-zinc-950/50 backdrop-blur-sm lg:hidden"
      aria-hidden="true"
      @click="sidebar.close()"
    />

    <AppSidebar />

    <div class="flex min-w-0 flex-1 flex-col overflow-hidden">
      <div class="shrink-0 p-3 pb-0 sm:p-4">
        <AppHeader :title="pageTitle" :subtitle="pageSubtitle">
          <template #actions>
            <slot name="header-actions" />
          </template>
        </AppHeader>
      </div>
      <main class="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import { useDepartmentsStore } from '../../stores/departments'
import { useWorkItemsStore } from '../../stores/workItems'
import { useRealtime } from '../../composables/useRealtime'
import { provideSidebar } from '../../composables/useSidebar'

const route = useRoute()
const departments = useDepartmentsStore()
const workItems = useWorkItemsStore()
const sidebar = provideSidebar()

useRealtime()

onMounted(async () => {
  await Promise.all([
    departments.fetchDepartments(),
    workItems.fetchWorkItems(),
  ])
})

watch(() => route.fullPath, () => sidebar.close())

const pageTitle = computed(() => {
  if (route.name === 'dashboard') return 'Overview'
  if (route.name === 'board') return departments.getById(route.params.departmentId)?.name ?? 'Board'
  if (route.name === 'work-item-detail') return 'Item'
  if (route.name === 'reminders') return 'Reminders'
  if (route.name === 'settings') return 'Settings'
  return 'My Ops'
})

const pageSubtitle = computed(() => {
  if (route.name === 'dashboard') return 'What you are working on right now'
  if (route.name === 'board') return 'Drag items between columns to update status'
  if (route.name === 'reminders') return 'Email and in-app alerts on your schedule'
  if (route.name === 'settings') return 'Manage your areas and notifications'
  return null
})
</script>
