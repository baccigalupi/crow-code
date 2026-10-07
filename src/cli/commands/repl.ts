import { createRunner } from '../../tui/runner.ts'
import { Command } from './command.ts'

export class Repl extends Command {
  isMatch() {
    return this.commands.length === 0 &&
      Object.keys(this.options).length === 0
  }

  async run() {
    await this.runner().run()
    return this
  }

  runner() {
    return createRunner()
  }
}
