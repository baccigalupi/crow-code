import type { SetupTaskArguments } from '../types.ts'
import { Operation } from '../../../operation.ts'
import { crowConfigFromInputs } from '../crow-config/from-inputs.ts'
import { LocalConfigTaskState } from '../interactions/state/local-config-state.ts'
import { readUserInputState } from '../interactions/state/read-user-input-state.ts'

// Setup task: creates the repo directory and writes config.json from the
// answers gathered in the install store.
export class LocalConfigTask extends Operation<SetupTaskArguments> {
  protected override logPrefix = 'Local config: '
  state = new LocalConfigTaskState(this)

  label() {
    return `Writing config to ${this.builder().crowConfigPath()}`
  }

  async run() {
    try {
      await this.write()
    } catch (error) {
      this.fail(this.failure(error as Error))
    }
    this.state.complete()
    return this
  }

  private failure(error: Error) {
    return `could not write ${this.builder().crowConfigPath()}: ${error.message}`
  }

  private async write() {
    const builder = this.builder()
    const { filesystem } = this.applicationData
    await filesystem.mkdirWithParents(builder.crowRepoDirectory())
    await filesystem.writeTextFile(
      builder.crowConfigPath(),
      `${builder.crowConfigJson()}\n`,
    )
  }

  private builder() {
    const { userInputStore } = this.operationArguments
    return crowConfigFromInputs(readUserInputState(userInputStore))
  }
}
