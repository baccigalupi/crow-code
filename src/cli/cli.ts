import type { ConsoleLog, ParsedArguments } from '../types.ts'
import { parseArguments } from './arguments.ts'
import { Help } from './commands/help.ts'
import type { Subcommands } from './subcommands.ts'

export class Cli {
  private argumentsList: string[]
  private consoleLog: ConsoleLog
  private commands: Subcommands
  private help: Help

  constructor(
    argumentsList: string[],
    commands: Subcommands,
    consoleLog: ConsoleLog,
  ) {
    this.argumentsList = argumentsList
    this.commands = commands
    this.consoleLog = consoleLog
    this.help = new Help(consoleLog)
  }

  run() {
    const parsed = parseArguments(this.argumentsList)
    return this.dispatch(parsed)
  }

  private dispatch(parsed: ParsedArguments) {
    if (parsed.help) {
      return this.help.run()
    }
    return this.dispatchVersionOrSubcommand(parsed)
  }

  private dispatchVersionOrSubcommand(parsed: ParsedArguments) {
    if (parsed.version) {
      return this.showVersion()
    }
    return this.dispatchSubcommandOrError(parsed)
  }

  private dispatchSubcommandOrError(parsed: ParsedArguments) {
    if (parsed.unsupported.length > 0) {
      return this.help.run()
    }
    return this.dispatchSubcommand(parsed)
  }

  private showVersion() {
    this.consoleLog(`crow ${this.projectVersion()}`)
  }

  private projectVersion() {
    const url = new URL('../../deno.json', import.meta.url)
    return JSON.parse(Deno.readTextFileSync(url)).version
  }

  private dispatchSubcommand(parsed: ParsedArguments) {
    if (parsed.subcommand === 'find-models') {
      return this.commands.findModels()
    }
    return this.dispatchGitCommitOrError(parsed)
  }

  private dispatchGitCommitOrError(parsed: ParsedArguments) {
    if (parsed.subcommand === 'git-commit') {
      return this.commands.gitCommit(parsed)
    }
    return this.help.run()
  }
}
