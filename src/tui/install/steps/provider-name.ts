import type { DataStore } from '../data-store.ts'

export class ProviderNameStep {
  private model: DataStore
  readonly name = 'providerName'
  readonly nextStep = 'providerUrl'

  constructor(model: DataStore) {
    this.model = model
  }

  field() {
    return this.model.providers.providerName
  }

  focus(offset: number) {
    this.model.providers.focus(offset)
  }

  cancel() {
    this.model.providers.cancel()
  }
}
