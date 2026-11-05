import type { Keypress } from '../../keypress.ts'
import type { TextEditorArguments } from '../types.ts'
import type { TextFieldStore } from '../interactions/data-stores/text-field-store.ts'

export class TextEditor {
  private field: TextFieldStore
  private keypress: Keypress

  constructor({ field, keypress }: TextEditorArguments) {
    this.field = field
    this.keypress = keypress
  }

  edit() {
    const { key } = this.keypress
    if (key.backspace === true) this.field.deleteBackward()
    else if (key.delete === true) this.field.deleteForward()
    else this.cursorOrInsert()
  }

  private cursorOrInsert() {
    const { key } = this.keypress
    if (key.leftArrow === true) this.field.move('left')
    else if (key.rightArrow === true) this.field.move('right')
    else if (key.home === true) this.field.move('home')
    else if (key.end === true) this.field.move('end')
    else this.insert()
  }

  private skipped() {
    const { input, key } = this.keypress
    return input.length === 0 || key.ctrl === true || key.meta === true
  }

  private insert() {
    if (this.skipped()) return

    this.field.insert(this.keypress.input)
  }
}
