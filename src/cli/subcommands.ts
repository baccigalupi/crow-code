import { join } from '@std/path'
import type {
  CatalogBuilder,
  Committer,
  ConsoleLog,
  DiffReader,
  Logger,
  ParsedArguments,
  SummaryRequester,
} from '../types.ts'

export class Subcommands {
  private readDiff: DiffReader
  private requestSummary: SummaryRequester
  private consoleLog: ConsoleLog
  private commit: Committer
  private buildCatalog: CatalogBuilder
  private logger: Logger

  constructor(
    logger: Logger,
    readDiff: DiffReader,
    requestSummary: SummaryRequester,
    consoleLog: ConsoleLog,
    commit: Committer,
    buildCatalog: CatalogBuilder,
  ) {
    this.logger = logger
    this.readDiff = readDiff
    this.requestSummary = requestSummary
    this.consoleLog = consoleLog
    this.commit = commit
    this.buildCatalog = buildCatalog
  }

  findModels() {
    return this.buildCatalog(this.crowDirectory(), this.logger)
  }

  async gitCommit(parsed: ParsedArguments) {
    const summary = await this.generateSummary(parsed.goal)
    this.consoleLog(summary)
    await this.commitSummary(summary)
  }

  private async generateSummary(goal: string) {
    const diff = await this.readDiff(this.logger)
    return this.requestSummary(this.crowDirectory(), diff, goal, this.logger)
  }

  private async commitSummary(summary: string) {
    if (summary.length === 0) return
    await this.commit(summary, this.logger)
  }

  private crowDirectory() {
    return join(Deno.cwd(), '.crow')
  }
}
