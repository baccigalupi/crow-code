import { batch } from '@preact/signals-core'
import { emptyText } from '../../input-text.ts'
import type { InstallStep, UserInputStore } from '../types.ts'

const fieldSteps: readonly InstallStep[] = [
  'providerName',
  'providerUrl',
  'providerCredentials',
]

// The provider being typed across the name/url/credentials steps. Commit
// keeps it and starts another; cancel drops it and leaves the loop.
export class ProviderDraft {
  private userInputStore: UserInputStore

  constructor(userInputStore: UserInputStore) {
    this.userInputStore = userInputStore
  }

  commit() {
    batch(() => {
      this.saveProvider()
      this.saveCredential()
      this.clear()
      this.userInputStore.step.value = 'providerName'
    })
  }

  cancel() {
    batch(() => {
      this.clear()
      this.userInputStore.step.value = 'confirm'
    })
  }

  focus(offset: number) {
    const { step } = this.userInputStore
    const index = fieldSteps.indexOf(step.peek()) + offset
    step.value = fieldSteps[Math.min(Math.max(index, 0), fieldSteps.length - 1)]
  }

  private saveProvider() {
    const { providers, providerName, providerUrl } = this.userInputStore
    providers.value = [
      ...providers.peek(),
      { name: providerName.peek().text, url: providerUrl.peek().text },
    ]
  }

  private saveCredential() {
    if (this.credential().length === 0) return
    this.bufferCredential()
  }

  private bufferCredential() {
    const { envBuffer } = this.userInputStore
    envBuffer.value = {
      ...envBuffer.peek(),
      [this.envVar()]: this.credential(),
    }
  }

  // The env var holding a provider's credential is derived from its name, so
  // config never stores it: `Open Router` -> `OPEN_ROUTER_API_KEY`.
  private envVar() {
    const snake = this.userInputStore.providerName
      .peek()
      .text.trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
    return `${snake}_API_KEY`
  }

  private credential() {
    return this.userInputStore.providerCredentials.peek().text
  }

  private clear() {
    this.userInputStore.providerName.value = emptyText()
    this.userInputStore.providerUrl.value = emptyText()
    this.userInputStore.providerCredentials.value = emptyText()
  }
}

export const providerDraft = (userInputStore: UserInputStore) => {
  return new ProviderDraft(userInputStore)
}
