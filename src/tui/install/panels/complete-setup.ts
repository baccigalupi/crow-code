import type { RenderContext } from '@opentui/core'
import type { DataStore } from '../data-store.ts'
import { IdleController } from './shared/idle-controller.ts'
import { SetupProgressViewModel } from './shared/setup-progress-view-model.ts'
import { SetupProgressView } from './shared/setup-progress-view.ts'

export class CompleteSetupPanel {
  readonly name = 'completeSetup'
  readonly next = undefined
  readonly cancel = undefined
  readonly highlights = { key: 'completeSetup' }

  controller(_store: DataStore) {
    return new IdleController('stay')
  }

  viewModel(_store: DataStore) {
    return new SetupProgressViewModel()
  }

  view(renderer: RenderContext) {
    return new SetupProgressView(renderer)
  }
}
