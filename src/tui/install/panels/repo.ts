import type { DataStore } from '../data-store.ts'
import { TextPromptPanel } from './text-prompt.tsx'

export class RepoPanel extends TextPromptPanel {
  readonly name = 'repo'
  readonly label = 'What directory for the local repo crow setup'
  readonly bare = false
  readonly next = 'crowGlobalDirectory'
  readonly highlights = { key: 'repo' }

  field(store: DataStore) {
    return store.directories.repoDirectory
  }

  defaultValue(store: DataStore) {
    return store.directories.defaultRepoDirectory
  }
}
