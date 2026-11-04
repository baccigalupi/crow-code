import type { DataStore } from '../data-store.ts'
import { TextPromptPanel } from '../text-prompt/text-prompt.tsx'

export class AdditionalReadPanel extends TextPromptPanel {
  readonly name = 'additionalRead'
  readonly label = 'Additional read directories'
  readonly bare = true
  readonly next = 'additionalWrite'
  readonly highlights = { key: 'additionalRead' }

  field(store: DataStore) {
    return store.permissions.additionalRead
  }

  defaultValue(store: DataStore) {
    return store.permissions.defaultAdditionalRead
  }
}
