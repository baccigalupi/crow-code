import type { ReplStatus } from '../../tui/types.ts'
import type { RunTui } from '../types.ts'
import { Command } from './command.ts'

export abstract class CommandTui extends Command {
  protected abstract runTui: RunTui
  private status: ReplStatus = 'completed'

  async run() {
    this.status = await this.runner().status()
    return this
  }

  override exitCode() {
    if (this.status === 'completed') return 0
    return 1
  }

  runner() {
    return this.runTui(this.applicationData, {})
  }
}
