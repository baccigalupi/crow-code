import type { Knex } from 'knex'
import type { CrowConfig } from './config.ts'
import { DenoRuntime } from './deno-runtime.ts'
import type { Environment } from './env-vars.ts'
import { Io } from './io.ts'
import type { ParsedArguments } from './arguments.ts'
import { delegate } from '../decorators.ts'
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
    parsedArguments: 'parsedArguments',
  },
  'denoRuntime',
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
export class AppData {
  config!: CrowConfig
  denoRuntime!: DenoRuntime
  io!: Io
  parsedArguments!: ParsedArguments
  repositoryRoot!: string
}

export interface AppData {
  args(): string[]
  consoleError(): ConsoleError
  consoleLog(): ConsoleLog
  database(): Promise<Knex>
  denoCommand(): DenoCommand
  envars(): Environment
  fetch(): typeof fetch
  getRealPath(): RealPath
  logger(): Logger
}
