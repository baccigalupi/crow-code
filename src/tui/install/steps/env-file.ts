import { InstallState } from '../types.ts'
import { EnvPrompt } from '../views/steps/env-prompt.tsx'

export class EnvFileStep {
  private installState: InstallState
  readonly name = 'envFile'
  readonly nextStep = 'escalateRead'
  readonly View = EnvPrompt

  constructor(installState: InstallState) {
    this.installState = installState
  }

  state() {
    return this.installState.envFile
  }
}
