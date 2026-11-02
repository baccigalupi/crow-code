import type { RenderContext } from '@opentui/core'
import type { DataStore } from '../data-store.ts'
import { DoneMessageViewModel } from './done/view-model.ts'
import { DoneMessageView } from './done/view.ts'
import { IdleController } from './shared/idle-controller.ts'
import { SetupProgressViewModel } from './shared/setup-progress-view-model.ts'

export class DonePanel {
  readonly name = 'done'
  readonly next = undefined
  readonly cancel = undefined
  readonly entered = undefined
  readonly highlights = { key: 'done' }

  controller(_store: DataStore) {
    return new IdleController('exit')
  }

  viewModel(_store: DataStore) {
    return new DoneMessageViewModel(new SetupProgressViewModel())
  }

  view(renderer: RenderContext) {
    return new DoneMessageView(renderer)
  }
}
