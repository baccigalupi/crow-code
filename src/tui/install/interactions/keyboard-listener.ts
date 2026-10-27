import {
  decodePasteBytes,
  stripAnsiSequences,
  type CliRenderer,
  type KeyEvent,
  type PasteEvent,
} from '@opentui/core'
import { memoize } from '../../../decorators.ts'
import type { DataStore } from '../data-store.ts'
import { keypressFromEvent } from './keypress-from-event.ts'

// Feeds the renderer's keys and pastes to the store. Once listening, every
// key reaches the store; dispose stops listening.
export class KeyboardListener {
  private renderer: CliRenderer
  private model: DataStore

  constructor(renderer: CliRenderer, model: DataStore) {
    this.renderer = renderer
    this.model = model
  }

  listen() {
    this.renderer.keyInput.on('keypress', this.typed())
    this.renderer.keyInput.on('paste', this.pasted())
  }

  dispose() {
    this.renderer.keyInput.off('keypress', this.typed())
    this.renderer.keyInput.off('paste', this.pasted())
  }

  @memoize
  private typed() {
    return (event: KeyEvent) => this.press(event)
  }

  @memoize
  private pasted() {
    return (event: PasteEvent) => this.paste(event)
  }

  private press(event: KeyEvent) {
    const { input, key } = keypressFromEvent(event)
    this.model.press(input, key, () => this.renderer.destroy())
  }

  private paste(event: PasteEvent) {
    const text = stripAnsiSequences(decodePasteBytes(event.bytes))
    this.model.paste(text, () => this.renderer.destroy())
  }
}
