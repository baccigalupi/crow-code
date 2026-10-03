import {
  type CreateProvider,
  createProvider,
} from '../../domain/providers/create.ts'
import { Command } from './command.ts'

export class AddProvider extends Command {
  private dbRecordCreator!: CreateProvider

  isMatch() {
    return this.commands[0] === 'add-provider'
  }

  async run() {
    await this.createProvider()
    this.log()
  }

  private async createProvider() {
    this.dbRecordCreator = await createProvider(
      this.applicationData,
      this.options,
    )
  }

  private log() {
    if (this.dbRecordCreator.success()) {
      this.logSuccess()
    } else {
      this.logFailure()
    }
  }

  private logSuccess() {
    this.applicationData.consoleLog()(
      'Provider added. Add your api key <api_key> to the .env file',
    )
  }

  private logFailure() {
    this.applicationData.consoleLog()('Unable to create a provider')
  }
}
