import type { Knex } from 'knex'
import type { Logger } from './types.ts'
import type { OpenAiClientOptions } from './model-requests/types.ts'
import { openAndMigrateDatabase } from './database/open-and-migrate-database.ts'
import { createLogger } from './logger.ts'
import { OpenAI } from 'openai'
import { loadEnvironmentalVariables, type Environment } from './env-vars.ts'

export class ApplicationData {
  private _database?: Knex
  private _logger?: Logger
  private _envars?: Environment
  
  crowDirectory() {
    return Deno.cwd() + './crow'
  }

  console() {
    return console
  }

  consoleLog() {
    return console.log
  }

  logger() {
    if (this._logger) return this._logger

    this._logger = createLogger(this.crowDirectory(), 'debug')

    return this._logger
  }

  fetch() {
    return global.fetch
  }

  async database() {
    if (this._database) return this._database

    this._database = await openAndMigrateDatabase(this.crowDirectory(), this.logger())

    return this._database
  }

  chatClient(options: OpenAiClientOptions) {
    const timeout = 20000
    const maxRetries = 2

    const fullOptions = {
      fetch: this.fetch(),
      timeout,
      maxRetries,
      ...options
    }

    return () => new OpenAI(fullOptions)
  }

  deno() {
    Deno
  }

  denoCommand() {
    Deno.Command
  }

  envars() {
    if (this._envars) return this._envars

    this._envars = loadEnvironmentalVariables()

    return this._envars
  }
}