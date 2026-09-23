import type { Committer, ConsoleLog, Logger } from '../../types.ts'
import { getCurrentDiff } from '../../tools/git-commit/current-diff.ts'
import { requestCommitSummary } from '../../tools/git-commit/request.ts'

export class GitCommit {
  name: string = 'git-commit'
  private goal: string
  private crowDirectory: string
  private logger: Logger
  private consoleLog: ConsoleLog
  private commit: Committer
  private fetchClient: typeof fetch
  private summary: string

  constructor(
    goal: string,
    crowDirectory: string,
    logger: Logger,
    consoleLog: ConsoleLog,
    commit: Committer,
    fetchClient: typeof fetch = fetch,
  ) {
    this.goal = goal
    this.crowDirectory = crowDirectory
    this.logger = logger
    this.consoleLog = consoleLog
    this.commit = commit
    this.fetchClient = fetchClient
    this.summary = ''
  }

  async run() {
    this.summary = await this.generateSummary()
    this.consoleLog(this.summary)
    await this.commitSummary()
  }

  private async generateSummary() {
    const diff = await getCurrentDiff(this.logger)
    return requestCommitSummary(
      this.crowDirectory,
      diff,
      this.goal,
      this.logger,
      this.fetchClient,
    )
  }

  private async commitSummary() {
    if (this.summary.length === 0) return
    await this.commit(this.summary, this.logger)
  }
}
