import { ref } from 'vue'

export interface ConfirmOptions {
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

interface ConfirmState {
  open: boolean
  options: ConfirmOptions
  resolve: (value: boolean) => void
}

const state = ref<ConfirmState | null>(null)

export function useConfirm() {
  function confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      state.value = { open: true, options, resolve }
    })
  }

  function accept() {
    if (state.value) {
      state.value.resolve(true)
      state.value = null
    }
  }

  function cancel() {
    if (state.value) {
      state.value.resolve(false)
      state.value = null
    }
  }

  return { state, confirm, accept, cancel }
}
