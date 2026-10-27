import type { DataStore } from '../data-store.ts'

export class EnvFileStep {
  private model: DataStore
  readonly name = 'envFile'
  readonly nextStep = 'ignore'

  constructor(model: DataStore) {
    this.model = model
  }

  field() {
    return this.model.directories.envFile
  }
}
