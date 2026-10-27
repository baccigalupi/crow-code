import type { DataStore } from '../data-store.ts'
import { AdditionalReadPrompt } from '../views/steps/additional-read-prompt.tsx'

export class AdditionalReadStep {
  private model: DataStore
  readonly name = 'additionalRead'
  readonly nextStep = 'additionalWrite'
  readonly View = AdditionalReadPrompt

  constructor(model: DataStore) {
    this.model = model
  }

  field() {
    return this.model.permissions.additionalRead
  }
}
