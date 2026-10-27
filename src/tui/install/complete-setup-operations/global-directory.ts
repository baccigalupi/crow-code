import type { SetupTaskArguments } from '../types.ts'
import { Operation } from '../../../operation.ts'
import { expandHome } from '../../../application-data/allowed-paths/expand-home.ts'
import { crowConfigFromInputs } from '../crow-config/from-inputs.ts'

// Setup task: creates the global crow directory that holds the database and
// the .env file.
export class GlobalDirectoryTask extends Operation<SetupTaskArguments> {
  protected override logPrefix = 'Global directory: '

  label() {
    return `Creating ${this.directory()}`
  }

  async run() {
    try {
      await this.applicationData.filesystem.mkdirWithParents(this.expanded())
    } catch (error) {
      this.fail(this.failure(error as Error))
    }
    return this
  }

  private failure(error: Error) {
    return `could not create ${this.directory()}: ${error.message}`
  }

  private expanded() {
    const { envars } = this.applicationData
    const directories = [this.directory()]
    return expandHome({ directories, envars }).directories()[0]
  }

  private directory() {
    const inputs = this.operationArguments.inputs.peek()
    return crowConfigFromInputs(inputs).crowGlobalDirectory()
  }
}
