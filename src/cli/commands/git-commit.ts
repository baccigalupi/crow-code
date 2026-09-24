import { commitWithSummary } from '../../tools/git-commit/summary-commit.ts'
import { Command } from './command.ts'
import { CommandMatch } from './command-match.ts'

export class GitCommit extends Command {
  async run() {
    await commitWithSummary(this.options.goal as string, this.data)
  }
}

export class GitCommitMatch extends CommandMatch {
  isMatch() {
    return this.commands[0] === 'git-commit'
  }

  extractOptions() {
    if (typeof this.options.goal === 'string') {
      return { goal: this.options.goal }
    } else {
      return { goal: '' }
    }
  }
}
