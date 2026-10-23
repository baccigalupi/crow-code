import type { InstallStore } from '../types.ts'
import { AdditionalWritePrompt } from '../views/steps/additional-write-prompt.tsx'

export class AdditionalWriteStep {
  private installStore: InstallStore
  readonly name = 'additionalWrite'
  readonly nextStep = 'escalateRead'
  readonly View = AdditionalWritePrompt

  constructor(installStore: InstallStore) {
    this.installStore = installStore
  }

  state() {
    return this.installStore.additionalWrite
  }
}
