import type { CommandApplicationData, ParsedArguments } from '../types.ts'
import type { CreateModelCatalog } from './commands/create-model-catalog.ts'
import type { GitCommit } from './commands/git-commit.ts'
import { Help } from './commands/help.ts'

export class Cli {
  private parsed: ParsedArguments
  private commandData: CommandApplicationData
  private createModelCatalog: CreateModelCatalog
  private gitCommit: GitCommit
  private help: Help

  constructor(
    parsed: ParsedArguments,
    createModelCatalog: CreateModelCatalog,
    gitCommit: GitCommit,
    commandData: CommandApplicationData,
  ) {
    this.parsed = parsed
    this.createModelCatalog = createModelCatalog
    this.gitCommit = gitCommit
    this.commandData = commandData
    this.help = new Help(commandData)
  }

  run() {
    return this.dispatch()
  }

  private dispatch() {
    if (this.helpRequested()) {
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

  private helpRequested() {
    const options = this.parsed.options
    return options.help === true || options.h === true
  }

  private versionRequested() {
    const options = this.parsed.options
    return options.version === true || options.V === true
  }

  private command() {
    const first = this.parsed.commands[0]
    if (first === undefined) return ''
    return first
  }

  private showVersion() {
    this.commandData.consoleLog(`crow ${this.projectVersion()}`)
  }

  private projectVersion() {
    const url = new URL('../../deno.json', import.meta.url)
    return JSON.parse(Deno.readTextFileSync(url)).version
  }

  private dispatchCommand() {
    if (this.command() === 'create-model-catalog') {
      return this.createModelCatalog.run()
    }
    return this.dispatchGitCommitOrError()
  }

  private dispatchGitCommitOrError() {
    if (this.command() === 'git-commit') {
      return this.gitCommit.run()
    }
    return this.help.run()
  }
}
