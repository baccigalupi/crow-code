import {
  decodePasteBytes,
  stripAnsiSequences,
  type CliRenderer,
  type KeyEvent,
  type PasteEvent,
} from '@opentui/core'
import { Keypress } from '../../keypress.ts'
import type { DataStore } from '../data-store.ts'
import { keypressFromEvent } from './keypress-from-event.ts'

// Feeds every key and paste on the renderer to the navigator, which knows
// what the current panel does with it.
export class KeyboardListener {
  private renderer: CliRenderer
  private model: DataStore

  constructor(renderer: CliRenderer, model: DataStore) {
    this.renderer = renderer
    this.model = model
  }

  listen() {
    this.renderer.keyInput.on('keypress', (event) =>
      this.press(this.typed(event)),
    )
    this.renderer.keyInput.on('paste', (event) =>
      this.press(this.pasted(event)),
    )
  }

  private press(keypress: Keypress) {
    this.model.navigator.press(keypress, () => this.renderer.destroy())
  }

  // The key stops here so a focused select never moves on its own; the store
  // holds the selection.
  private typed(event: KeyEvent) {
    event.preventDefault()
    const { input, key } = keypressFromEvent(event)
    return new Keypress(input, key)
  }

  // A paste is typed input that arrives all at once, with newlines dropped.
  private pasted(event: PasteEvent) {
    const text = stripAnsiSequences(decodePasteBytes(event.bytes))
    return new Keypress(text.replace(/[\r\n]/g, ''), {})
  }
}
