import denoConfig from '../../../deno.json' with { type: 'json' }
import { Command } from './command.ts'

export class Version extends Command {
  isMatch() {
    return this.options.version === true || this.options.V === true
  }

  extractOptions() {
    return {}
  }

  run() {
    this.consoleLog(`crow ${denoConfig.version}`)
    return Promise.resolve()
  }
}
