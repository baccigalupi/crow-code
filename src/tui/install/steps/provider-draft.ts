import { batch } from '@preact/signals-core'
import { emptyText } from '../../input-text.ts'
import { providerEnvVar } from '../crow-config/providers.ts'
import type { InstallStep, InstallStore } from '../types.ts'

const fieldSteps: readonly InstallStep[] = [
  'providerName',
  'providerUrl',
  'providerCredentials',
]

// The provider being typed across the name/url/credentials steps. Commit
// keeps it and starts another; cancel drops it and leaves the loop.
export class ProviderDraft {
  private installStore: InstallStore

  constructor(installStore: InstallStore) {
    this.installStore = installStore
  }

  commit() {
    batch(() => {
      this.saveProvider()
      this.saveCredential()
      this.clear()
      this.installStore.step.value = 'providerName'
    })
  }

  cancel() {
    batch(() => {
      this.clear()
      this.installStore.step.value = 'confirm'
    })
  }

  focus(offset: number) {
    const { step } = this.installStore
    const index = fieldSteps.indexOf(step.peek()) + offset
    step.value = fieldSteps[Math.min(Math.max(index, 0), fieldSteps.length - 1)]
  }

  private saveProvider() {
    const { providers, providerName, providerUrl } = this.installStore
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
    const { envBuffer, providerName } = this.installStore
    envBuffer.value = {
      ...envBuffer.peek(),
      [providerEnvVar(providerName.peek().text)]: this.credential(),
    }
  }

  private credential() {
    return this.installStore.providerCredentials.peek().text
  }

  private clear() {
    this.installStore.providerName.value = emptyText()
    this.installStore.providerUrl.value = emptyText()
    this.installStore.providerCredentials.value = emptyText()
  }
}

export const providerDraft = (installStore: InstallStore) => {
  return new ProviderDraft(installStore)
}
