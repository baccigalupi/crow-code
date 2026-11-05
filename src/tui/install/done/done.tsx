import type { DataStore } from '../data-store.ts'
import { DoneMessage } from './done-message.tsx'

export class DonePanel {
  readonly name = 'done'
  readonly entered = undefined

  prompt(store: DataStore) {
    return <DoneMessage store={store} />
  }
}
