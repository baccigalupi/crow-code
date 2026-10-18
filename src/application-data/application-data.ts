import type { Knex } from 'knex'
import { OpenAI } from 'openai'
import type { OpenAiClientOptions } from '../model-requests/types.ts'
import type { CrowConfig } from './config.ts'
import type { Runtime } from './runtime.ts'
import type { Environment } from './env-vars.ts'
import { Io } from './io.ts'
import type { ParsedArguments } from './arguments.ts'
import { delegate, memoize } from '../decorators.ts'
import { AllowedPaths } from './allowed-paths.ts'
import type { PathPermissions } from './allowed-paths/path-permissions.ts'
import { expandHome } from './allowed-paths/expand-home.ts'
import { openAndMigrateDatabase } from '../database/open-and-migrate-database.ts'
import type { ConsoleError, ConsoleLog, Logger } from '../types.ts'

@delegate(
  {
    args: 'args',
    envars: 'envars',
  },
  'runtime',
)
@delegate(
  {
    consoleError: 'consoleError',
    consoleLog: 'consoleLog',
    fetch: 'fetch',
    logger: 'logger',
  },
  'io',
)
@delegate(
  {
    git: 'gitPathPermissions',
    read: 'readPathPermissions',
    write: 'writePathPermissions',
  },
  'allowedPaths',
)
export class ApplicationData {
  allowedPaths = new AllowedPaths(this)
  config!: CrowConfig
  io!: Io
  parsedArguments!: ParsedArguments
  repositoryRoot!: string
  runtime!: Runtime

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

  withDatabase(database: Knex) {
    return Object.create(this, {
      database: { value: () => Promise.resolve(database) },
    }) as ApplicationData
  }

  @memoize
  crowGlobalDirectory() {
    return expandHome({
      directories: [this.config.crowGlobalDirectory],
      envars: this.envars(),
    }).directories()[0]
  }

  @memoize
  database() {
    return openAndMigrateDatabase(
      this.crowGlobalDirectory(),
      this.logger(),
      this.runtime,
    )
  }
}

export interface ApplicationData {
  args(): string[]
  consoleError(): ConsoleError
  consoleLog(): ConsoleLog
  envars(): Environment
  fetch(): typeof fetch
  gitPathPermissions(): PathPermissions
  logger(): Logger
  readPathPermissions(): PathPermissions
  writePathPermissions(): PathPermissions
}
