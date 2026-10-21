import { InstallStore } from '../types.ts'

export class DefaultStep {
  private installStore: InstallStore
  readonly name = 'default'
  readonly nextStep = 'confirm'
  readonly View = () => null

  constructor(installStore: InstallStore) {
    this.installStore = installStore
  }

  state() {
    return this.installStore.envFile
  }
}
