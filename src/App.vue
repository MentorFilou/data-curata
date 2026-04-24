<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import Toast from '@/components/common/Toast.vue'
</script>

<template>
  <div class="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
    <AppHeader />
    <main class="max-w-content mx-auto px-4 py-8">
      <RouterView />
    </main>
    <ConfirmDialog />
    <Toast />
  </div>
</template>
