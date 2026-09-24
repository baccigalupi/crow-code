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
  protected crowDirectory: string
  protected logger: Logger
  protected consoleLog: ConsoleLog
  protected fetchClient: typeof fetch
  protected denoCommand: DenoCommand
  protected environment: Environment
  protected options: ParsedArgumentsOptions

  constructor(data: CommandApplicationData, options: ParsedArgumentsOptions) {
    this.data = data
    this.crowDirectory = data.crowDirectory
    this.logger = data.logger
    this.consoleLog = data.consoleLog
    this.fetchClient = data.fetchClient
    this.denoCommand = data.denoCommand
    this.environment = data.environment
    this.options = options
  }

  abstract run(): Promise<void>
}
