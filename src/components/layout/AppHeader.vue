<template>
  <header class="topbar flex min-h-14 items-center justify-between gap-2 rounded-lg px-3 py-2 sm:gap-3 sm:px-6 sm:py-0">
    <div class="flex min-w-0 flex-1 items-center gap-2">
      <button
        type="button"
        class="btn-ghost shrink-0 !p-2 lg:hidden"
        aria-label="Open menu"
        @click="sidebar.toggle()"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div class="min-w-0">
        <h1 class="page-heading truncate">{{ title }}</h1>
        <p v-if="subtitle" class="page-subheading mt-0.5 hidden truncate sm:block">{{ subtitle }}</p>
      </div>
    </div>
    <div class="flex shrink-0 items-center gap-0.5 sm:gap-2">
      <slot name="actions" />
      <NotificationBell />
      <ThemeToggle />
      <button
        class="btn-ghost hidden sm:inline-flex"
        @click="auth.signOut().then(() => $router.push({ name: 'login' }))"
      >
        Sign out
      </button>
      <button
        class="btn-ghost !p-2 sm:hidden"
        aria-label="Sign out"
        @click="auth.signOut().then(() => $router.push({ name: 'login' }))"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from '../../stores/auth'
import { useSidebar } from '../../composables/useSidebar'
import ThemeToggle from '../common/ThemeToggle.vue'
import NotificationBell from './NotificationBell.vue'

defineProps({ title: String, subtitle: String })
const auth = useAuthStore()
const sidebar = useSidebar()
</script>
