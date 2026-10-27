import type { DataStore } from '../data-store.ts'

export class IgnoreStep {
  private model: DataStore
  readonly name = 'ignore'
  readonly nextStep = 'additionalRead'

  constructor(model: DataStore) {
    this.model = model
  }

  field() {
    return this.model.permissions.ignore
  }
}
