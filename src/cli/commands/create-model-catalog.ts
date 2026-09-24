import { buildModelCatalog } from '../../model-info/catalog/build-model-catalog.ts'
import { Command } from './command.ts'

export class CreateModelCatalog extends Command {
  isMatch() {
    return this.commands[0] === 'create-model-catalog'
  }

  extractOptions() {
    return {}
  }

  async run() {
    await buildModelCatalog(this.crowDirectory, this.logger, this.fetchClient)
  }
}
