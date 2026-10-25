import type { InstallStore } from '../types.ts'
import { ProviderPrompt } from '../views/steps/provider-prompt.tsx'
import { providerDraft } from './provider-draft.ts'

export class ProviderCredentialsStep {
  private installStore: InstallStore
  readonly name = 'providerCredentials'
  readonly nextStep = 'providerName'
  readonly View = ProviderPrompt

  constructor(installStore: InstallStore) {
    this.installStore = installStore
  }

  state() {
    return this.installStore.providerCredentials
  }

  advance() {
    providerDraft(this.installStore).commit()
  }

  focus(offset: number) {
    providerDraft(this.installStore).focus(offset)
  }

  cancel() {
    providerDraft(this.installStore).cancel()
  }
}
