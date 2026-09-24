import type { Environment } from '../../env-vars.ts'
import type {
  CommandApplicationData,
  ConsoleLog,
  DenoCommand,
  Logger,
  ParsedArgumentsOptions,
} from '../../types.ts'

export abstract class Command {
  protected data: CommandApplicationData
  protected commands: string[]
  protected options: ParsedArgumentsOptions
  protected crowDirectory: string
  protected logger: Logger
  protected consoleLog: ConsoleLog
  protected fetchClient: typeof fetch
  protected denoCommand: DenoCommand
  protected environment: Environment

  constructor(data: CommandApplicationData) {
    this.data = data
    this.commands = data.parsedArguments.commands
    this.options = data.parsedArguments.options
    this.crowDirectory = data.crowDirectory
    this.logger = data.logger
    this.consoleLog = data.consoleLog
    this.fetchClient = data.fetchClient
    this.denoCommand = data.denoCommand
    this.environment = data.environment
  }

  abstract isMatch(): boolean
  abstract extractOptions(): ParsedArgumentsOptions
  abstract run(): Promise<void>
}
