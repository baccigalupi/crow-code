import { signal, type ReadonlySignal } from '@preact/signals-core'
import type { DataStore } from './data-store.ts'
import type { StepName } from './types.ts'

// Which step is showing, and the only way to move between steps. The step
// arrived at is told it was entered.
export class Navigator {
  private readonly stepName = signal<StepName>('repoDirectory')
  private store: DataStore

  constructor(store: DataStore) {
    this.store = store
  }

  get current(): ReadonlySignal<StepName> {
    return this.stepName
  }

  goTo(name: StepName) {
    this.stepName.value = name
    this.store.currentStep.peek().entered(this.store)
  }
}
