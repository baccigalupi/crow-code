import type { CommandApplicationData, ConsoleLog } from '../../types.ts'
import { CommandMatch } from './command-match.ts'

const usageText = `Usage: crow <command>

Available commands:
  create-model-catalog   build models.json from live providers
  git-commit    generate a summary and commit staged changes`

export class Help {
  name: string = 'help'
  alias: string = 'h'
  private consoleLog: ConsoleLog

  constructor(data: CommandApplicationData) {
    this.consoleLog = data.consoleLog
  }

  run() {
    this.consoleLog(usageText)
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
