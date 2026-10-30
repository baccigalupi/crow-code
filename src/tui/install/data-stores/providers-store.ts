import { batch, computed } from '@preact/signals-core'
import { SavedProvidersStore } from './providers-store/saved-providers-store.ts'
import { TextFieldStore } from './text-field-store.ts'

// The provider being typed across the name/url/credentials steps, plus the
// ones already saved. Commit saves the draft and starts another; cancel drops
// it.
export class ProvidersStore {
  private saved = new SavedProvidersStore()
  readonly providerName = new TextFieldStore()
  readonly providerUrl = new TextFieldStore()
  readonly providerCredentials = new TextFieldStore()
  readonly values = computed(() => this.texts())

  get providers() {
    return this.saved.providers
  }

  get envBuffer() {
    return this.saved.envBuffer
  }

  commit() {
    batch(() => {
      this.saved.save(this.draft(), this.providerCredentials.text.peek().text)
      this.clear()
    })
  }

  cancel() {
    this.clear()
  }

  private draft() {
    return {
      name: this.providerName.text.peek().text,
      url: this.providerUrl.text.peek().text,
    }
  }

  private texts() {
    return {
      providerName: this.providerName.text.value,
      providerUrl: this.providerUrl.text.value,
      providerCredentials: this.providerCredentials.text.value,
      providers: this.saved.providers.value,
      envBuffer: this.saved.envBuffer.value,
    }
  }

  private clear() {
    batch(() => {
      this.providerName.clear()
      this.providerUrl.clear()
      this.providerCredentials.clear()
    })
  }
}
