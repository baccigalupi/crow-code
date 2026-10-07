import { OperationWithResult } from '../operation.ts'
import type { DenoCommand, Logger } from '../types.ts'

export abstract class ExecCli<T extends Record<string, unknown>, U>
  extends OperationWithResult<T, U> {
  declare denoCommand: DenoCommand
  private command!: Deno.Command
  private response!: Deno.CommandOutput
  protected responseText!: string
  declare private logger: Logger

  protected override unpackArguments() {
    this.denoCommand = this.applicationData.denoCommand()
    this.logger = this.applicationData.logger()
  }

  async run() {
    try {
      await this.runCommand()
    } catch (error) {
      this.handleError((error as Error).message)
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
  abstract errorPrefix(): string

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

    const errorMessage = new TextDecoder().decode(this.response.stderr)
    this.handleError(errorMessage)
  }

  private handleError(errorMessage: string) {
    this.logger.error(`${this.errorPrefix()} ${errorMessage}`)
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
