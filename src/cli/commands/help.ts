import { Command } from './command.ts'

const usageText = `Usage: crow <command>

Available commands:
  add-provider   add a provider (--name= --base-url= [--models-path=] [--api-key-env-var=])
  create-model-catalog   build models.json from live providers
  git-commit    generate a summary and commit staged changes`

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
