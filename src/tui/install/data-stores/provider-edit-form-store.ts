import { batch, computed } from '@preact/signals-core'
import type { ProviderFieldState } from '../types.ts'
import { TextFieldStore } from './text-field-store.ts'

// The provider being typed across the name/url/credentials panels.
export class ProviderEditFormStore {
  private readonly order = [
    'providerName',
    'providerUrl',
    'providerCredentials',
  ] as const
  readonly providerName = new TextFieldStore()
  readonly providerUrl = new TextFieldStore()
  readonly providerCredentials = new TextFieldStore()
  readonly values = computed(() => ({
    providerName: this.providerName.text.value,
    providerUrl: this.providerUrl.text.value,
    providerCredentials: this.providerCredentials.text.value,
  }))

  provider() {
    return {
      name: this.providerName.text.peek().text,
      url: this.providerUrl.text.peek().text,
    }
  }

  credential() {
    return this.providerCredentials.text.peek().text
  }

  // Fields before the current step show their answers, the current one is
  // live, later ones are still to come.
  fieldStates(current: string): ProviderFieldState[] {
    const step = this.order.findIndex((name) => name === current)
    return this.order.map((name, index) => ({
      name,
      state: this.fieldState(index, step),
    }))
  }

  private fieldState(index: number, step: number) {
    if (index < step) {
      return 'answered'
    } else if (index === step) {
      return 'live'
    } else {
      return 'upcoming'
    }
  }

  clear() {
    batch(() => {
      this.providerName.clear()
      this.providerUrl.clear()
      this.providerCredentials.clear()
    })
  }
}
