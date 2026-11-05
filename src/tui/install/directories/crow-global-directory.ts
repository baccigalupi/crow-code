import type { DataStore } from '../data-store.ts'
import { TextPromptPanel } from '../text-prompt/text-prompt.tsx'

export class CrowGlobalDirectoryPanel extends TextPromptPanel {
  readonly name = 'crowGlobalDirectory'
  readonly label = 'User crow directory'
  readonly bare = false
  readonly next = 'envFile'

  field(store: DataStore) {
    return store.directories.globalDirectory
  }

  defaultValue(store: DataStore) {
    return store.directories.defaultGlobalDirectory
  }
}
