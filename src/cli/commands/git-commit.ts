import type { ConsoleLog, DenoCommand } from '../../types.ts'

const usageText = `Usage: crow <command>

Available commands:
  find-models   fetch model data into the crow directory
  git-commit    generate a summary and commit staged changes`

export class GitCommit {
  name: string = 'git-commit'
  private consoleLog: ConsoleLog
  private denoCommand: DenoCommand

  constructor(consoleLog: ConsoleLog, denoCommand: DenoCommand) {
    this.consoleLog = consoleLog
    this.denoCommand = denoCommand
  }

  run() {
    this.consoleLog(usageText)
  }
}
