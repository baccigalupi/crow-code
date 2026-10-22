import { Command } from './command.ts'

export class Agent extends Command {
  isMatch() {
    return this.commands.length === 0 && Object.keys(this.options).length === 0
  }

  run() {
    this.applicationData.consoleLog()('Agent TUI app ... coming soon')
    return Promise.resolve(this)
  }
}
