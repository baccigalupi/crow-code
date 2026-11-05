import { flushSync } from '@opentui/react'
import type { DataStore } from '../data-store.ts'
import type { StepName } from '../types.ts'

// How a prompt moves the installer. A move renders the new panel at once, so
// a key right behind it already reaches that panel.
export class PromptNavigation {
  private store: DataStore

  constructor(store: DataStore) {
    this.store = store
  }

  goTo(name: StepName) {
    flushSync(() => this.store.navigator.goTo(name))
  }

  exit() {
    this.store.quit.request()
  }
}
