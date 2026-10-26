import type { UserInputStore } from '../types.ts'
import { ProviderPrompt } from '../views/steps/provider-prompt.tsx'
import { providerDraft } from './provider-draft.ts'

export class ProviderUrlStep {
  private userInputStore: UserInputStore
  readonly name = 'providerUrl'
  readonly nextStep = 'providerCredentials'
  readonly View = ProviderPrompt

  constructor(userInputStore: UserInputStore) {
    this.userInputStore = userInputStore
  }

  state() {
    return this.userInputStore.providerUrl
  }

  focus(offset: number) {
    providerDraft(this.userInputStore).focus(offset)
  }

  cancel() {
    providerDraft(this.userInputStore).cancel()
  }
}
