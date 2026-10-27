import type { DataStore } from '../data-store.ts'

export class EscalateWriteStep {
  private model: DataStore
  readonly name = 'escalateWrite'
  readonly nextStep = 'allowedLocalScripts'

  constructor(model: DataStore) {
    this.model = model
  }

  field() {
    return this.model.permissions.escalateWrite
  }
}
