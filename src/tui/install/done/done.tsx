import type { DataStore } from '../data-store.ts'
import { IdleController } from '../complete-setup/idle-controller.ts'
import { DoneMessage } from './done-message.tsx'

export class DonePanel {
  readonly name = 'done'
  readonly next = undefined
  readonly cancel = undefined
  readonly entered = undefined
  readonly highlights = { key: 'done' }

  controller(_store: DataStore) {
    return new IdleController('exit')
  }

  prompt(model: DataStore) {
    return <DoneMessage model={model} />
  }
}
