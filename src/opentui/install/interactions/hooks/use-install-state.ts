import { useMemo } from 'react'
import { computed } from '@preact/signals-core'
import { useSignalValue } from '../../../use-signal-value.ts'
import type { InstallState, InstallStore } from '../../types.ts'

const installState = (installStore: InstallStore) => {
  const entries = Object.entries(installStore).map(([key, source]) => [
    key,
    source.value,
  ])
  return Object.fromEntries(entries) as InstallState
}

export const useInstallState = (installStore: InstallStore) => {
  const state = useMemo(
    () => computed(() => installState(installStore)),
    [installStore],
  )
  return useSignalValue(state)
}
