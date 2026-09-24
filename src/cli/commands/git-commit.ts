import { commitWithSummary } from '../../tools/git-commit/summary-commit.ts'
import { Command } from './command.ts'

export class GitCommit extends Command {
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

  async run() {
    await commitWithSummary(this.extractOptions().goal, this.data)
  }
}
