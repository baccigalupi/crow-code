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
import { expandHome } from './path-permissions/expand-home.ts'
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
  crowGlobalDirectory() {
    return expandHome({
      directories: [this.config.crowGlobalDirectory],
      envars: this.envars(),
    }).directories()[0]
  }

  @memoize
  database() {
    return openAndMigrateDatabase(this.crowGlobalDirectory(), this.logger())
  }

  @memoize
  writePathPermissions() {
    return pathPermissions({
      getRealPath: this.getRealPath(),
      envars: this.envars(),
      allowedDirectories: [Deno.cwd()],
    })
  }

  @memoize
  readPathPermissions() {
    return pathPermissions({
      getRealPath: this.getRealPath(),
      envars: this.envars(),
      allowedDirectories: [Deno.cwd(), ...this.config.readableDirectories],
    })
  }

  @memoize
  gitPathPermissions() {
    return pathPermissions({
      getRealPath: this.getRealPath(),
      envars: this.envars(),
      allowedDirectories: [this.repositoryRoot],
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
