import type { Knex } from 'knex'
import { join } from '@std/path'
import { OpenAI } from 'openai'
import type { OpenAiClientOptions } from './model-requests/types.ts'
import { openAndMigrateDatabase } from './database/open-and-migrate-database.ts'
import { createLogger } from './application-data/logger.ts'
import { loadEnvironmentalVariables } from './application-data/env-vars.ts'
import { parseArguments } from './cli/arguments.ts'
import { memoize } from './decorators.ts'
import { pathPermissions } from './application-data/path-permissions.ts'
import { gitPathPermissions } from './application-data/git-path-permissions.ts'

type ApplicationDataOverrides = {
  deno?: typeof Deno,
  crowDirectory?: string
}

export class ApplicationData {
  private deno: typeof Deno
  private _crowDirectory: string

  constructor(options: ApplicationDataOverrides = {}) {
    this.deno = options.deno || Deno
    this._crowDirectory = options.crowDirectory || join(Deno.cwd(), '.crow')
  }

  crowDirectory() {
    return this._crowDirectory
  }

  consoleLog() {
    return console.log
  }

  args() {
    return this.deno.args
  }

  @memoize
  parsedArguments() {
    return parseArguments(this.args())
  }

  @memoize
  logger() {
    return createLogger(this.crowDirectory(), 'debug')
  }

  fetch() {
    return globalThis.fetch
  }

  @memoize
  database() {
    return openAndMigrateDatabase(this.crowDirectory(), this.logger())
  }

  withDatabase(database: Knex) {
    return Object.create(this, {
      database: { value: () => Promise.resolve(database) },
    }) as ApplicationData
  }

  async close() {
    await (await this.database()).destroy()
  }

  chatClient(options: OpenAiClientOptions) {
    return new OpenAI({
      fetch: this.fetch(),
      timeout: 20000,
      maxRetries: 2,
      ...options,
    })
  }

  denoCommand() {
    return this.deno.Command
  }

  getRealPath() {
    return this.deno.realPath
  }

  @memoize
  pathPermissions() {
    return pathPermissions({ applicationData: this })
  }

  @memoize
  gitPathPermissions() {
    return gitPathPermissions({ applicationData: this })
  }

  @memoize
  envars() {
    return loadEnvironmentalVariables()
  }
}
