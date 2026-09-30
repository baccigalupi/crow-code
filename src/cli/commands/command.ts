import type { Knex } from 'knex'
import type { Environment } from '../../env-vars.ts'
import type {
  ApplicationData,
  ConsoleLog,
  DenoCommand,
  Logger,
  ParsedArgumentsOptions,
} from '../../types.ts'

export abstract class Command {
  protected data: ApplicationData
  protected commands: string[]
  protected options: ParsedArgumentsOptions
  protected crowDirectory: string
  protected logger: Logger
  protected database: Knex
  protected consoleLog: ConsoleLog
  protected fetchClient: typeof fetch
  protected denoCommand: DenoCommand
  protected environment: Environment

  constructor(data: ApplicationData) {
    Object.assign(this, data, {
      data,
      commands: data.parsedArguments.commands,
      options: data.parsedArguments.options,
    })
  }

  abstract isMatch(): boolean
  abstract extractOptions(): ParsedArgumentsOptions
  abstract run(): Promise<void>
}
