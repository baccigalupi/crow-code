import type { StepName } from '../types.ts'
import { CompleteSetupStep } from './complete-setup-step.ts'
import { ConfirmStep } from './confirm-step.ts'
import { DoneStep } from './done-step.ts'
import { ProviderSteps } from './provider-steps.ts'
import type { Step } from './step.ts'
import { TextSteps } from './text-steps.ts'

// Every step of the installer, in order, found by name.
export class Steps {
  private readonly steps: readonly Step[] = [
    ...new TextSteps().all(),
    ...new ProviderSteps().all(),
    new ConfirmStep(),
    new CompleteSetupStep(),
    new DoneStep(),
  ]

  // Every step name has a step here, so the find always matches.
  named(name: StepName) {
    return this.steps.find((step) => step.name === name) as Step
  }
}
