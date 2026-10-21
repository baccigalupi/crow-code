import { useMemo } from 'react'
import { computed } from '@preact/signals-core'
import { useSignalValue } from '../../../use-signal-value.ts'
import type { InstallState, InstallValues } from '../../types.ts'

const installValues = (installState: InstallState) => {
  const entries = Object.entries(installState).map(([key, source]) => [
    key,
    source.value,
  ])
  return Object.fromEntries(entries) as InstallValues
}

export const useInstallValues = (installState: InstallState) => {
  const values = useMemo(() => computed(() => installValues(installState)), [
    installState,
  ])
  return useSignalValue(values)
}
