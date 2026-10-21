import { OperationWithResult } from '../operation.ts'
import type { CommandOptions, CommandOutput } from '../types.ts'

export abstract class ExecCli<
  T extends Record<string, unknown>,
  U,
> extends OperationWithResult<T, U> {
  protected responseText!: string

  async run() {
    if (!(await this.allowedToRun())) return this

    try {
      await this.runCommand()
    } catch (error) {
      this.fail((error as Error).message)
    }
    return this
  }

  result() {
    if (this.success()) {
      return this.parse()
    } else {
      return this.emptyResult()
    }
  }

  abstract executable: string
  abstract parse(): U
  abstract emptyResult(): U
  abstract executableOptions(): CommandOptions

  protected isSuccessful(output: CommandOutput) {
    return output.success
  }

  protected allowedToRun(): Promise<boolean> {
    return Promise.resolve(true)
  }

  private async runCommand() {
    const output = await this.applicationData.runtime.runCommand(
      this.executable,
      this.executableOptions(),
    )
    this.responseText = output.stdout
    if (!this.isSuccessful(output)) this.fail(output.stderr)
  }
}
