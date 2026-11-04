import type { DataStore } from '../data-store.ts'
import { TextPromptPanel } from '../text-prompt/text-prompt.tsx'

export class AdditionalWritePanel extends TextPromptPanel {
  readonly name = 'additionalWrite'
  readonly label = 'Additional write directories'
  readonly bare = true
  readonly next = 'escalateRead'
  readonly highlights = { key: 'additionalWrite' }

  field(store: DataStore) {
    return store.permissions.additionalWrite
  }

  defaultValue(store: DataStore) {
    return store.permissions.defaultAdditionalWrite
  }
}
