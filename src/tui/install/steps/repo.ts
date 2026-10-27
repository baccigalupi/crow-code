import type { DataStore } from '../data-store.ts'

export class RepoStep {
  private model: DataStore
  readonly name = 'repo'
  readonly nextStep = 'crowGlobalDirectory'

  constructor(model: DataStore) {
    this.model = model
  }

  field() {
    return this.model.directories.repoDirectory
  }
}
