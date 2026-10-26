import type { UserInputStore } from '../types.ts'
import { IgnorePrompt } from '../views/steps/ignore-prompt.tsx'

export class IgnoreStep {
  private userInputStore: UserInputStore
  readonly name = 'ignore'
  readonly nextStep = 'additionalRead'
  readonly View = IgnorePrompt

  constructor(userInputStore: UserInputStore) {
    this.userInputStore = userInputStore
  }

  state() {
    return this.userInputStore.ignore
  }
}
