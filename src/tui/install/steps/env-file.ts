import type { UserInputStore } from '../types.ts'
import { EnvPrompt } from '../views/steps/env-prompt.tsx'

export class EnvFileStep {
  private userInputStore: UserInputStore
  readonly name = 'envFile'
  readonly nextStep = 'ignore'
  readonly View = EnvPrompt

  constructor(userInputStore: UserInputStore) {
    this.userInputStore = userInputStore
  }

  state() {
    return this.userInputStore.envFile
  }
}
