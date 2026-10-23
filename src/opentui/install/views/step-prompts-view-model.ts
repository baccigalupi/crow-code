import { currentStep } from '../steps/current.ts'
import type { InstallStore } from '../types.ts'

export const stepPromptsViewModel = (installStore: InstallStore) => {
  return { View: currentStep(installStore).View }
}
