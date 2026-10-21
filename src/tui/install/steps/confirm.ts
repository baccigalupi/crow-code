import { InstallStore } from '../types.ts'
import { ConfirmPrompt } from '../views/steps/confirm-prompt.tsx'

export class ConfirmStep {
  private installStore: InstallStore
  readonly name = 'confirm'
  readonly nextStep = 'write'
  readonly View = ConfirmPrompt

  constructor(installStore: InstallStore) {
    this.installStore = installStore
  }

  state() {
    return this.installStore.envFile
  }
}
