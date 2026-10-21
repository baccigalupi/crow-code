import { InstallStore } from '../types.ts'
import { DoneMessage } from '../views/steps/done-message.tsx'

export class DoneStep {
  private installStore: InstallStore
  readonly name = 'done'
  readonly nextStep = 'done'
  readonly View = DoneMessage

  constructor(installStore: InstallStore) {
    this.installStore = installStore
  }

  state() {
    return this.installStore.envFile
  }
}
