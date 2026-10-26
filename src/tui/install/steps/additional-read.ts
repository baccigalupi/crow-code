import type { UserInputStore } from '../types.ts'
import { AdditionalReadPrompt } from '../views/steps/additional-read-prompt.tsx'

export class AdditionalReadStep {
  private userInputStore: UserInputStore
  readonly name = 'additionalRead'
  readonly nextStep = 'additionalWrite'
  readonly View = AdditionalReadPrompt

  constructor(userInputStore: UserInputStore) {
    this.userInputStore = userInputStore
  }

  state() {
    return this.userInputStore.additionalRead
  }
}
