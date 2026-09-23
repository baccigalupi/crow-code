import { join } from '@std/path'
import type { Logger } from '../model-info/types.ts'
import type {
  CatalogBuilder,
  Committer,
  DiffReader,
  ParsedArguments,
  SummaryRequester,
  SummaryWriter,
} from '../types.ts'

export class Subcommands {
  private readDiff: DiffReader
  private requestSummary: SummaryRequester
  private writeSummary: SummaryWriter
  private commit: Committer
  private buildCatalog: CatalogBuilder
  private logger: Logger

  constructor(
    logger: Logger,
    readDiff: DiffReader,
    requestSummary: SummaryRequester,
    writeSummary: SummaryWriter,
    commit: Committer,
    buildCatalog: CatalogBuilder,
  ) {
    this.logger = logger
    this.readDiff = readDiff
    this.requestSummary = requestSummary
    this.writeSummary = writeSummary
    this.commit = commit
    this.buildCatalog = buildCatalog
  }

  findModels() {
    return this.buildCatalog(this.crowDirectory(), this.logger)
  }

  async gitCommit(parsed: ParsedArguments) {
    const summary = await this.generateSummary(parsed.goal)
    this.writeSummary(summary)
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
