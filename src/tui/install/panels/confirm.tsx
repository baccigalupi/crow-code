import type { DataStore } from '../data-store.ts'
import { ConfirmController } from './confirm/controller.ts'
import { ConfirmPrompt } from '../components/confirm-prompt.tsx'

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
