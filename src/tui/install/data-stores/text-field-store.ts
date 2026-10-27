import { signal, type ReadonlySignal } from '@preact/signals-core'
import {
  deleteBackward,
  deleteForward,
  emptyText,
  insertText,
  moveCursor,
} from '../../input-text.ts'
import type { CursorMove, InputText } from '../../types.ts'

// One text input. Every edit is a single write of the whole InputText.
export class TextFieldStore {
  private content = signal(emptyText())

  get text(): ReadonlySignal<InputText> {
    return this.content
  }

  insert(input: string) {
    this.content.value = insertText(this.content.peek(), input)
  }

  deleteBackward() {
    this.content.value = deleteBackward(this.content.peek())
  }

  deleteForward() {
    this.content.value = deleteForward(this.content.peek())
  }

  move(to: CursorMove) {
    this.content.value = moveCursor(this.content.peek(), to)
  }

  clear() {
    this.content.value = emptyText()
  }
}
