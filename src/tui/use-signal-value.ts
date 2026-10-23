import { useCallback, useSyncExternalStore } from 'react'
import type { ReadonlySignal } from '@preact/signals-core'

export const useSignalValue = <T>(source: ReadonlySignal<T>): T => {
  const subscribe = useCallback(
    (onChange: () => void) => source.subscribe(() => onChange()),
    [source],
  )
  return useSyncExternalStore(subscribe, () => source.peek())
}
