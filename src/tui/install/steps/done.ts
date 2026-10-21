import { InstallState } from '../types.ts'
import { DoneMessage } from '../views/steps/done-message.tsx'

export class DoneStep {
  private installState: InstallState
  readonly name = 'done'
  readonly nextStep = 'done'
  readonly View = DoneMessage

  constructor(installState: InstallState) {
    this.installState = installState
  }

  state() {
    return this.installState.envFile
  }
}
