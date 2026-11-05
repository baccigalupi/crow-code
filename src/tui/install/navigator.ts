import { signal, type ReadonlySignal } from '@preact/signals-core'
import type { DataStore } from './data-store.ts'
import type { StepName } from './types.ts'
import { Steps } from './steps/steps.ts'

// Which step is showing, and the only way to move between steps. The step
// arrived at is told it was entered.
export class Navigator {
  private readonly steps = new Steps()
  private readonly position = signal<StepName>('repoDirectory')
  private store: DataStore

  constructor(store: DataStore) {
    this.store = store
  }

  get current(): ReadonlySignal<StepName> {
    return this.position
  }

  goTo(name: StepName) {
    this.position.value = name
    this.steps.named(name).entered(this.store)
  }
}
