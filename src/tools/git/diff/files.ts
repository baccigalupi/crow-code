import type { DenoCommand } from '../../../types.ts'

type GitDiffArguments = {
  denoCommand?: DenoCommand
  filter?: string[] | null
}

export class GitDiffFiles {
  denoCommand: DenoCommand
  filter: string[] | null
  executable = 'git'
  private command!: Deno.Command
  private response!: Deno.CommandOutput
  private responseText!: string

  constructor(
    { denoCommand = Deno.Command, filter = null }: GitDiffArguments = {},
  ) {
    this.denoCommand = denoCommand
    this.filter = filter
  }

  async run() {
    this.setCommand()
    await this.setResponse()
    this.getResponseText()
    return this.parse(this.responseText)
  }

  private parse(text: string) {
    return text.split('\n').filter((line) => line.length > 0)
  }

  private setCommand() {
    this.command = new this.denoCommand(
      this.executable,
      this.executableOptions(),
    )
  }

  private executableOptions() {
    return {
      args: ['diff', 'HEAD', '--name-only'],
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
  { denoCommand = Deno.Command, filter = null }: GitDiffArguments = {},
) => {
  return new GitDiffFiles({ denoCommand, filter })
}
