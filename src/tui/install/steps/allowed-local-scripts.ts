import type { UserInputStore } from '../types.ts'
import { AllowedLocalScriptsPrompt } from '../views/steps/allowed-local-scripts-prompt.tsx'

export class AllowedLocalScriptsStep {
  private userInputStore: UserInputStore
  readonly name = 'allowedLocalScripts'
  readonly nextStep = 'providerName'
  readonly View = AllowedLocalScriptsPrompt

  constructor(userInputStore: UserInputStore) {
    this.userInputStore = userInputStore
  }

  state() {
    return this.userInputStore.allowedLocalScripts
  }
}
