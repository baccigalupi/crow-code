import type { DataStore } from '../data-store.ts'
import type { TextFieldStore } from '../data-stores/text-field-store.ts'
import type { PanelHighlights, PanelName } from '../types.ts'
import { ProviderFormController } from './controller.ts'
import { ProviderPrompt } from './prompt.tsx'

// One field of the provider form. An entry declares its field, where return
// and tab lead, and the config line it edits.
export abstract class ProviderPanel {
  abstract readonly name: string
  abstract readonly next: PanelName
  abstract readonly back: PanelName | undefined
  abstract readonly forward: PanelName | undefined
  abstract readonly highlights: PanelHighlights
  readonly cancel = 'confirm'
  readonly entered = undefined

  abstract field(store: DataStore): TextFieldStore

  controller(store: DataStore) {
    const { back, forward } = this
    const { providers, providerEditForm: form } = store
    const field = this.field(store)
    return new ProviderFormController({ field, form, providers, back, forward })
  }

  prompt(store: DataStore) {
    return <ProviderPrompt store={store} />
  }
}
