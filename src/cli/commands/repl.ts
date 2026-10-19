import { runReplTui } from '../../tui/app/runner.ts'
import { CommandTui } from './command-tui.ts'

export class Repl extends CommandTui {
  protected runTui = runReplTui

  isMatch() {
    return this.commands.length === 0 &&
      Object.keys(this.options).length === 0
  }
}
