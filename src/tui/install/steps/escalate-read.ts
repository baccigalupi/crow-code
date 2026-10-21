import { InstallStore } from '../types.ts'
import { EscalateReadPrompt } from '../views/steps/escalate-read-prompt.tsx'

export class EscalateReadStep {
  private installStore: InstallStore
  readonly name = 'escalateRead'
  readonly nextStep = 'escalateWrite'
  readonly View = EscalateReadPrompt

  constructor(installStore: InstallStore) {
    this.installStore = installStore
  }

  state() {
    return this.installStore.escalateRead
  }
}
