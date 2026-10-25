import type { Filesystem } from '../../../application-data/filesystem.ts'
import type { InstallStore, LocalConfigTaskArguments } from '../types.ts'
import { buildCrowConfig } from '../crow-config/build.ts'
import { readInstallState } from '../interactions/state/read-install-state.ts'

// Setup task: creates the repo directory and writes config.json from the
// answers gathered in the install store.
export class LocalConfigTask {
  private installData: InstallStore
  private filesystem: Filesystem

  constructor({ installData, filesystem }: LocalConfigTaskArguments) {
    this.installData = installData
    this.filesystem = filesystem
  }

  async run() {
    const { crowRepoDirectory, crowConfigPath, crowConfigJson } = this.config()
    await this.filesystem.mkdirWithParents(crowRepoDirectory)
    await this.filesystem.writeTextFile(crowConfigPath, `${crowConfigJson}\n`)
  }

  private config() {
    return buildCrowConfig(readInstallState(this.installData)).all()
  }
}
