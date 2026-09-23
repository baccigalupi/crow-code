import type { ConsoleLog, ParsedArguments } from '../types.ts'
import type { FindModels } from './commands/find-models.ts'
import type { GitCommit } from './commands/git-commit.ts'
import { Help } from './commands/help.ts'

export class Cli {
  private parsed: ParsedArguments
  private consoleLog: ConsoleLog
  private findModels: FindModels
  private gitCommit: GitCommit
  private help: Help

  constructor(
    parsed: ParsedArguments,
    findModels: FindModels,
    gitCommit: GitCommit,
    consoleLog: ConsoleLog,
  ) {
    this.parsed = parsed
    this.findModels = findModels
    this.gitCommit = gitCommit
    this.consoleLog = consoleLog
    this.help = new Help(consoleLog)
  }

  run() {
    return this.dispatch()
  }

  private dispatch() {
    if (this.parsed.help) {
      return this.help.run()
    }
    return this.dispatchVersionOrSubcommand()
  }

  private dispatchVersionOrSubcommand() {
    if (this.parsed.version) {
      return this.showVersion()
    }
    return this.dispatchSubcommandOrError()
  }

  private dispatchSubcommandOrError() {
    if (this.parsed.unsupported.length > 0) {
      return this.help.run()
    }
    return this.dispatchSubcommand()
  }

  private showVersion() {
    this.consoleLog(`crow ${this.projectVersion()}`)
  }

  private projectVersion() {
    const url = new URL('../../deno.json', import.meta.url)
    return JSON.parse(Deno.readTextFileSync(url)).version
  }

  private dispatchSubcommand() {
    if (this.parsed.subcommand === 'find-models') {
      return this.findModels.run()
    }
    return this.dispatchGitCommitOrError()
  }

  private dispatchGitCommitOrError() {
    if (this.parsed.subcommand === 'git-commit') {
      return this.gitCommit.run()
    }
    return this.help.run()
  }
}
