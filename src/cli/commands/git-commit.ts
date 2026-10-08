import { commit } from '../../tasks/commit.ts'
import { Command } from './command.ts'

export class GitCommit extends Command {
  protected override logPrefix = 'Git commit: '

  isMatch() {
    return this.commands[0] === 'git-commit'
  }

  async run() {
    if (!this.hasGoal()) return this.failEarly()
    const committed = await this.runSubOperation(this.commitTask())
    this.log(committed)
    return this
  }

  private failEarly() {
    this.fail('missing --goal=<goal>')
    this.logReason()
    return this
  }

  private hasGoal() {
    return typeof this.options.goal === 'string' &&
      this.options.goal.trim() !== ''
  }

  private goal() {
    return this.options.goal as string
  }

  private files() {
    return this.commands.slice(1)
  }

  private commitTask() {
    return commit({
      applicationData: this.applicationData,
      operationArguments: { goal: this.goal(), files: this.files() },
    })
  }

  private log(committed: ReturnType<typeof commit>) {
    if (committed.success()) {
      this.applicationData.consoleLog()(committed.result().subject)
    } else {
      this.logReason()
    }
  }

  private logReason() {
    this.applicationData.consoleLog()(this.reason)
  }
}
