import type { Command } from './commands/command.ts'

export class Cli {
  private createModelCatalog: Command
  private gitCommit: Command
  private help: Command
  private version: Command

  constructor(
    createModelCatalog: Command,
    gitCommit: Command,
    help: Command,
    version: Command,
  ) {
    this.createModelCatalog = createModelCatalog
    this.gitCommit = gitCommit
    this.help = help
    this.version = version
  }

  run() {
    return this.dispatch()
  }

  private dispatch() {
    if (this.help.isMatch()) {
      return this.help.run()
    }
    return this.dispatchVersionOrCommand()
  }

  private dispatchVersionOrCommand() {
    if (this.version.isMatch()) {
      return this.version.run()
    }
    return this.dispatchCommand()
  }

  private dispatchCommand() {
    if (this.createModelCatalog.isMatch()) {
      return this.createModelCatalog.run()
    }
    return this.dispatchGitCommitOrError()
  }

  private dispatchGitCommitOrError() {
    if (this.gitCommit.isMatch()) {
      return this.gitCommit.run()
    }
    return this.help.run()
  }
}
