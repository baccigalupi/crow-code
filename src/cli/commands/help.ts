import { Command } from './command.ts'
import { CommandMatch } from './command-match.ts'

const usageText = `Usage: crow <command>

Available commands:
  create-model-catalog   build models.json from live providers
  git-commit    generate a summary and commit staged changes`

export class Help extends Command {
  name: string = 'help'
  alias: string = 'h'

  run() {
    this.consoleLog(usageText)
    return Promise.resolve()
  }
}

export class HelpMatch extends CommandMatch {
  isMatch() {
    return this.options.help === true || this.options.h === true
  }

  extractOptions() {
    return {}
  }
}
