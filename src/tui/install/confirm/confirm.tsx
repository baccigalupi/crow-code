import type { DataStore } from '../data-store.ts'
import { ConfirmController } from './controller.ts'
import { ConfirmPrompt } from './prompt.tsx'

export class ConfirmPanel {
  readonly name = 'confirm'
  readonly next = 'completeSetup'
  readonly cancel = undefined
  readonly entered = undefined

  controller(store: DataStore) {
    return new ConfirmController(store.confirm)
  }

  prompt(store: DataStore) {
    return <ConfirmPrompt store={store} />
  }
}
