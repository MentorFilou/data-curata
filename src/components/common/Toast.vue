<script setup lang="ts">
import { useUiStore } from '@/stores/ui'
import { CheckCircle, XCircle, Info, X } from 'lucide-vue-next'

const uiStore = useUiStore()

const iconMap = { success: CheckCircle, error: XCircle, info: Info }
const colorMap = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      <TransitionGroup name="toast">
        <div
          v-for="toast in uiStore.toasts"
          :key="toast.id"
          :class="['flex items-start gap-3 px-4 py-3 rounded-lg border shadow-md text-sm', colorMap[toast.type]]"
          role="alert"
        >
          <component :is="iconMap[toast.type]" class="w-4 h-4 shrink-0 mt-0.5" />
          <span class="flex-1">{{ toast.message }}</span>
          <button @click="uiStore.removeToast(toast.id)" class="hover:opacity-70">
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(1rem);
}
</style>
