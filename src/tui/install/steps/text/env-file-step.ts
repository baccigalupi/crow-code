import type { DataStore } from '../../data-store.ts'
import { TextStep } from '../text-step.tsx'

// Defaults to the .env file inside the global directory, typed or default.
export class EnvFileStep extends TextStep {
  readonly name = 'envFile'
  readonly label = 'Credentials .env file'
  readonly next = 'ignore'

  placeholder(store: DataStore) {
    return `(${store.directories.defaultEnvFile.value})`
  }
}
