import type { DataStore } from '../data-store.ts'
import { crowConfigFromInputs } from '../crow-config/from-inputs.ts'
import type { CrowConfigInputs } from '../crow-config/types.ts'
import { TextPromptPanel } from './text-prompt.tsx'

export class EnvFilePanel extends TextPromptPanel {
  readonly name = 'envFile'
  readonly label = 'Credentials .env file'
  readonly bare = false
  readonly next = 'ignore'
  readonly highlights = { key: 'envFile' }

  field(store: DataStore) {
    return store.directories.envFile
  }

  defaultValue(_store: DataStore, values: CrowConfigInputs) {
    return crowConfigFromInputs(values).crowConfig().envFile
  }
}
