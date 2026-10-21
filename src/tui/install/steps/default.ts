import { InstallState } from '../types.ts'

export class DefaultStep {
  private installState: InstallState
  readonly name = 'default'
  readonly nextStep = 'confirm'
  readonly View = () => null

  constructor(installState: InstallState) {
    this.installState = installState
  }

  state() {
    return this.installState.envFile
  }
}
