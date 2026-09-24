import { Command } from './command.ts'

const usageText = `Usage: crow <command>

Available commands:
  create-model-catalog   build models.json from live providers
  git-commit    generate a summary and commit staged changes`

export class Help extends Command {
  isMatch() {
    return this.options.help === true || this.options.h === true
  }

  extractOptions() {
    return {}
  }

  run() {
    this.consoleLog(usageText)
    return Promise.resolve()
  }
}
