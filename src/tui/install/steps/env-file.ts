import type { InstallStore } from '../types.ts'
import { EnvPrompt } from '../views/steps/env-prompt.tsx'

export class EnvFileStep {
  private installStore: InstallStore
  readonly name = 'envFile'
  readonly nextStep = 'ignore'
  readonly View = EnvPrompt

  constructor(installStore: InstallStore) {
    this.installStore = installStore
  }

  state() {
    return this.installStore.envFile
  }
}
