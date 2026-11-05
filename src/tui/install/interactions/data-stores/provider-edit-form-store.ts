import { batch, computed } from '@preact/signals-core'
import type { ProviderStepName, ProviderFieldState } from '../../types.ts'
import { TextFieldStore } from './text-field-store.ts'

// The provider being typed across the name/url/credentials panels.
export class ProviderEditFormStore {
  private readonly order: readonly string[] = [
    'providerName',
    'providerUrl',
    'providerCredentials',
  ]
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
      name: this.providerName.text.peek(),
      url: this.providerUrl.text.peek(),
    }
  }

  credential() {
    return this.providerCredentials.text.peek()
  }

  // Fields before the current step show their answers, the current one is
  // live, later ones are still to come.
  fieldState(name: ProviderStepName, current: string) {
    return this.stateAt(this.order.indexOf(name), this.order.indexOf(current))
  }

  private stateAt(index: number, step: number): ProviderFieldState {
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
