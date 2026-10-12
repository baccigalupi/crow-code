import type { Knex } from 'knex'
import { OpenAI } from 'openai'
import type { OpenAiClientOptions } from '../model-requests/types.ts'
import type { CrowConfig } from './config.ts'
import { DenoRuntime } from './deno-runtime.ts'
import type { Environment } from './env-vars.ts'
import { Io } from './io.ts'
import type { ParsedArguments } from './arguments.ts'
import { delegate, memoize } from '../decorators.ts'
import { pathPermissions } from './path-permissions.ts'
import { gitPathPermissions } from './git-path-permissions.ts'
import { openAndMigrateDatabase } from '../database/open-and-migrate-database.ts'
import type {
  ConsoleError,
  ConsoleLog,
  DenoCommand,
  Logger,
  RealPath,
} from '../types.ts'

@delegate(
  {
    args: 'args',
    denoCommand: 'denoCommand',
    envars: 'envars',
    getRealPath: 'getRealPath',
  },
  'denoRuntime',
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
export class ApplicationData {
  config!: CrowConfig
  denoRuntime!: DenoRuntime
  io!: Io
  parsedArguments!: ParsedArguments
  repositoryRoot!: string

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
  database() {
    return openAndMigrateDatabase(
      this.config.crowGlobalDirectory,
      this.logger(),
    )
  }

  @memoize
  pathPermissions() {
    return pathPermissions({ getRealPath: this.getRealPath() })
  }

  @memoize
  gitPathPermissions() {
    return gitPathPermissions({
      getRealPath: this.getRealPath(),
      repositoryRoot: this.repositoryRoot,
    })
  }
}

export interface ApplicationData {
  args(): string[]
  consoleError(): ConsoleError
  consoleLog(): ConsoleLog
  denoCommand(): DenoCommand
  envars(): Environment
  fetch(): typeof fetch
  getRealPath(): RealPath
  logger(): Logger
}
