import type { UserInputStore } from '../types.ts'
import { RepoPathPrompt } from '../views/steps/repo-path-prompt.tsx'

export class RepoStep {
  private userInputStore: UserInputStore
  readonly name = 'repo'
  readonly nextStep = 'crowGlobalDirectory'
  readonly View = RepoPathPrompt

  constructor(userInputStore: UserInputStore) {
    this.userInputStore = userInputStore
  }

  state() {
    return this.userInputStore.repoDirectory
  }
}
