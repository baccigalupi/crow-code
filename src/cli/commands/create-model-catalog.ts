import { populateModels } from '../../model-discovery/populate/populate-models.ts'
import { Command } from './command.ts'

export class CreateModelCatalog extends Command {
  isMatch() {
    return this.commands[0] === 'create-model-catalog'
  }

  async run() {
    await populateModels(this.applicationData)
    return this
  }
}
