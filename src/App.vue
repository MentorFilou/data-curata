<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import Toast from '@/components/common/Toast.vue'
</script>

<template>
  <div
    class="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100"
  >
    <AppHeader />
    <main class="flex-1 max-w-content w-full mx-auto px-4 py-8">
      <RouterView />
    </main>
    <AppFooter />
    <ConfirmDialog />
    <Toast />
  </div>
</template>
