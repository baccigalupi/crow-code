import { Command } from './command.ts'

const usageText = `Usage: crow <command>

Available commands:
  add-provider   add a provider (--name= --base-url= [--models-path=] [--api-key-env-var=])
  create-model-catalog   populate models from configured providers`

export class Help extends Command {
  isMatch() {
    return true
  }

  run() {
    this.applicationData.consoleLog()(usageText)
    return Promise.resolve(this)
  }
}
