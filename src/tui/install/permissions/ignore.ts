import type { DataStore } from '../data-store.ts'
import { TextPromptPanel } from '../text-prompt/text-prompt.tsx'

export class IgnorePanel extends TextPromptPanel {
  readonly name = 'ignore'
  readonly label = 'Ignored paths'
  readonly bare = true
  readonly next = 'additionalRead'

  field(store: DataStore) {
    return store.permissions.ignore
  }

  defaultValue(store: DataStore) {
    return store.permissions.defaultIgnore
  }
}
