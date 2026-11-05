import type { DataStore } from '../data-store.ts'
import type { TextFieldStore } from '../data-stores/text-field-store.ts'
import type { PanelName } from '../types.ts'
import { ProviderPrompt } from './prompt.tsx'

// One field of the provider form. An entry declares its field, where return
// and tab lead, and the config line it edits.
export abstract class ProviderPanel {
  abstract readonly name: string
  abstract readonly next: PanelName
  abstract readonly back: PanelName | undefined
  abstract readonly forward: PanelName | undefined
  readonly cancel = 'confirm'
  readonly masked: boolean = false
  readonly entered = undefined

  abstract field(store: DataStore): TextFieldStore

  prompt(store: DataStore) {
    return <ProviderPrompt panel={this} store={store} />
  }
}
