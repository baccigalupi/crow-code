import type { DataStore } from '../data-store.ts'
import type { TextStepName } from '../types.ts'
import { TextSteps } from '../steps/text-steps.ts'

// A question's label, and the default its input shows until something is
// typed.
export class TextPromptViewModel {
  private readonly steps = new TextSteps()
  private step: TextStepName
  private store: DataStore

  constructor(step: TextStepName, store: DataStore) {
    this.step = step
    this.store = store
  }

  label() {
    return this.textStep().label
  }

  placeholder() {
    return this.textStep().placeholder(this.store)
  }

  private textStep() {
    return this.steps.named(this.step)
  }
}

export const textPromptViewModel = (step: TextStepName, store: DataStore) =>
  new TextPromptViewModel(step, store)
