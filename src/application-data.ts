import type { Knex } from 'knex'
import { join } from '@std/path'
import { OpenAI } from 'openai'
import type {
  ConsoleLog,
  DenoCommand,
  Logger,
  ParsedArguments,
} from './types.ts'
import type { OpenAiClientOptions } from './model-requests/types.ts'
import { Signal } from '@ubernaut/exotui/app'
import { openAndMigrateDatabase } from './database/open-and-migrate-database.ts'
import { createLogger } from './logger.ts'
import { type Environment, loadEnvironmentalVariables } from './env-vars.ts'
import { parseArguments } from './cli/arguments.ts'

export class ApplicationData {
  private _database?: Knex
  private _logger?: Logger
  private _envars?: Environment
  private _parsedArguments?: ParsedArguments
  private _replData?: Signal<string[]>

  crowDirectory(): string {
    return join(Deno.cwd(), '.crow')
  }

  consoleLog(): ConsoleLog {
    return console.log
  }

  args(): string[] {
    return Deno.args
  }

  parsedArguments(): ParsedArguments {
    if (this._parsedArguments) return this._parsedArguments

    this._parsedArguments = parseArguments(this.args())

    return this._parsedArguments
  }

  logger(): Logger {
    if (this._logger) return this._logger

    this._logger = createLogger(this.crowDirectory(), 'debug')

    return this._logger
  }

  fetch(): typeof fetch {
    return globalThis.fetch
  }

  async database(): Promise<Knex> {
    if (this._database) return this._database

    const crowDirectory = this.crowDirectory()
    this._database = await openAndMigrateDatabase(crowDirectory, this.logger())

    return this._database
  }

  withDatabase(database: Knex): ApplicationData {
    const clone = Object.create(
      Object.getPrototypeOf(this),
      Object.getOwnPropertyDescriptors(this),
    ) as ApplicationData
    Object.defineProperty(clone, 'database', {
      value: () => Promise.resolve(database),
    })
    return clone
  }

  async close(): Promise<void> {
    await (await this.database()).destroy()
  }

  chatClient(options: OpenAiClientOptions): OpenAI {
    return new OpenAI({
      fetch: this.fetch(),
      timeout: 20000,
      maxRetries: 2,
      ...options,
    })
  }

  denoCommand(): DenoCommand {
    return Deno.Command
  }

  envars(): Environment {
    if (this._envars) return this._envars

    this._envars = loadEnvironmentalVariables()

    return this._envars
  }

  replData(): Signal<string[]> {
    if (this._replData) return this._replData

    this._replData = new Signal<string[]>([])

    return this._replData
  }
}
