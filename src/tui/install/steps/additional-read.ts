import type { DataStore } from '../data-store.ts'

export class AdditionalReadStep {
  private model: DataStore
  readonly name = 'additionalRead'
  readonly nextStep = 'additionalWrite'

  constructor(model: DataStore) {
    this.model = model
  }

  field() {
    return this.model.permissions.additionalRead
  }
}
