import type { DataStore } from '../data-store.ts'
import { GlobalPathPrompt } from '../views/steps/global-path-prompt.tsx'

export class CrowGlobalDirectoryStep {
  private model: DataStore
  readonly name = 'crowGlobalDirectory'
  readonly nextStep = 'envFile'
  readonly View = GlobalPathPrompt

  constructor(model: DataStore) {
    this.model = model
  }

  field() {
    return this.model.directories.globalDirectory
  }
}
