import type { DataStore } from '../data-store.ts'
import { TextPromptPanel } from './text-prompt.tsx'

export class AllowedLocalScriptsPanel extends TextPromptPanel {
  readonly name = 'allowedLocalScripts'
  readonly label = 'Allowed local scripts'
  readonly bare = false
  readonly next = 'providerName'
  readonly highlights = { key: 'allowedLocalScripts' }

  field(store: DataStore) {
    return store.permissions.allowedLocalScripts
  }

  defaultValue(store: DataStore) {
    return store.permissions.defaultAllowedLocalScripts
  }
}
