import type { UserInputStore } from '../types.ts'
import { ConfirmPrompt } from '../views/steps/confirm-prompt.tsx'

export class ConfirmStep {
  private userInputStore: UserInputStore
  readonly name = 'confirm'
  readonly nextStep = 'completeSetup'
  readonly View = ConfirmPrompt

  constructor(userInputStore: UserInputStore) {
    this.userInputStore = userInputStore
  }

  state() {
    return this.userInputStore.envFile
  }
}
