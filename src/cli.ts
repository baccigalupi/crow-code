/** crow — CLI for crow-code. Subcommands dispatch below. */
import { join } from '@std/path'
import type { Logger } from './model-info/types.ts'
import { buildModelCatalog } from './model-info/catalog/build-model-catalog.ts'
import { commitChanges } from './tools/git-commit/commit.ts'
import { getCurrentDiff } from './tools/git-commit/current-diff.ts'
import { requestCommitSummary } from './tools/git-commit/request.ts'

const usage = 'Usage: crow <subcommand>\n\nAvailable subcommands:\n' +
  '  find-models   fetch model data into the crow directory\n' +
  '  git-commit    generate a summary and commit staged changes'
type DiffReader = typeof getCurrentDiff
type SummaryRequester = typeof requestCommitSummary
type SummaryWriter = (summary: string) => void
type Committer = (summary: string, logger: Logger) => Promise<boolean>
type CatalogBuilder = (crowDirectory: string, logger: Logger) => Promise<void>

class Cli {
  private argumentsList: string[]
  private logger: Logger
  private readDiff: DiffReader
  private requestSummary: SummaryRequester
  private writeSummary: SummaryWriter
  private commit: Committer
  private buildCatalog: CatalogBuilder

  constructor(
    argumentsList: string[],
    logger: Logger,
    readDiff: DiffReader,
    requestSummary: SummaryRequester,
    writeSummary: SummaryWriter,
    commit: Committer,
    buildCatalog: CatalogBuilder,
  ) {
    this.argumentsList = argumentsList
    this.logger = logger
    this.readDiff = readDiff
    this.requestSummary = requestSummary
    this.writeSummary = writeSummary
    this.commit = commit
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
    const summary = await this.generateSummary()
    this.writeSummary(summary)
    await this.commitSummary(summary)
  }
  private async generateSummary() {
    const diff = await this.readDiff(this.logger)
    return this.requestSummary(
      this.crowDirectory(),
      diff,
      this.goal(),
      this.logger,
    )
  }
  private async commitSummary(summary: string) {
    if (summary.length === 0) return

    await this.commit(summary, this.logger)
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
  commit: Committer = commitChanges,
  buildCatalog: CatalogBuilder = buildModelCatalog,
): Promise<void> => {
  await new Cli(
    argumentsList,
    logger,
    readDiff,
    requestSummary,
    writeSummary,
    commit,
    buildCatalog,
  ).run()
}
