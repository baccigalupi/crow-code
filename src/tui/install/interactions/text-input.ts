import {
  deleteBackward,
  deleteForward,
  insertText,
  moveCursor,
} from '../../input-buffer.ts'
import type { Signal } from '@preact/signals-core'
import type { CursorMove, InputBuffer, KeyFlags } from '../../types.ts'

type TextInputArguments = {
  readonly text: Signal<InputBuffer>
  readonly input: string
  readonly key: KeyFlags
}

export class TextInput {
  private text: Signal<InputBuffer>
  private input: string
  private key: KeyFlags

  constructor({ text, input, key }: TextInputArguments) {
    this.text = text
    this.input = input
    this.key = key
  }

  edit() {
    if (this.key.backspace === true) this.deleteBackward()
    else if (this.key.delete === true) this.deleteForward()
    else this.cursorOrInsert()
  }

  private deleteBackward() {
    this.text.value = deleteBackward(this.text.peek())
  }

  private deleteForward() {
    this.text.value = deleteForward(this.text.peek())
  }

  private cursorOrInsert() {
    if (this.key.leftArrow === true) this.move('left')
    else if (this.key.rightArrow === true) this.move('right')
    else if (this.key.home === true) this.move('home')
    else if (this.key.end === true) this.move('end')
    else this.insert()
  }

  private move(to: CursorMove) {
    this.text.value = moveCursor(this.text.peek(), to)
  }

  private skipped() {
    if (this.input.length === 0) return true
    return this.key.ctrl === true || this.key.meta === true
  }

  private insert() {
    if (this.skipped()) return

    this.text.value = insertText(this.text.peek(), this.input)
  }
}

export const textInput = (textInputArguments: TextInputArguments) => {
  return new TextInput(textInputArguments)
}
