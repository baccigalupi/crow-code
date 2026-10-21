import { InstallState } from '../types.ts'
import { EscalateWritePrompt } from '../views/steps/escalate-write-prompt.tsx'

export class EscalateWriteStep {
  private installState: InstallState
  readonly name = 'escalateWrite'
  readonly nextStep = 'allowedLocalScripts'
  readonly View = EscalateWritePrompt

  constructor(installState: InstallState) {
    this.installState = installState
  }

  state() {
    return this.installState.escalateWrite
  }
}
