import type { CrowConfigInputs } from '../../types.ts'
import type { TextPromptPanel } from '../text-prompt.ts'
import type { DataStore } from '../../data-store.ts'

// What a one-line text prompt shows: the question, the answer typed so far
// and the default that stands in until something is typed. The panel says
// which question, field and default.
export class TextPromptViewModel {
  private panel: TextPromptPanel
  private store: DataStore

  constructor(panel: TextPromptPanel, store: DataStore) {
    this.panel = panel
    this.store = store
  }

  props(values: CrowConfigInputs) {
    const { panel, store } = this
    return {
      label: panel.label,
      input: panel.field(store).text.value,
      defaultValue: panel.defaultValue(store, values),
      bare: panel.bare,
    }
  }
}
