import { currentStep } from '../../../tui/install/steps/current.ts'
import type { InstallStore } from '../../../tui/install/types.ts'
import type { StepView, StepViews } from '../types.ts'

export const noView = () => null

const stepName = (installStore: InstallStore) => {
  return currentStep(installStore).name
}

export const stepPromptsViewModel = (
  installStore: InstallStore,
  views: StepViews,
) => {
  if (views[stepName(installStore)] === undefined) {
    return { View: noView }
  }

  return { View: views[stepName(installStore)] as StepView }
}
