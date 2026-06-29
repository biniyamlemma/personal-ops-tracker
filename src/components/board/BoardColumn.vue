<template>
  <div
    class="card flex min-w-[272px] flex-1 flex-col overflow-hidden border-t-[3px]"
    :class="columnAccent(status)"
  >
    <div class="flex items-center gap-2 px-4 py-4">
      <span class="h-2.5 w-2.5 rounded-full shadow-sm" :class="columnDot(status)" />
      <h3 class="flex-1 text-sm font-bold text-slate-700 dark:text-slate-200">
        {{ formatStatus(status) }}
      </h3>
      <span class="rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-bold text-slate-500 shadow-sm dark:bg-slate-800/80 dark:text-slate-400">
        {{ localItems.length }}
      </span>
    </div>

    <draggable
      v-model="localItems"
      group="work-items"
      item-key="id"
      handle=".drag-handle"
      :animation="220"
      ghost-class="opacity-40 scale-[0.97]"
      drag-class="rotate-1 shadow-2xl"
      class="flex min-h-[300px] flex-1 flex-col gap-3 px-3 pb-4"
      @change="onDragChange"
    >
      <template #item="{ element }">
        <WorkItemCard :item="element" />
      </template>
    </draggable>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'
import WorkItemCard from './WorkItemCard.vue'
import { formatStatus, columnAccent, columnDot } from '../../lib/constants'
import { useWorkItemsStore } from '../../stores/workItems'

const props = defineProps({
  status: { type: String, required: true },
  items: { type: Array, required: true },
})

const workItems = useWorkItemsStore()
const localItems = ref([...props.items])

watch(() => props.items, (newItems) => { localItems.value = [...newItems] }, { deep: true })

async function onDragChange(evt) {
  if (evt.added) {
    const item = evt.added.element
    if (item.status !== props.status) {
      try {
        if (props.status === 'blocked') {
          const reason = prompt('Why is this item blocked?')
          if (!reason) { localItems.value = [...props.items]; return }
          await workItems.updateStatus(item.id, props.status, reason)
        } else {
          await workItems.updateStatus(item.id, props.status)
        }
      } catch {
        localItems.value = [...props.items]
      }
    }
  }
}
</script>
