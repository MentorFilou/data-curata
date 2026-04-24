<script setup lang="ts">
import { useConfirm } from '@/composables/useConfirm'

const { state, accept, cancel } = useConfirm()
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="state?.open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @keydown.esc="cancel"
      >
        <div class="absolute inset-0 bg-black/40" @click="cancel" />
        <div
          class="relative bg-white dark:bg-neutral-800 rounded-xl shadow-xl max-w-md w-full p-6 space-y-4"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="state.options.title ? 'confirm-title' : undefined"
        >
          <h2
            v-if="state.options.title"
            id="confirm-title"
            class="text-lg font-semibold text-neutral-900 dark:text-neutral-100"
          >
            {{ state.options.title }}
          </h2>
          <p class="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{{ state.options.message }}</p>
          <div class="flex justify-end gap-3 pt-2">
            <button
              class="px-4 py-2 text-sm font-medium rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              @click="cancel"
            >
              {{ state.options.cancelLabel ?? 'Cancel' }}
            </button>
            <button
              :class="[
                'px-4 py-2 text-sm font-medium rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
                state.options.danger
                  ? 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500'
                  : 'bg-accent-600 text-white hover:bg-accent-700 focus-visible:ring-accent-500',
              ]"
              @click="accept"
            >
              {{ state.options.confirmLabel ?? 'OK' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
