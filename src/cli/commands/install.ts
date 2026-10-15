import { runInstalltTui } from '../../tui/install/runner.ts'
import { Command } from './command.ts'

export class Install extends Command {
  isMatch() {
    return this.commands[0] === 'install'
  }

  async run() {
    await this.runner().run()
    return this
  }

  runner() {
    return runInstalltTui(this.applicationData.runtime)
  }
}
