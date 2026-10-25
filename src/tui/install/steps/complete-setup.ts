import type { InstallStore } from '../types.ts'
import { SetupProgress } from '../views/steps/setup-progress.tsx'

export class CompleteSetupStep {
  private installStore: InstallStore
  readonly name = 'completeSetup'
  readonly nextStep = 'completeSetup'
  readonly View = SetupProgress

  constructor(installStore: InstallStore) {
    this.installStore = installStore
  }

  state() {
    return this.installStore.envFile
  }
}
