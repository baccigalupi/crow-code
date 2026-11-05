import type { DataStore } from '../data-store.ts'
import type { StepName, TextStepName } from '../types.ts'
import { Step } from './step.ts'

// A one-line question: its name, what it asks, the step after it, what an
// empty answer stands for, and how its input shows that default.
export abstract class TextStep extends Step {
  abstract readonly name: TextStepName
  abstract readonly label: string
  abstract readonly next: StepName

  abstract defaultValue(store: DataStore): string

  placeholder(store: DataStore) {
    return `(${this.defaultValue(store)})`
  }
}
