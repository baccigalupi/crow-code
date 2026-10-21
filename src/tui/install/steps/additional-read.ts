import { InstallState } from '../types.ts'
import { AdditionalReadPrompt } from '../views/steps/additional-read-prompt.tsx'

export class AdditionalReadStep {
  private installState: InstallState
  readonly name = 'additionalRead'
  readonly nextStep = 'escalateRead'
  readonly View = AdditionalReadPrompt

  constructor(installState: InstallState) {
    this.installState = installState
  }

  state() {
    return this.installState.additionalRead
  }
}
