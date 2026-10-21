import { InstallStore } from '../types.ts'
import { GlobalPathPrompt } from '../views/steps/global-path-prompt.tsx'

export class CrowGlobalDirectoryStep {
  private installStore: InstallStore
  readonly name = 'crowGlobalDirectory'
  readonly nextStep = 'envFile'
  readonly View = GlobalPathPrompt

  constructor(installStore: InstallStore) {
    this.installStore = installStore
  }

  state() {
    return this.installStore.globalDirectory
  }
}
