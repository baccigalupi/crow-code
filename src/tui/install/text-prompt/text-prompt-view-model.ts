import type { DataStore } from '../data-store.ts'
import type { TextStep } from '../steps/text-step.tsx'

// A question's label, and the default its input shows until something is
// typed.
export class TextPromptViewModel {
  private step: TextStep
  private store: DataStore

  constructor(step: TextStep, store: DataStore) {
    this.step = step
    this.store = store
  }

  label() {
    return this.step.label
  }

  placeholder() {
    return this.step.placeholder(this.store)
  }
}

export const textPromptViewModel = (step: TextStep, store: DataStore) =>
  new TextPromptViewModel(step, store)
