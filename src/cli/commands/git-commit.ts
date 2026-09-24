import type { CommandApplicationData, ConsoleLog, Logger } from '../../types.ts'
import { commitChanges } from '../../tools/git-commit/commit.ts'
import { getCurrentDiff } from '../../tools/git-commit/current-diff.ts'
import { requestCommitSummary } from '../../tools/git-commit/request.ts'
import { CommandMatch } from './command-match.ts'

export class GitCommit {
  name: string = 'git-commit'
  private crowDirectory: string
  private logger: Logger
  private consoleLog: ConsoleLog
  private fetchClient: typeof fetch
  private goal: string
  private summary: string

  constructor(
    data: CommandApplicationData,
    goal: string,
  ) {
    this.crowDirectory = data.crowDirectory
    this.logger = data.logger
    this.consoleLog = data.consoleLog
    this.fetchClient = data.fetchClient
    this.goal = goal
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
    await commitChanges(this.summary, this.logger)
  }
}

export class GitCommitMatch extends CommandMatch {
  isMatch() {
    return this.commands[0] === 'git-commit'
  }

  extractOptions() {
    return { goal: this.options.goal }
  }
}
