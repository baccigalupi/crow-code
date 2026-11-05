import type { DataStore } from '../data-store.ts'
import { DoneController } from './controller.ts'
import { DoneMessage } from './done-message.tsx'

export class DonePanel {
  readonly name = 'done'
  readonly next = undefined
  readonly cancel = undefined
  readonly entered = undefined

  controller(_store: DataStore) {
    return new DoneController()
  }

  prompt(store: DataStore) {
    return <DoneMessage store={store} />
  }
}
