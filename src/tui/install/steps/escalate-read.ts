import { InstallState } from '../types.ts'
import { EscalateReadPrompt } from '../views/steps/escalate-read-prompt.tsx'

export class EscalateReadStep {
  private installState: InstallState
  readonly name = 'escalateRead'
  readonly nextStep = 'escalateWrite'
  readonly View = EscalateReadPrompt

  constructor(installState: InstallState) {
    this.installState = installState
  }

  state() {
    return this.installState.escalateRead
  }
}
