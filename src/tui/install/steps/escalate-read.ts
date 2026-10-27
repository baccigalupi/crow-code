import type { DataStore } from '../data-store.ts'
import { EscalateReadPrompt } from '../views/steps/escalate-read-prompt.tsx'

export class EscalateReadStep {
  private model: DataStore
  readonly name = 'escalateRead'
  readonly nextStep = 'escalateWrite'
  readonly View = EscalateReadPrompt

  constructor(model: DataStore) {
    this.model = model
  }

  field() {
    return this.model.permissions.escalateRead
  }
}
