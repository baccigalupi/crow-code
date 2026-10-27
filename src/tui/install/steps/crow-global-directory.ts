import type { DataStore } from '../data-store.ts'

export class CrowGlobalDirectoryStep {
  private model: DataStore
  readonly name = 'crowGlobalDirectory'
  readonly nextStep = 'envFile'

  constructor(model: DataStore) {
    this.model = model
  }

  field() {
    return this.model.directories.globalDirectory
  }
}
