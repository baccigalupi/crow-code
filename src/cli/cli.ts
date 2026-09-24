import type { CommandApplicationData } from '../types.ts'
import type { Command } from './commands/command.ts'

export class Cli {
  private data: CommandApplicationData
  private createModelCatalog: Command
  private gitCommit: Command
  private help: Command

  constructor(
    createModelCatalog: Command,
    gitCommit: Command,
    help: Command,
    data: CommandApplicationData,
  ) {
    this.createModelCatalog = createModelCatalog
    this.gitCommit = gitCommit
    this.help = help
    this.data = data
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
    if (this.versionRequested()) {
      return this.showVersion()
    }
    return this.dispatchCommand()
  }

  private versionRequested() {
    const options = this.data.parsedArguments.options
    return options.version === true || options.V === true
  }

  private showVersion() {
    this.data.consoleLog(`crow ${this.projectVersion()}`)
    return Promise.resolve()
  }

  private projectVersion() {
    const url = new URL('../../deno.json', import.meta.url)
    return JSON.parse(Deno.readTextFileSync(url)).version
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
