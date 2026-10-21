import { InstallStore } from '../types.ts'
import { AdditionalReadPrompt } from '../views/steps/additional-read-prompt.tsx'

export class AdditionalReadStep {
  private installStore: InstallStore
  readonly name = 'additionalRead'
  readonly nextStep = 'escalateRead'
  readonly View = AdditionalReadPrompt

  constructor(installStore: InstallStore) {
    this.installStore = installStore
  }

  state() {
    return this.installStore.additionalRead
  }
}
