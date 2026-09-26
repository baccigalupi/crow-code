import type { Knex } from 'knex'
import type pino from 'pino'
import type { Environment } from './env-vars.ts'

export type Logger = pino.Logger

export type ParsedArgumentsOptions = Record<string, string | boolean>

export type DefaultReasoning = {
  mandatory?: boolean
  default_enabled?: boolean
  default_effort?: string
  supported_efforts?: string[]
  supports_max_tokens?: boolean
}

export type RecordParamValue =
  | string
  | number
  | boolean
  | null
  | string[]
  | DefaultReasoning

export type RecordParams = Record<string, RecordParamValue>

export type ParsedArguments = {
  commands: string[]
  options: ParsedArgumentsOptions
}

export type ConsoleLog = typeof console.log
export type DenoCommand = typeof Deno.Command

export type Committer = (summary: string, logger: Logger) => Promise<boolean>

export type DatabaseQuerySerializer<Result, Serialized> = (
  result: Result,
) => Serialized

export type CommandApplicationData = {
  parsedArguments: ParsedArguments
  crowDirectory: string
  logger: Logger
  database: Knex
  consoleLog: ConsoleLog
  fetchClient: typeof fetch
  denoCommand: DenoCommand
  environment: Environment
}
