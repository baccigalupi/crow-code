import type { DataStore } from '../data-store.ts'
import { TextPromptPanel } from './text-prompt.ts'

export class IgnorePanel extends TextPromptPanel {
  readonly name = 'ignore'
  readonly label = 'Ignored paths'
  readonly bare = true
  readonly next = 'additionalRead'
  readonly highlights = { key: 'ignore' }

  field(store: DataStore) {
    return store.permissions.ignore
  }

  defaultValue(store: DataStore) {
    return store.permissions.defaultIgnore
  }
}
