import { currentStep } from '../steps/current.ts'
import type { InstallState } from '../types.ts'

export const stepPromptsViewModel = (installState: InstallState) => {
  return { View: currentStep(installState).View }
}
