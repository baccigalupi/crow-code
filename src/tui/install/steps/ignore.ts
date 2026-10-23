import type { InstallStore } from '../types.ts'
import { IgnorePrompt } from '../views/steps/ignore-prompt.tsx'

export class IgnoreStep {
  private installStore: InstallStore
  readonly name = 'ignore'
  readonly nextStep = 'additionalRead'
  readonly View = IgnorePrompt

  constructor(installStore: InstallStore) {
    this.installStore = installStore
  }

  state() {
    return this.installStore.ignore
  }
}
