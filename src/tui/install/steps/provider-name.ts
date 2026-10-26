import type { UserInputStore } from '../types.ts'
import { ProviderPrompt } from '../views/steps/provider-prompt.tsx'
import { providerDraft } from './provider-draft.ts'

export class ProviderNameStep {
  private userInputStore: UserInputStore
  readonly name = 'providerName'
  readonly nextStep = 'providerUrl'
  readonly View = ProviderPrompt

  constructor(userInputStore: UserInputStore) {
    this.userInputStore = userInputStore
  }

  state() {
    return this.userInputStore.providerName
  }

  focus(offset: number) {
    providerDraft(this.userInputStore).focus(offset)
  }

  cancel() {
    providerDraft(this.userInputStore).cancel()
  }
}
