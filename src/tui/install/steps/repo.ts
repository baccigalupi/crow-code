import { InstallStore } from '../types.ts'
import { RepoPathPrompt } from '../views/steps/repo-path-prompt.tsx'

export class RepoStep {
  private installStore: InstallStore
  readonly name = 'repo'
  readonly nextStep = 'crowGlobalDirectory'
  readonly View = RepoPathPrompt

  constructor(installStore: InstallStore) {
    this.installStore = installStore
  }

  state() {
    return this.installStore.repoDirectory
  }
}
