import type pino from 'pino'

export type Logger = pino.Logger

export type ParsedArguments = {
  subcommand: string
  goal: string
  help: boolean
  version: boolean
  unsupported: string[]
}

export type ConsoleLog = typeof console.log
export type DenoCommand = typeof Deno.Command

export type Committer = (summary: string, logger: Logger) => Promise<boolean>
