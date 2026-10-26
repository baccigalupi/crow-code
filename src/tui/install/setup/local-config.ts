import type { SetupTaskArguments } from '../types.ts'
import { Operation } from '../../../operation.ts'
import { buildCrowConfig } from '../crow-config/build.ts'
import { readInstallState } from '../interactions/state/read-install-state.ts'

// Setup task: creates the repo directory and writes config.json from the
// answers gathered in the install store.
export class LocalConfigTask extends Operation<SetupTaskArguments> {
  protected override logPrefix = 'Local config: '

  label() {
    return `Writing config to ${this.config().crowConfigPath}`
  }

  async run() {
    try {
      await this.write()
    } catch (error) {
      this.fail(this.failure(error as Error))
    }
    return this
  }

  private failure(error: Error) {
    return `could not write ${this.config().crowConfigPath}: ${error.message}`
  }

  private async write() {
    const { crowRepoDirectory, crowConfigPath, crowConfigJson } = this.config()
    const { filesystem } = this.applicationData
    await filesystem.mkdirWithParents(crowRepoDirectory)
    await filesystem.writeTextFile(crowConfigPath, `${crowConfigJson}\n`)
  }

  private config() {
    const { installData } = this.operationArguments
    return buildCrowConfig(readInstallState(installData)).all()
  }
}
