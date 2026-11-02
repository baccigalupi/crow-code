import type { DataStore } from '../data-store.ts'
import { TextPromptPanel } from './text-prompt.ts'

export class EscalateReadPanel extends TextPromptPanel {
  readonly name = 'escalateRead'
  readonly label = 'Escalate read directories'
  readonly bare = true
  readonly next = 'escalateWrite'
  readonly highlights = { key: 'escalateRead' }

  field(store: DataStore) {
    return store.permissions.escalateRead
  }

  defaultValue(store: DataStore) {
    return store.permissions.defaultEscalateRead
  }
}
