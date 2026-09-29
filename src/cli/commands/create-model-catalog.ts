import { populateModels } from '../../model-discovery/populate/populate-models.ts'
import { Command } from './command.ts'

export class CreateModelCatalog extends Command {
  isMatch() {
    return this.commands[0] === 'create-model-catalog'
  }

  extractOptions() {
    return {}
  }

  async run() {
    await populateModels(
      this.environment,
      this.database,
      this.logger,
      this.fetchClient,
    )
  }
}
