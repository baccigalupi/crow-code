import packageConfig from '../../../package.json' with { type: 'json' }
import { Command } from './command.ts'

export class Version extends Command {
  isMatch() {
    return this.options.version === true || this.options.V === true
  }

  run() {
    this.applicationData.consoleLog()(`crow ${packageConfig.version}`)
    return Promise.resolve(this)
  }
}
