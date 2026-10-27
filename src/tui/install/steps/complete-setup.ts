import type { DataStore } from '../data-store.ts'
import { SetupProgress } from '../views/steps/setup-progress.tsx'

export class CompleteSetupStep {
  private model: DataStore
  readonly name = 'completeSetup'
  readonly nextStep = 'completeSetup'
  readonly View = SetupProgress

  constructor(model: DataStore) {
    this.model = model
  }

  field() {
    return this.model.directories.envFile
  }
}
