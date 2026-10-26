import type { UserInputStore } from '../types.ts'
import { SetupProgress } from '../views/steps/setup-progress.tsx'

export class CompleteSetupStep {
  private userInputStore: UserInputStore
  readonly name = 'completeSetup'
  readonly nextStep = 'completeSetup'
  readonly View = SetupProgress

  constructor(userInputStore: UserInputStore) {
    this.userInputStore = userInputStore
  }

  state() {
    return this.userInputStore.envFile
  }
}
