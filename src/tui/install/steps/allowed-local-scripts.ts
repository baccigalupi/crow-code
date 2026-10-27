import type { DataStore } from '../data-store.ts'

export class AllowedLocalScriptsStep {
  private model: DataStore
  readonly name = 'allowedLocalScripts'
  readonly nextStep = 'providerName'

  constructor(model: DataStore) {
    this.model = model
  }

  field() {
    return this.model.permissions.allowedLocalScripts
  }
}
