import { createRunner } from '../../tui/runner.ts'
import { InstallApp } from '../../tui/install/install-app.tsx'
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
    return createRunner({}, InstallApp)
  }
}
