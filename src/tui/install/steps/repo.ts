import type { DataStore } from '../data-store.ts'
import { RepoPathPrompt } from '../views/steps/repo-path-prompt.tsx'

export class RepoStep {
  private model: DataStore
  readonly name = 'repo'
  readonly nextStep = 'crowGlobalDirectory'
  readonly View = RepoPathPrompt

  constructor(model: DataStore) {
    this.model = model
  }

  field() {
    return this.model.directories.repoDirectory
  }
}
