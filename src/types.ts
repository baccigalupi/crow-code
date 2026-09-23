import type pino from 'pino'

export type Logger = pino.Logger

export type ParsedArguments = {
  subcommand: string
  goal: string
  help: boolean
  version: boolean
  unsupported: string[]
}

export type DiffReader = (logger: Logger) => Promise<string>

export type SummaryRequester = (
  crowDirectory: string,
  diff: string,
  goal: string,
  logger: Logger,
) => Promise<string>

export type ConsoleLog = typeof console.log
export type DenoCommand = typeof Deno.Command

export type Committer = (summary: string, logger: Logger) => Promise<boolean>

export type CatalogBuilder = (
  crowDirectory: string,
  logger: Logger,
) => Promise<void>
