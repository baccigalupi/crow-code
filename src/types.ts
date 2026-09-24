import type { Knex } from 'knex'
import type pino from 'pino'
import type { Environment } from './env-vars.ts'

export type Logger = pino.Logger

export type Migration = Knex.Migration & { name: string }

export type ParsedArgumentsOptions = Record<string, unknown>

export type ParsedArguments = {
  commands: string[]
  options: ParsedArgumentsOptions
}

export type ConsoleLog = typeof console.log
export type DenoCommand = typeof Deno.Command

export type Committer = (summary: string, logger: Logger) => Promise<boolean>

export type CommandApplicationData = {
  parsedArguments: ParsedArguments
  crowDirectory: string
  logger: Logger
  consoleLog: ConsoleLog
  fetchClient: typeof fetch
  denoCommand: DenoCommand
  environment: Environment
}
