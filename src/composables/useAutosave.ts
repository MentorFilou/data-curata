import { watch, type Ref } from 'vue'

export function useAutosave<T>(
  source: Ref<T>,
  persist: (value: T) => Promise<void>,
  debounceMs = 300
): void {
  let timer: ReturnType<typeof setTimeout> | null = null

  watch(
    source,
    (value) => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        persist(value).catch(console.error)
      }, debounceMs)
    },
    { deep: true }
  )
}
