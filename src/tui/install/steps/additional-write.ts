import type { UserInputStore } from '../types.ts'
import { AdditionalWritePrompt } from '../views/steps/additional-write-prompt.tsx'

export class AdditionalWriteStep {
  private userInputStore: UserInputStore
  readonly name = 'additionalWrite'
  readonly nextStep = 'escalateRead'
  readonly View = AdditionalWritePrompt

  constructor(userInputStore: UserInputStore) {
    this.userInputStore = userInputStore
  }

  state() {
    return this.userInputStore.additionalWrite
  }
}
