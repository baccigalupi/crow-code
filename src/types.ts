import type { Logger } from './model-info/types.ts'

export type ParsedArguments = {
  subcommand: string
  goal: string
  help: boolean
  version: boolean
  unsupported: string[]
}

export type DiffReader =
  typeof import('./tools/git-commit/current-diff.ts').getCurrentDiff

export type SummaryRequester =
  typeof import('./tools/git-commit/request.ts').requestCommitSummary

export type ConsoleLog = (summary: string) => void

export type Committer = (summary: string, logger: Logger) => Promise<boolean>

export type CatalogBuilder = (
  crowDirectory: string,
  logger: Logger,
) => Promise<void>
