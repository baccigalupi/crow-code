import { useCallback, useSyncExternalStore } from 'react'
import type { ReadonlySignal } from '@preact/signals-core'

// Reads a signal from a component and re-renders it when the value changes.
export const useSignalValue = <T>(source: ReadonlySignal<T>) => {
  const subscribe = useCallback(
    (changed: () => void) => source.subscribe(() => changed()),
    [source],
  )
  return useSyncExternalStore(subscribe, () => source.peek())
}
