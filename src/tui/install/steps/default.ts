import type { DataStore } from '../data-store.ts'

export class DefaultStep {
  private model: DataStore
  readonly name = 'default'
  readonly nextStep = 'confirm'
  readonly View = () => null

  constructor(model: DataStore) {
    this.model = model
  }

  field() {
    return this.model.directories.envFile
  }
}
