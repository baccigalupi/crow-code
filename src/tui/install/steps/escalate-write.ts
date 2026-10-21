import { InstallStore } from '../types.ts'
import { EscalateWritePrompt } from '../views/steps/escalate-write-prompt.tsx'

export class EscalateWriteStep {
  private installStore: InstallStore
  readonly name = 'escalateWrite'
  readonly nextStep = 'allowedLocalScripts'
  readonly View = EscalateWritePrompt

  constructor(installStore: InstallStore) {
    this.installStore = installStore
  }

  state() {
    return this.installStore.escalateWrite
  }
}
