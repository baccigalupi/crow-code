import { InstallState } from '../types.ts'
import { AllowedLocalScriptsPrompt } from '../views/steps/allowed-local-scripts-prompt.tsx'

export class AllowedLocalScriptsStep {
  private installState: InstallState
  readonly name = 'allowedLocalScripts'
  readonly nextStep = 'confirm'
  readonly View = AllowedLocalScriptsPrompt

  constructor(installState: InstallState) {
    this.installState = installState
  }

  state() {
    return this.installState.allowedLocalScripts
  }
}
