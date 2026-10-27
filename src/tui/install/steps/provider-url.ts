import type { DataStore } from '../data-store.ts'
import { ProviderPrompt } from '../views/steps/provider-prompt.tsx'

export class ProviderUrlStep {
  private model: DataStore
  readonly name = 'providerUrl'
  readonly nextStep = 'providerCredentials'
  readonly View = ProviderPrompt

  constructor(model: DataStore) {
    this.model = model
  }

  field() {
    return this.model.providers.providerUrl
  }

  focus(offset: number) {
    this.model.providers.focus(offset)
  }

  cancel() {
    this.model.providers.cancel()
  }
}
