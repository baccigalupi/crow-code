import type { DenoCommand, Logger } from '../../../types.ts'

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
  result!: string[]
  private succeeded = false

  constructor(
    { denoCommand = Deno.Command, filter = null, logger }: GitDiffArguments,
  ) {
    this.denoCommand = denoCommand
    this.filter = filter
    this.logger = logger
    this.setEmptyResult()
  }

  success() {
    return this.succeeded
  }

  async run() {
    try {
      this.setCommand()
      await this.setResponse()
      this.getResponseText()
      this.setResult()
      this.succeeded = true
    } catch (error) {
      this.handleError(error)
    }

    return this
  }

  private handleError(error: unknown) {
    this.logger.error(`Git error: ${(error as Error).message}`)
  }

  private setEmptyResult() {
    this.result = []
  }

  private setResult() {
    this.result = this.parse(this.responseText)
  }

  private parse(text: string) {
    return text.split('\n')
      .filter((line) => line.length > 0)
      .map((line) => line.replace(/^.../, '').replace(/.* -> /, ''))
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
