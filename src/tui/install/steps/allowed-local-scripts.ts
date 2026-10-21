import { InstallStore } from '../types.ts'
import { AllowedLocalScriptsPrompt } from '../views/steps/allowed-local-scripts-prompt.tsx'

export class AllowedLocalScriptsStep {
  private installStore: InstallStore
  readonly name = 'allowedLocalScripts'
  readonly nextStep = 'confirm'
  readonly View = AllowedLocalScriptsPrompt

  constructor(installStore: InstallStore) {
    this.installStore = installStore
  }

  state() {
    return this.installStore.allowedLocalScripts
  }
}
