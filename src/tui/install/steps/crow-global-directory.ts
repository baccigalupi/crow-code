import { InstallState } from '../types.ts'
import { GlobalPathPrompt } from '../views/steps/global-path-prompt.tsx'

export class CrowGlobalDirectoryStep {
  private installState: InstallState
  readonly name = 'crowGlobalDirectory'
  readonly nextStep = 'envFile'
  readonly View = GlobalPathPrompt

  constructor(installState: InstallState) {
    this.installState = installState
  }

  state() {
    return this.installState.globalDirectory
  }
}
