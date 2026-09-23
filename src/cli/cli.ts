import type { Logger } from '../model-info/types.ts'
import type { ConsoleLog, ParsedArguments } from '../types.ts'
import { parseArguments } from './arguments.ts'
import type { Subcommands } from './subcommands.ts'

export class Cli {
  private argumentsList: string[]
  private logger: Logger
  private consoleLog: ConsoleLog
  private commands: Subcommands

  constructor(
    argumentsList: string[],
    logger: Logger,
    commands: Subcommands,
    consoleLog: ConsoleLog,
  ) {
    this.argumentsList = argumentsList
    this.logger = logger
    this.commands = commands
    this.consoleLog = consoleLog
  }

  run() {
    const parsed = parseArguments(this.argumentsList)
    return this.dispatch(parsed)
  }

  private dispatch(parsed: ParsedArguments) {
    if (parsed.help) {
      return this.showHelp()
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
      return this.showUsageError()
    }
    return this.dispatchSubcommand(parsed)
  }

  private showHelp() {
    this.consoleLog(this.usageText())
  }

  private showVersion() {
    this.consoleLog(`crow ${this.projectVersion()}`)
  }

  private showUsageError() {
    this.logger.error(this.usageText())
  }

  private projectVersion() {
    const url = new URL('../../deno.json', import.meta.url)
    return JSON.parse(Deno.readTextFileSync(url)).version
  }

  private usageText() {
    return 'Usage: crow <subcommand>\n\nAvailable subcommands:\n' +
      '  find-models   fetch model data into the crow directory\n' +
      '  git-commit    generate a summary and commit staged changes'
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
    return this.showUsageError()
  }
}
