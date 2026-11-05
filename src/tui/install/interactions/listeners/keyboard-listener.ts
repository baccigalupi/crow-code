import type { CliRenderer, KeyEvent } from '@opentui/core'
import type { DataStore } from '../../data-store.ts'

// Quits on ctrl-c from anywhere, before the focused component sees it, and
// destroys the renderer once the store asks to quit.
export class KeyboardListener {
  private renderer: CliRenderer
  private store: DataStore

  constructor(renderer: CliRenderer, store: DataStore) {
    this.renderer = renderer
    this.store = store
  }

  listen() {
    this.renderer.keyInput.on('keypress', (event) => this.quitOn(event))
    this.store.quit.requested.subscribe((asked) => this.destroyOn(asked))
  }

  private quitOn(event: KeyEvent) {
    if (!event.ctrl || event.name !== 'c') return

    event.preventDefault()
    this.store.quit.request()
  }

  private destroyOn(asked: boolean) {
    if (!asked) return

    this.renderer.destroy()
  }
}
