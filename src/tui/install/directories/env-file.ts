import type { DataStore } from '../data-store.ts'
import { TextPromptPanel } from '../text-prompt/text-prompt.tsx'

export class EnvFilePanel extends TextPromptPanel {
  readonly name = 'envFile'
  readonly label = 'Credentials .env file'
  readonly bare = false
  readonly next = 'ignore'

  field(store: DataStore) {
    return store.directories.envFile
  }

  defaultValue(store: DataStore) {
    return store.directories.defaultEnvFile.value
  }
}
