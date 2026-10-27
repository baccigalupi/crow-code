import type { DataStore } from '../data-store.ts'

export class CompleteSetupStep {
  private model: DataStore
  readonly name = 'completeSetup'
  readonly nextStep = 'completeSetup'

  constructor(model: DataStore) {
    this.model = model
  }

  field() {
    return this.model.directories.envFile
  }
}
