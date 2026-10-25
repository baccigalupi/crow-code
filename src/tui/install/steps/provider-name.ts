import type { InstallStore } from '../types.ts'
import { ProviderPrompt } from '../views/steps/provider-prompt.tsx'
import { providerDraft } from './provider-draft.ts'

export class ProviderNameStep {
  private installStore: InstallStore
  readonly name = 'providerName'
  readonly nextStep = 'providerUrl'
  readonly View = ProviderPrompt

  constructor(installStore: InstallStore) {
    this.installStore = installStore
  }

  state() {
    return this.installStore.providerName
  }

  focus(offset: number) {
    providerDraft(this.installStore).focus(offset)
  }

  cancel() {
    providerDraft(this.installStore).cancel()
  }
}
