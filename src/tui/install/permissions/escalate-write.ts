import type { DataStore } from '../data-store.ts'
import { TextPromptPanel } from '../text-prompt/text-prompt.tsx'

export class EscalateWritePanel extends TextPromptPanel {
  readonly name = 'escalateWrite'
  readonly label = 'Escalate write directories'
  readonly bare = false
  readonly next = 'allowedLocalScripts'

  field(store: DataStore) {
    return store.permissions.escalateWrite
  }

  defaultValue(store: DataStore) {
    return store.permissions.defaultEscalateWrite
  }
}
