import type { ConsoleLog } from '../../types.ts'

const usageText = `Usage: crow <command>

Available commands:
  create-model-catalog   build models.json from live providers
  git-commit    generate a summary and commit staged changes`

export class Help {
  name: string = 'help'
  alias: string = 'h'
  private consoleLog: ConsoleLog

  constructor(consoleLog: ConsoleLog) {
    this.consoleLog = consoleLog
  }

  run() {
    this.consoleLog(usageText)
  }
}
