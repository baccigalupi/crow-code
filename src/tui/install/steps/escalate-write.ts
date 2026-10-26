import type { UserInputStore } from '../types.ts'
import { EscalateWritePrompt } from '../views/steps/escalate-write-prompt.tsx'

export class EscalateWriteStep {
  private userInputStore: UserInputStore
  readonly name = 'escalateWrite'
  readonly nextStep = 'allowedLocalScripts'
  readonly View = EscalateWritePrompt

  constructor(userInputStore: UserInputStore) {
    this.userInputStore = userInputStore
  }

  state() {
    return this.userInputStore.escalateWrite
  }
}
