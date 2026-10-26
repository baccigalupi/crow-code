import type { UserInputStore } from '../types.ts'
import { GlobalPathPrompt } from '../views/steps/global-path-prompt.tsx'

export class CrowGlobalDirectoryStep {
  private userInputStore: UserInputStore
  readonly name = 'crowGlobalDirectory'
  readonly nextStep = 'envFile'
  readonly View = GlobalPathPrompt

  constructor(userInputStore: UserInputStore) {
    this.userInputStore = userInputStore
  }

  state() {
    return this.userInputStore.globalDirectory
  }
}
