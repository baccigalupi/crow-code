import type { DataStore } from '../data-store.ts'
import { EscalateWritePrompt } from '../views/steps/escalate-write-prompt.tsx'

export class EscalateWriteStep {
  private model: DataStore
  readonly name = 'escalateWrite'
  readonly nextStep = 'allowedLocalScripts'
  readonly View = EscalateWritePrompt

  constructor(model: DataStore) {
    this.model = model
  }

  field() {
    return this.model.permissions.escalateWrite
  }
}
