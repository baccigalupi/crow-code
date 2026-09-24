import { commitChanges } from '../../tools/git-commit/commit.ts'
import { getCurrentDiff } from '../../tools/git-commit/current-diff.ts'
import { requestCommitSummary } from '../../tools/git-commit/request.ts'
import { Command } from './command.ts'
import { CommandMatch } from './command-match.ts'

export class GitCommit extends Command {
  name: string = 'git-commit'
  private summary: string = ''

  async run() {
    this.summary = await this.generateSummary()
    this.consoleLog(this.summary)
    await this.commitSummary()
  }

  private goal() {
    if (typeof this.options.goal === 'string') {
      return this.options.goal
    } else {
      return ''
    }
  }

  private async generateSummary() {
    const diff = await getCurrentDiff(this.logger, this.denoCommand)
    return requestCommitSummary(
      this.crowDirectory,
      diff,
      this.goal(),
      this.logger,
      this.environment,
      this.fetchClient,
    )
  }

  private async commitSummary() {
    if (this.summary.length === 0) return
    await commitChanges(this.summary, this.logger, this.denoCommand)
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
