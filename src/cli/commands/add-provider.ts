import {
  type CreateProvider,
  createProvider,
} from '../../domain/providers/create.ts'
import { Command } from './command.ts'

export class AddProvider extends Command {
  private dbRecordCreator!: CreateProvider

  protected override logPrefix = 'Add provider: '

  isMatch() {
    return this.commands[0] === 'add-provider'
  }

  async run() {
    await this.createProvider()
    this.log()
    return this
  }

  private async createProvider() {
    this.dbRecordCreator = await this.runSubOperation(
      createProvider(this.applicationData, this.options),
    )
  }

  protected override errorReason() {
    return 'unable to create a provider'
  }

  private log() {
    if (this.dbRecordCreator.success()) {
      const envFile = this.applicationData.config.envFile
      this.applicationData.consoleLog()(
        `Provider added. Add your api key <api_key> to ${envFile}`,
      )
    }
  }
}
