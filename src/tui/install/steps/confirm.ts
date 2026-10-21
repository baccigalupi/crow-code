import { InstallState } from '../types.ts'
import { ConfirmPrompt } from '../views/steps/confirm-prompt.tsx'

export class ConfirmStep {
  private installState: InstallState
  readonly name = 'confirm'
  readonly nextStep = 'write'
  readonly View = ConfirmPrompt

  constructor(installState: InstallState) {
    this.installState = installState
  }

  state() {
    return this.installState.envFile
  }
}
