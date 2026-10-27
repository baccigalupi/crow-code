import type { DataStore } from '../data-store.ts'
import { EnvPrompt } from '../views/steps/env-prompt.tsx'

export class EnvFileStep {
  private model: DataStore
  readonly name = 'envFile'
  readonly nextStep = 'ignore'
  readonly View = EnvPrompt

  constructor(model: DataStore) {
    this.model = model
  }

  field() {
    return this.model.directories.envFile
  }
}
