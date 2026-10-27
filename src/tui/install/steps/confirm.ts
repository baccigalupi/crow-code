import type { DataStore } from '../data-store.ts'
import { ConfirmPrompt } from '../views/steps/confirm-prompt.tsx'

export class ConfirmStep {
  private model: DataStore
  readonly name = 'confirm'
  readonly nextStep = 'completeSetup'
  readonly View = ConfirmPrompt

  constructor(model: DataStore) {
    this.model = model
  }

  field() {
    return this.model.directories.envFile
  }
}
