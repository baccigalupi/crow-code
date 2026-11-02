import type { RenderContext } from '@opentui/core'
import type { DataStore } from '../data-store.ts'
import type { TextFieldStore } from '../data-stores/text-field-store.ts'
import type { PanelHighlights, PanelName } from '../types.ts'
import { ProviderFormController } from './provider/controller.ts'
import { ProviderPromptViewModel } from './provider/view-model.ts'
import { ProviderPromptView } from './provider/view.ts'

// One field of the provider form. An entry declares its field, where return
// and tab lead, and the config line it edits.
export abstract class ProviderPanel {
  abstract readonly name: string
  abstract readonly next: PanelName
  abstract readonly back: PanelName | undefined
  abstract readonly forward: PanelName | undefined
  abstract readonly highlights: PanelHighlights
  readonly cancel = 'confirm'

  abstract field(store: DataStore): TextFieldStore

  controller(store: DataStore) {
    const { back, forward } = this
    const { providers } = store
    const field = this.field(store)
    return new ProviderFormController({ field, providers, back, forward })
  }

  viewModel(_store: DataStore) {
    return new ProviderPromptViewModel()
  }

  view(renderer: RenderContext) {
    return new ProviderPromptView(renderer)
  }
}
