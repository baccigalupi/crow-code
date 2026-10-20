import { runAgentTui } from '../../tui/agent/runner.ts'
import { CommandTui } from './command-tui.ts'

export class Agent extends CommandTui {
  protected runTui = runAgentTui

  isMatch() {
    return this.commands.length === 0 &&
      Object.keys(this.options).length === 0
  }
}
