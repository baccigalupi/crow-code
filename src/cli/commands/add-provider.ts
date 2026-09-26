import {
  type CreateProvider,
  createProvider,
} from '../../domain/providers/create.ts'
import { Command } from './command.ts'

export class AddProvider extends Command {
  isMatch() {
    return this.commands[0] === 'add-provider'
  }

  extractOptions() {
    return this.options
  }

  async run() {
    const creator = await createProvider(
      this.database,
      this.logger,
      this.extractOptions(),
    )
    this.report(creator)
  }

  private report(creator: CreateProvider) {
    if (!creator.success()) {
      this.consoleLog('Unable to create a provider')
      return
    }
    this.consoleLog(
      'Provider added. Add your api key <api_key> to the .env file',
    )
  }
}
