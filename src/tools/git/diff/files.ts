import type { DenoCommand, Logger } from '../../../types.ts'
import { FileDiffParser } from './files/parser.ts'

type GitDiffArguments = {
  denoCommand?: DenoCommand
  filter?: string[] | null
  logger: Logger
}

export class GitDiffFiles {
  denoCommand: DenoCommand
  filter: string[] | null
  executable = 'git'
  private command!: Deno.Command
  private response!: Deno.CommandOutput
  private responseText!: string
  private logger: Logger
  private parser: FileDiffParser
  private succeeded = false

  constructor(
    { denoCommand = Deno.Command, filter = null, logger }: GitDiffArguments,
  ) {
    this.denoCommand = denoCommand
    this.filter = filter
    this.logger = logger
    this.parser = new FileDiffParser()
  }

  success() {
    return this.succeeded
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
      return this.parser.parse(this.responseText)
    } else {
      return this.emptyResult()
    }
  }

  private async runCommand() {
    this.setCommand()
    await this.setResponse()
    this.getResponseText()
    this.handleResponse()
  }

  private handleResponse() {
    this.succeeded = this.response.success
    this.handleErrors()
  }

  private handleErrors() {
    if (this.success()) return

    const errorMessage = new TextDecoder().decode(this.response.stderr)
    this.handleError(errorMessage)
  }

  private handleError(errorMessage: string) {
    this.logger.error(`Git error: ${errorMessage}`)
  }

  private emptyResult() {
    return []
  }

  private setCommand() {
    this.command = new this.denoCommand(
      this.executable,
      this.executableOptions(),
    )
  }

  private executableOptions() {
    return {
      args: ['status', '--porcelain'],
    }
  }

  private async setResponse() {
    this.response = await this.command.output()
  }

  private getResponseText() {
    this.responseText = new TextDecoder().decode(this.response.stdout)
  }
}

export const gitDiffFiles = (
  { denoCommand = Deno.Command, filter = null, logger }: GitDiffArguments,
) => {
  return new GitDiffFiles({ denoCommand, filter, logger })
}
