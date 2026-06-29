<template>
  <div class="card card-hover p-5">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400">{{ label }}</p>
        <p class="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">{{ value }}</p>
        <p v-if="hint" class="mt-1.5 text-xs text-slate-400">{{ hint }}</p>
      </div>
      <div class="flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm" :class="accentBg">
        <component :is="icon" class="h-5 w-5" :class="accentText" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, h } from 'vue'

const props = defineProps({
  label: String,
  value: [Number, String],
  hint: String,
  accent: { type: String, default: 'brand' },
})

const accentBg = computed(() => ({
  brand: 'bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-500/20 dark:to-violet-500/20',
  rose: 'bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-500/20 dark:to-pink-500/20',
  emerald: 'bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-500/20 dark:to-teal-500/20',
  zinc: 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700/50 dark:to-slate-800/50',
}[props.accent]))

const accentText = computed(() => ({
  brand: 'text-indigo-600 dark:text-indigo-300',
  rose: 'text-rose-600 dark:text-rose-300',
  emerald: 'text-emerald-600 dark:text-emerald-300',
  zinc: 'text-slate-600 dark:text-slate-300',
}[props.accent]))

const icon = computed(() => {
  const icons = {
    brand: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '1.75', d: 'M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z' }),
    ]),
    rose: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '1.75', d: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z' }),
    ]),
    emerald: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '1.75', d: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }),
    ]),
    zinc: () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '1.75', d: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' }),
    ]),
  }
  return icons[props.accent] ?? icons.brand
})
</script>
