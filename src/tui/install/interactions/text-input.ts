import type { KeyFlags } from '../../types.ts'
import type { TextFieldStore } from '../data-stores/text-field-store.ts'

type TextInputArguments = {
  readonly field: TextFieldStore
  readonly input: string
  readonly key: KeyFlags
}

export class TextInput {
  private field: TextFieldStore
  private input: string
  private key: KeyFlags

  constructor({ field, input, key }: TextInputArguments) {
    this.field = field
    this.input = input
    this.key = key
  }

  edit() {
    if (this.key.backspace === true) this.field.deleteBackward()
    else if (this.key.delete === true) this.field.deleteForward()
    else this.cursorOrInsert()
  }

  private cursorOrInsert() {
    if (this.key.leftArrow === true) this.field.move('left')
    else if (this.key.rightArrow === true) this.field.move('right')
    else if (this.key.home === true) this.field.move('home')
    else if (this.key.end === true) this.field.move('end')
    else this.insert()
  }

  private skipped() {
    if (this.input.length === 0) return true
    return this.key.ctrl === true || this.key.meta === true
  }

  private insert() {
    if (this.skipped()) return

    this.field.insert(this.input)
  }
}
