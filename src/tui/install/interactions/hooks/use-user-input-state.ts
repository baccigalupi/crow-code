import { useMemo } from 'react'
import { computed } from '@preact/signals-core'
import { useSignalValue } from '../../../use-signal-value.ts'
import type { UserInputData, UserInputStore } from '../../types.ts'

const userInputState = (userInputStore: UserInputStore) => {
  const entries = Object.entries(userInputStore).map(([key, source]) => [
    key,
    source.value,
  ])
  return Object.fromEntries(entries) as UserInputData
}

export const useUserInputState = (userInputStore: UserInputStore) => {
  const state = useMemo(
    () => computed(() => userInputState(userInputStore)),
    [userInputStore],
  )
  return useSignalValue(state)
}
