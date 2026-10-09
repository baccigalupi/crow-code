import type { Knex } from 'knex'
import { join } from '@std/path'
import { OpenAI } from 'openai'
import type { OpenAiClientOptions } from './model-requests/types.ts'
import type { Environment } from './application-data/env-vars.ts'
import { delegate } from './decorators.ts'
import { DenoRuntime } from './application-data/deno-runtime.ts'
import { Io } from './application-data/io.ts'
import type {
  ConsoleError,
  ConsoleLog,
  DenoCommand,
  Logger,
  RealPath,
} from './types.ts'
import type { ParsedArguments } from './cli/types.ts'
import type { PathPermissions } from './application-data/path-permissions.ts'
import { Paths } from './application-data/paths.ts'

type ApplicationDataOverrides = { deno?: typeof Deno; crowDirectory?: string }

@delegate(
  {
    args: 'args',
    denoCommand: 'denoCommand',
    envars: 'envars',
    getRealPath: 'getRealPath',
    parsedArguments: 'parsedArguments',
  },
  'deno',
)
@delegate(
  {
    consoleError: 'consoleError',
    consoleLog: 'consoleLog',
    database: 'database',
    fetch: 'fetch',
    logger: 'logger',
  },
  'io',
)
@delegate(
  {
    crowDirectory: 'crowDirectory',
    gitPathPermissions: 'gitPathPermissions',
    pathPermissions: 'pathPermissions',
  },
  'paths',
)
export class ApplicationData {
  private deno: DenoRuntime
  private io: Io
  private paths: Paths

  constructor(options: ApplicationDataOverrides = {}) {
    const crowDirectory = options.crowDirectory || join(Deno.cwd(), '.crow')
    this.deno = new DenoRuntime(options.deno || Deno)
    this.io = new Io(crowDirectory)
    this.paths = new Paths(crowDirectory, this)
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
}

export interface ApplicationData {
  args(): string[]
  consoleError(): ConsoleError
  consoleLog(): ConsoleLog
  crowDirectory(): string
  database(): Promise<Knex>
  denoCommand(): DenoCommand
  fetch(): typeof fetch
  envars(): Environment
  getRealPath(): RealPath
  gitPathPermissions(): PathPermissions
  logger(): Logger
  pathPermissions(): PathPermissions
  parsedArguments(): ParsedArguments
}
