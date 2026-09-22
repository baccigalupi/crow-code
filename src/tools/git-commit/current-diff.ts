import type { Logger } from '../../model-info/types.ts'

type DenoCommand = typeof Deno.Command

class CurrentDiff {
  private command!: InstanceType<DenoCommand>
  private commandConstructor: DenoCommand
  private logger: Logger
  private output!: Deno.CommandOutput
  private success: boolean
  private error?: string

  constructor(
    logger: Logger,
    commandConstructor: DenoCommand = Deno.Command,
  ) {
    this.commandConstructor = commandConstructor
    this.logger = logger
    this.success = true
  }

  async read(): Promise<string> {
    await this.runCommand()
    this.handleError()
    return this.decode()
  }

  isSuccess(): boolean {
    return this.success
  }

  private hasError() {
    return this.couldNotRunCommand() || this.couldNotGetResponse()
  }

  private async runCommand() {
    try {
      this.command = new this.commandConstructor('git', {
        args: ['diff', 'HEAD'],
      })
      this.output = await this.command.output()
    } catch (error) {
      this.error = (error as Error).message
    }
  }

  private decode(): string {
    if (!this.isSuccess()) return ''

    return new TextDecoder().decode(this.output.stdout)
  }

  private couldNotRunCommand() {
    return !this.command || !this.output
  }

  private couldNotGetResponse() {
    return this.output.success === false
  }

  private handleError() {
    if (!this.hasError()) return

    this.success = false
    this.logger.error(`Git error: ${this.resolveError()}`)
  }

  private resolveError() {
    if (this.error !== undefined) {
      return this.error
    }

    return new TextDecoder().decode(this.output.stderr)
  }
}

export const getCurrentDiff = (
  logger: Logger,
  commandConstructor: DenoCommand = Deno.Command,
): Promise<string> => {
  const diff = new CurrentDiff(logger, commandConstructor)
  return diff.read()
}
