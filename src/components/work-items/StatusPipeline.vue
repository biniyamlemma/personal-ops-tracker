<template>
  <div class="rounded-2xl border border-indigo-100/80 bg-gradient-to-br from-indigo-50/80 to-violet-50/50 p-4 dark:border-indigo-500/20 dark:from-indigo-950/40 dark:to-violet-950/30">
    <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-indigo-600/80 dark:text-indigo-300/80">
      Drag or click to change status
    </p>

    <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <button
        v-for="status in STATUS_ORDER"
        :key="status"
        type="button"
        class="relative rounded-xl border-2 p-3 text-left transition-all duration-200"
        :class="zoneClass(status)"
        @click="emitChange(status)"
        @dragover.prevent="dragOver = status"
        @dragleave="dragOver = null"
        @drop.prevent="onDrop(status)"
      >
        <span class="mb-1.5 flex items-center gap-1.5">
          <span class="h-2 w-2 rounded-full shadow-sm" :class="columnDot(status)" />
          <span class="text-xs font-bold text-slate-700 dark:text-slate-200">{{ formatStatus(status) }}</span>
        </span>
        <div
          v-if="currentStatus === status"
          draggable="true"
          class="mt-1 cursor-grab rounded-lg border border-white/80 bg-white/90 px-2 py-1.5 text-xs font-semibold text-slate-800 shadow-md active:cursor-grabbing dark:border-white/10 dark:bg-slate-800/90 dark:text-white"
          @dragstart="onDragStart"
          @dragend="dragOver = null"
          @click.stop
        >
          {{ itemTitle }}
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { STATUS_ORDER, formatStatus, columnDot } from '../../lib/constants'

const props = defineProps({
  currentStatus: { type: String, required: true },
  itemTitle: { type: String, default: 'Work item' },
})

const emit = defineEmits(['change'])
const dragOver = ref(null)

function zoneClass(status) {
  const isCurrent = props.currentStatus === status
  const isTarget = dragOver.value === status
  if (isCurrent) return 'border-indigo-400 bg-white/80 shadow-md shadow-indigo-500/10 dark:border-indigo-500 dark:bg-indigo-500/10'
  if (isTarget) return 'border-violet-400 bg-violet-50/80 ring-2 ring-violet-300/50 dark:border-violet-500 dark:bg-violet-500/10'
  return 'border-transparent bg-white/40 hover:border-indigo-200 hover:bg-white/60 dark:bg-white/5 dark:hover:border-indigo-500/30'
}

function onDragStart(e) { e.dataTransfer.effectAllowed = 'move' }
function onDrop(status) { dragOver.value = null; if (status !== props.currentStatus) emitChange(status) }
function emitChange(status) { if (status !== props.currentStatus) emit('change', status) }
</script>
