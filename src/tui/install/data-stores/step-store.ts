import { signal, type ReadonlySignal } from '@preact/signals-core'
import type { InstallStep } from '../types.ts'

// Which install prompt is showing.
export class StepStore {
  private currentStep = signal<InstallStep>('repo')

  get current(): ReadonlySignal<InstallStep> {
    return this.currentStep
  }

  goTo(step: InstallStep) {
    this.currentStep.value = step
  }
}
