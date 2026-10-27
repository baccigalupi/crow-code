import type { DataStore } from '../data-store.ts'

export class AdditionalWriteStep {
  private model: DataStore
  readonly name = 'additionalWrite'
  readonly nextStep = 'escalateRead'

  constructor(model: DataStore) {
    this.model = model
  }

  field() {
    return this.model.permissions.additionalWrite
  }
}
