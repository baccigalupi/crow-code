import { signal, type ReadonlySignal } from '@preact/signals-core'

// The text of one input; the input itself does the editing.
export class TextFieldStore {
  private content = signal('')

  get text(): ReadonlySignal<string> {
    return this.content
  }

  replace(text: string) {
    this.content.value = text
  }

  clear() {
    this.content.value = ''
  }
}
