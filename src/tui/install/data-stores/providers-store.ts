import { batch, computed } from '@preact/signals-core'
import type { InstallStep } from '../types.ts'
import { SavedProvidersStore } from './providers-store/saved-providers-store.ts'
import type { StepStore } from './step-store.ts'
import { TextFieldStore } from './text-field-store.ts'

// The provider being typed across the name/url/credentials steps, plus the
// ones already saved. Commit saves the draft and starts another; cancel drops
// it and leaves the loop.
export class ProvidersStore {
  private step: StepStore
  private saved = new SavedProvidersStore()
  private readonly fieldSteps: readonly InstallStep[] = [
    'providerName',
    'providerUrl',
    'providerCredentials',
  ]
  readonly providerName = new TextFieldStore()
  readonly providerUrl = new TextFieldStore()
  readonly providerCredentials = new TextFieldStore()
  readonly values = computed(() => this.texts())

  constructor(step: StepStore) {
    this.step = step
  }

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
      this.step.goTo('providerName')
    })
  }

  cancel() {
    batch(() => {
      this.clear()
      this.step.goTo('confirm')
    })
  }

  focus(offset: number) {
    const { fieldSteps } = this
    const index = fieldSteps.indexOf(this.step.current.peek()) + offset
    this.step.goTo(
      fieldSteps[Math.min(Math.max(index, 0), fieldSteps.length - 1)],
    )
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
    this.providerName.clear()
    this.providerUrl.clear()
    this.providerCredentials.clear()
  }
}
