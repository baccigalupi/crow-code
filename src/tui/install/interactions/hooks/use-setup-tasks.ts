import { useMemo } from 'react'
import { computed } from '@preact/signals-core'
import { useSignalValue } from '../../../use-signal-value.ts'
import type { TaskStates } from '../../types.ts'

export const noTaskStates: TaskStates = []

export const useSetupTasks = (taskStates: TaskStates) => {
  const setupTasks = useMemo(
    () => computed(() => taskStates.map((state) => state.status())),
    [taskStates],
  )
  return useSignalValue(setupTasks)
}
