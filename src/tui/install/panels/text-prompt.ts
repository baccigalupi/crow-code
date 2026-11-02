import type { RenderContext } from '@opentui/core'
import type { DataStore } from '../data-store.ts'
import type { TextFieldStore } from '../data-stores/text-field-store.ts'
import type { CrowConfigInputs } from '../crow-config/types.ts'
import type { PanelHighlights, PanelName } from '../types.ts'
import { TextPromptController } from './text-prompt/controller.ts'
import { TextPromptViewModel } from './text-prompt/view-model.ts'
import { PromptView } from './shared/prompt-view.ts'

// A one-line question. An entry declares its question, the field that holds
// the answer, the default shown until something is typed and the panel that
// comes next.
export abstract class TextPromptPanel {
  abstract readonly name: string
  abstract readonly label: string
  abstract readonly bare: boolean
  abstract readonly next: PanelName
  abstract readonly highlights: PanelHighlights
  readonly cancel = undefined
  readonly entered = undefined

  abstract field(store: DataStore): TextFieldStore

  abstract defaultValue(store: DataStore, values: CrowConfigInputs): string

  controller(store: DataStore) {
    return new TextPromptController(this.field(store))
  }

  props(store: DataStore) {
    return new TextPromptViewModel(this, store).props(store.inputs.value)
  }

  view(renderer: RenderContext) {
    return new PromptView(renderer)
  }
}
