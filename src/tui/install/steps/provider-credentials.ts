import type { DataStore } from '../data-store.ts'

export class ProviderCredentialsStep {
  private model: DataStore
  readonly name = 'providerCredentials'
  readonly nextStep = 'providerName'

  constructor(model: DataStore) {
    this.model = model
  }

  field() {
    return this.model.providers.providerCredentials
  }

  advance() {
    this.model.providers.commit()
  }

  focus(offset: number) {
    this.model.providers.focus(offset)
  }

  cancel() {
    this.model.providers.cancel()
  }
}
