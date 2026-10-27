import type { DataStore } from '../data-store.ts'

export class ConfirmStep {
  private model: DataStore
  readonly name = 'confirm'
  readonly nextStep = 'completeSetup'

  constructor(model: DataStore) {
    this.model = model
  }

  field() {
    return this.model.directories.envFile
  }
}
