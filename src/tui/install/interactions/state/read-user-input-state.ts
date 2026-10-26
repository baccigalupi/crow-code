import type { UserInputData, UserInputStore } from '../../types.ts'

export const readUserInputState = (userInputStore: UserInputStore) => {
  const entries = Object.entries(userInputStore).map(([key, source]) => [
    key,
    source.peek(),
  ])
  return Object.fromEntries(entries) as UserInputData
}
