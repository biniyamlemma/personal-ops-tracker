<template>
  <div class="mesh-bg flex min-h-screen">
    <!-- Hero panel -->
    <div class="relative hidden w-[52%] overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-14">
      <div class="absolute inset-0 bg-gradient-to-br from-brand-600 via-accent-600 to-brand-800" />
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
      <div class="absolute -left-32 top-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div class="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-accent-400/20 blur-3xl" />

      <div class="relative">
        <div class="flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <svg viewBox="0 0 24 24" class="h-6 w-6 text-white" fill="none">
              <rect x="4" y="5" width="6" height="14" rx="1.5" fill="currentColor"/>
              <rect x="14" y="5" width="6" height="8" rx="1.5" fill="currentColor" opacity="0.7"/>
            </svg>
          </div>
          <span class="text-2xl font-bold text-white">OpsBoard</span>
        </div>
      </div>

      <div class="relative max-w-md">
        <h2 class="text-4xl font-bold leading-[1.15] tracking-tight text-white">
          Your company's pulse,<br />in one beautiful board.
        </h2>
        <p class="mt-5 text-lg leading-relaxed text-indigo-100/80">
          See what every department is working on — planned, in progress, blocked, and done — all in real time.
        </p>

        <div class="mt-12 flex gap-8">
          <div>
            <p class="text-3xl font-bold text-white">Live</p>
            <p class="mt-1 text-sm text-indigo-200/70">Realtime sync</p>
          </div>
          <div>
            <p class="text-3xl font-bold text-white">4</p>
            <p class="mt-1 text-sm text-indigo-200/70">Board columns</p>
          </div>
          <div>
            <p class="text-3xl font-bold text-white">∞</p>
            <p class="mt-1 text-sm text-indigo-200/70">Departments</p>
          </div>
        </div>
      </div>

      <p class="relative text-sm text-indigo-200/50">Trusted by teams who move fast</p>
    </div>

    <!-- Login -->
    <div class="flex flex-1 flex-col items-center justify-center p-8">
      <div class="mb-10 w-full max-w-md lg:hidden">
        <Logo size="md" :show-tagline="true" />
      </div>

      <div class="glass w-full max-w-md rounded-3xl p-8">
        <div class="mb-8 text-center lg:text-left">
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h1>
          <p class="mt-2 text-sm text-slate-500">Sign in to continue to OpsBoard</p>
        </div>

        <form class="space-y-5" @submit.prevent="handleSubmit">
          <div>
            <label class="label">Email</label>
            <input v-model="email" type="email" required autocomplete="email" class="input-field" placeholder="you@company.com" />
          </div>
          <div>
            <label class="label">Password</label>
            <input v-model="password" type="password" required autocomplete="current-password" class="input-field" placeholder="••••••••" />
          </div>

          <p v-if="error" class="rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
            {{ error }}
          </p>

          <button type="submit" :disabled="loading" class="btn-primary w-full !py-3">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="mt-6 flex justify-center">
          <ThemeToggle />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Logo from '../components/common/Logo.vue'
import ThemeToggle from '../components/common/ThemeToggle.vue'

const router = useRouter()
const auth = useAuthStore()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  loading.value = true
  error.value = ''
  try {
    await auth.signIn(email.value, password.value)
    router.push({ name: 'dashboard' })
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>
