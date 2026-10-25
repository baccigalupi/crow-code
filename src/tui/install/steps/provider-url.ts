import type { InstallStore } from '../types.ts'
import { ProviderPrompt } from '../views/steps/provider-prompt.tsx'
import { providerDraft } from './provider-draft.ts'

export class ProviderUrlStep {
  private installStore: InstallStore
  readonly name = 'providerUrl'
  readonly nextStep = 'providerCredentials'
  readonly View = ProviderPrompt

  constructor(installStore: InstallStore) {
    this.installStore = installStore
  }

  state() {
    return this.installStore.providerUrl
  }

  focus(offset: number) {
    providerDraft(this.installStore).focus(offset)
  }

  cancel() {
    providerDraft(this.installStore).cancel()
  }
}
