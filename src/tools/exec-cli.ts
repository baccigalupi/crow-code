import { OperationWithResult } from '../operation.ts'
import type { DenoCommand } from '../types.ts'

export abstract class ExecCli<T extends Record<string, unknown>, U>
  extends OperationWithResult<T, U> {
  declare denoCommand: DenoCommand
  private command!: Deno.Command
  private response!: Deno.CommandOutput
  protected responseText!: string

  protected override unpackArguments() {
    this.denoCommand = this.applicationData.denoCommand()
  }

  async run() {
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
  abstract executableOptions(): Deno.CommandOptions

  protected isSuccessful(response: Deno.CommandOutput) {
    return response.success
  }

  private async runCommand() {
    this.setCommand()
    await this.setResponse()
    this.setResponseText()
    this.handleResponse()
  }

  private handleResponse() {
    this.succeeded = this.isSuccessful(this.response)
    this.handleErrors()
  }

  private handleErrors() {
    if (this.success()) return

    this.fail(new TextDecoder().decode(this.response.stderr))
  }

  private setCommand() {
    this.command = new this.denoCommand(
      this.executable,
      this.executableOptions(),
    )
  }

  private async setResponse() {
    this.response = await this.command.output()
  }

  private setResponseText() {
    this.responseText = new TextDecoder().decode(this.response.stdout)
  }
}
