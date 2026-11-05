import type { DataStore } from '../data-store.ts'

// What the done screen does: any key quits.
export class DoneActions {
  private store: DataStore

  constructor(store: DataStore) {
    this.store = store
  }

  keyDown() {
    return () => this.store.quit.request()
  }
}
