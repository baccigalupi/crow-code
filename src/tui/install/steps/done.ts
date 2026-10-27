import type { DataStore } from '../data-store.ts'

export class DoneStep {
  private model: DataStore
  readonly name = 'done'
  readonly nextStep = 'done'

  constructor(model: DataStore) {
    this.model = model
  }

  field() {
    return this.model.directories.envFile
  }
}
