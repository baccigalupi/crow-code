import { runInstalltTui } from '../../tui/install/runner.ts'
import { CommandTui } from './command-tui.ts'

export class Install extends CommandTui {
  protected runTui = runInstalltTui

  isMatch() {
    return this.commands[0] === 'install'
  }
}
