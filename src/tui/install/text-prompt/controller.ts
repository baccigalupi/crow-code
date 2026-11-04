import type { Keypress } from '../../keypress.ts'
import type { Outcome } from '../../types.ts'
import type { PanelName } from '../types.ts'
import type { TextFieldStore } from '../data-stores/text-field-store.ts'
import { TextEditor } from './text-editor.ts'

// A one-field prompt: return moves on, escape is swallowed, the rest is typing.
export class TextPromptController {
  private field: TextFieldStore

  constructor(field: TextFieldStore) {
    this.field = field
  }

  handle(keypress: Keypress): Outcome<PanelName> {
    if (keypress.key.return === true) return 'next'
    else if (!keypress.isEscape()) this.edit(keypress)
    return 'stay'
  }

  private edit(keypress: Keypress) {
    new TextEditor({ field: this.field, keypress }).edit()
  }
}
