import type { DataStore } from '../data-store.ts'
import type { TextFieldStore } from '../data-stores/text-field-store.ts'
import type { CrowConfigInputs } from '../crow-config/types.ts'
import type { PanelName } from '../types.ts'
import { TextPrompt } from './prompt.tsx'

// A one-line question. An entry declares its question, the field that holds
// the answer, the default shown until something is typed and the panel that
// comes next.
export abstract class TextPromptPanel {
  abstract readonly name: string
  abstract readonly label: string
  abstract readonly bare: boolean
  abstract readonly next: PanelName
  readonly entered = undefined

  abstract field(store: DataStore): TextFieldStore

  abstract defaultValue(store: DataStore, values: CrowConfigInputs): string

  // The default the input shows until something is typed.
  placeholder(store: DataStore, values: CrowConfigInputs) {
    return this.framedDefault(this.defaultValue(store, values))
  }

  private framedDefault(value: string) {
    if (this.bare) return value

    return `(${value})`
  }

  // Keyed by panel so each question gets a fresh input.
  prompt(store: DataStore) {
    return <TextPrompt key={this.name} panel={this} store={store} />
  }
}
