import { Command } from './command.ts'

const usageText = `Usage: crow <command>

Available commands:
  create-model-catalog   build models.json from live providers
  git-commit    generate a summary and commit staged changes
  setup         create and migrate the crow database in .crow`

export class Help extends Command {
  isMatch() {
    return true
  }

  extractOptions() {
    return {}
  }

  run() {
    this.consoleLog(usageText)
    return Promise.resolve()
  }
}
