import type { UserInputStore } from '../types.ts'
import { ProviderPrompt } from '../views/steps/provider-prompt.tsx'
import { providerDraft } from './provider-draft.ts'

export class ProviderCredentialsStep {
  private userInputStore: UserInputStore
  readonly name = 'providerCredentials'
  readonly nextStep = 'providerName'
  readonly View = ProviderPrompt

  constructor(userInputStore: UserInputStore) {
    this.userInputStore = userInputStore
  }

  state() {
    return this.userInputStore.providerCredentials
  }

  advance() {
    providerDraft(this.userInputStore).commit()
  }

  focus(offset: number) {
    providerDraft(this.userInputStore).focus(offset)
  }

  cancel() {
    providerDraft(this.userInputStore).cancel()
  }
}
