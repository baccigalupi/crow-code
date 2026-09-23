/**
 * crow — CLI for crow-code. Subcommands dispatch below.
 *   crow find-models   fetch model data into the crow directory
 */
import { join } from '@std/path'
import type { Logger } from './model-info/types.ts'
import { buildModelCatalog } from './model-info/catalog/build-model-catalog.ts'
import { getCurrentDiff } from './tools/git-commit/current-diff.ts'
import { requestCommitSummary } from './tools/git-commit/request.ts'

const usage = `Usage: crow <subcommand>

Available subcommands:
  find-models   fetch model data into the crow directory
  git-commit    generate a commit-message summary from tracked changes`

type DiffReader = typeof getCurrentDiff
type SummaryRequester = typeof requestCommitSummary
type SummaryWriter = (summary: string) => void
type CatalogBuilder = (crowDirectory: string, logger: Logger) => Promise<void>

class Cli {
  private argumentsList: string[]
  private logger: Logger
  private readDiff: DiffReader
  private requestSummary: SummaryRequester
  private writeSummary: SummaryWriter
  private buildCatalog: CatalogBuilder

  constructor(
    argumentsList: string[],
    logger: Logger,
    readDiff: DiffReader,
    requestSummary: SummaryRequester,
    writeSummary: SummaryWriter,
    buildCatalog: CatalogBuilder,
  ) {
    this.argumentsList = argumentsList
    this.logger = logger
    this.readDiff = readDiff
    this.requestSummary = requestSummary
    this.writeSummary = writeSummary
    this.buildCatalog = buildCatalog
  }

  run() {
    if (this.argumentsList[0] === 'find-models') return this.findModels()
    return this.runNonCatalogCommand()
  }

  private runNonCatalogCommand() {
    if (this.argumentsList[0] === 'git-commit') return this.gitCommit()
    this.logger.error(usage)
  }

  private findModels() {
    return this.buildCatalog(this.crowDirectory(), this.logger)
  }

  private async gitCommit() {
    const diff = await this.readDiff(this.logger)
    const summary = await this.requestSummary(
      this.crowDirectory(),
      diff,
      this.goal(),
      this.logger,
    )
    this.writeSummary(summary)
  }

  private crowDirectory() {
    return join(Deno.cwd(), '.crow')
  }

  private goal() {
    return this.argumentsList.slice(1).join(' ').trim()
  }
}

export const run = async (
  argumentsList: string[],
  logger: Logger,
  readDiff: DiffReader = getCurrentDiff,
  requestSummary: SummaryRequester = requestCommitSummary,
  writeSummary: SummaryWriter = console.log,
  buildCatalog: CatalogBuilder = buildModelCatalog,
): Promise<void> => {
  await new Cli(
    argumentsList,
    logger,
    readDiff,
    requestSummary,
    writeSummary,
    buildCatalog,
  ).run()
}
