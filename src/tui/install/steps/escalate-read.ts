import type { DataStore } from '../data-store.ts'

export class EscalateReadStep {
  private model: DataStore
  readonly name = 'escalateRead'
  readonly nextStep = 'escalateWrite'

  constructor(model: DataStore) {
    this.model = model
  }

  field() {
    return this.model.permissions.escalateRead
  }
}
