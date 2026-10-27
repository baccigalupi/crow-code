import type { DataStore } from '../data-store.ts'
import { AdditionalWritePrompt } from '../views/steps/additional-write-prompt.tsx'

export class AdditionalWriteStep {
  private model: DataStore
  readonly name = 'additionalWrite'
  readonly nextStep = 'escalateRead'
  readonly View = AdditionalWritePrompt

  constructor(model: DataStore) {
    this.model = model
  }

  field() {
    return this.model.permissions.additionalWrite
  }
}
