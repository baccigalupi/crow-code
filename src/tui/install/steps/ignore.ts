import type { DataStore } from '../data-store.ts'
import { IgnorePrompt } from '../views/steps/ignore-prompt.tsx'

export class IgnoreStep {
  private model: DataStore
  readonly name = 'ignore'
  readonly nextStep = 'additionalRead'
  readonly View = IgnorePrompt

  constructor(model: DataStore) {
    this.model = model
  }

  field() {
    return this.model.permissions.ignore
  }
}
