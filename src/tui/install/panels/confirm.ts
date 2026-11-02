import type { RenderContext } from '@opentui/core'
import type { DataStore } from '../data-store.ts'
import { ConfirmController } from './confirm/controller.ts'
import { ConfirmPromptViewModel } from './confirm/view-model.ts'
import { ConfirmPromptView } from './confirm/view.ts'

export class ConfirmPanel {
  readonly name = 'confirm'
  readonly next = 'completeSetup'
  readonly cancel = undefined
  readonly highlights = { key: 'confirm' }

  controller(store: DataStore) {
    return new ConfirmController(store.confirm)
  }

  viewModel(_store: DataStore) {
    return new ConfirmPromptViewModel()
  }

  view(renderer: RenderContext) {
    return new ConfirmPromptView(renderer)
  }
}
