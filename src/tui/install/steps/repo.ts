import { InstallState } from '../types.ts'
import { RepoPathPrompt } from '../views/steps/repo-path-prompt.tsx'

export class RepoStep {
  private installState: InstallState
  readonly name = 'repo'
  readonly nextStep = 'crowGlobalDirectory'
  readonly View = RepoPathPrompt

  constructor(installState: InstallState) {
    this.installState = installState
  }

  state() {
    return this.installState.repoDirectory
  }
}
