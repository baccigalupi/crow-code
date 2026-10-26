import type { UserInputStore } from '../types.ts'
import { EscalateReadPrompt } from '../views/steps/escalate-read-prompt.tsx'

export class EscalateReadStep {
  private userInputStore: UserInputStore
  readonly name = 'escalateRead'
  readonly nextStep = 'escalateWrite'
  readonly View = EscalateReadPrompt

  constructor(userInputStore: UserInputStore) {
    this.userInputStore = userInputStore
  }

  state() {
    return this.userInputStore.escalateRead
  }
}
