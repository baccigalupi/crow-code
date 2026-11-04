import type { DataStore } from '../data-store.ts'
import { ConfirmController } from './controller.ts'
import { ConfirmPrompt } from './prompt.tsx'

export class ConfirmPanel {
  readonly name = 'confirm'
  readonly next = 'completeSetup'
  readonly cancel = undefined
  readonly entered = undefined
  readonly highlights = { key: 'confirm' }

  controller(store: DataStore) {
    return new ConfirmController(store.confirm)
  }

  prompt(model: DataStore) {
    return <ConfirmPrompt model={model} />
  }
}
