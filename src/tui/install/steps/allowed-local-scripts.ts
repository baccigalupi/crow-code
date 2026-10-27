import type { DataStore } from '../data-store.ts'
import { AllowedLocalScriptsPrompt } from '../views/steps/allowed-local-scripts-prompt.tsx'

export class AllowedLocalScriptsStep {
  private model: DataStore
  readonly name = 'allowedLocalScripts'
  readonly nextStep = 'providerName'
  readonly View = AllowedLocalScriptsPrompt

  constructor(model: DataStore) {
    this.model = model
  }

  field() {
    return this.model.permissions.allowedLocalScripts
  }
}
