<template>
  <div class="space-y-4">
    <form class="flex gap-2" @submit.prevent="addComment">
      <input v-model="newComment" type="text" placeholder="Add a note..." class="input-field flex-1" />
      <button type="submit" :disabled="!newComment.trim() || submitting" class="btn-primary shrink-0">Add</button>
    </form>
    <div v-if="comments.length === 0" class="py-6 text-center text-sm text-zinc-400">No notes yet</div>
    <div v-for="comment in comments" :key="comment.id" class="rounded-lg bg-zinc-50 px-3.5 py-2.5 dark:bg-zinc-800/50">
      <p class="text-xs text-zinc-400">{{ formatTime(comment.created_at) }}</p>
      <p class="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{{ comment.comment }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { formatDistanceToNow } from 'date-fns'
import { useWorkItemsStore } from '../../stores/workItems'

const props = defineProps({ workItemId: String, comments: Array })
const workItems = useWorkItemsStore()
const newComment = ref('')
const submitting = ref(false)

function formatTime(date) { return formatDistanceToNow(new Date(date), { addSuffix: true }) }

async function addComment() {
  if (!newComment.value.trim()) return
  submitting.value = true
  try {
    await workItems.addComment(props.workItemId, newComment.value.trim())
    newComment.value = ''
  } finally {
    submitting.value = false
  }
}
</script>
