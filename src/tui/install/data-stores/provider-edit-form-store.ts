import { batch, computed } from '@preact/signals-core'
import { TextFieldStore } from './text-field-store.ts'

// The provider being typed across the name/url/credentials panels.
export class ProviderEditFormStore {
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

  clear() {
    batch(() => {
      this.providerName.clear()
      this.providerUrl.clear()
      this.providerCredentials.clear()
    })
  }
}
