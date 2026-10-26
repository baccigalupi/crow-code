import { currentStep } from '../steps/current.ts'
import type { UserInputStore } from '../types.ts'

export const stepPromptsViewModel = (userInputStore: UserInputStore) => {
  return { View: currentStep(userInputStore).View }
}
