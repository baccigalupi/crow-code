import type { RenderContext } from '@opentui/core'
import type { DataStore } from '../data-store.ts'
import { ConfirmController } from './confirm/controller.ts'
import { ConfirmPromptViewModel } from './confirm/view-model.ts'
import { ConfirmPromptView } from './confirm/view.ts'

export class ConfirmPanel {
  readonly name = 'confirm'
  readonly next = 'completeSetup'
  readonly cancel = undefined
  readonly entered = undefined
  readonly highlights = { key: 'confirm' }

  controller(store: DataStore) {
    return new ConfirmController(store.confirm)
  }

  props(store: DataStore) {
    const confirmation = store.confirm.confirmed.value
    return new ConfirmPromptViewModel().props({ confirmation })
  }

  view(renderer: RenderContext) {
    return new ConfirmPromptView(renderer)
  }
}
