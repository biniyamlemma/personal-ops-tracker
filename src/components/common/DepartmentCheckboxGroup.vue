<template>
  <div class="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
    <label class="mb-2 flex cursor-pointer items-center gap-2 border-b border-zinc-200 pb-2 dark:border-zinc-700">
      <input
        type="checkbox"
        class="h-4 w-4 rounded border-zinc-300 text-brand-600 focus:ring-brand-500"
        :checked="allSelected"
        :indeterminate.prop="someSelected && !allSelected"
        @change="toggleAll"
      />
      <span class="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Select all departments</span>
    </label>

    <div class="max-h-40 space-y-1 overflow-y-auto pt-1">
      <label
        v-for="dept in departments"
        :key="dept.id"
        class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-white dark:hover:bg-zinc-800"
      >
        <input
          type="checkbox"
          class="h-4 w-4 rounded border-zinc-300 text-brand-600 focus:ring-brand-500"
          :value="dept.id"
          :checked="modelValue.includes(dept.id)"
          @change="toggle(dept.id)"
        />
        <span class="text-sm text-zinc-700 dark:text-zinc-300">{{ dept.name }}</span>
      </label>
    </div>

    <p v-if="departments.length === 0" class="py-2 text-center text-xs text-zinc-400">
      No departments yet
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  departments: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue'])

const allSelected = computed(() =>
  props.departments.length > 0 && props.modelValue.length === props.departments.length
)

const someSelected = computed(() => props.modelValue.length > 0)

function toggle(deptId) {
  const next = props.modelValue.includes(deptId)
    ? props.modelValue.filter((id) => id !== deptId)
    : [...props.modelValue, deptId]
  emit('update:modelValue', next)
}

function toggleAll() {
  if (allSelected.value) {
    emit('update:modelValue', [])
  } else {
    emit('update:modelValue', props.departments.map((d) => d.id))
  }
}
</script>
