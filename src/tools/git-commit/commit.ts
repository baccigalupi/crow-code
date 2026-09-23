import type { Logger } from '../../model-info/types.ts'

type DenoCommand = typeof Deno.Command

class Commit {
  private message: string
  private logger: Logger
  private denoCommand: DenoCommand

  constructor(message: string, logger: Logger, denoCommand: DenoCommand) {
    this.message = message
    this.logger = logger
    this.denoCommand = denoCommand
  }

  async run() {
    try {
      return this.handleOutput(await this.command().output())
    } catch (error) {
      return this.fail((error as Error).message)
    }
  }

  private command() {
    return new this.denoCommand('git', {
      args: ['commit', '-m', this.message],
    })
  }

  private handleOutput(output: Deno.CommandOutput) {
    if (output.success) return true

    return this.fail(new TextDecoder().decode(output.stderr))
  }

  private fail(message: string) {
    this.logger.error(`Git error: ${message}`)
    return false
  }
}

export const commitChanges = (
  message: string,
  logger: Logger,
  denoCommand: DenoCommand = Deno.Command,
) => {
  return new Commit(message, logger, denoCommand).run()
}
