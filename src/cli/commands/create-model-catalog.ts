import { buildModelCatalog } from '../../model-info/catalog/build-model-catalog.ts'
import { Command } from './command.ts'
import { CommandMatch } from './command-match.ts'

export class CreateModelCatalog extends Command {
  name: string = 'create-model-catalog'

  async run() {
    await buildModelCatalog(this.crowDirectory, this.logger, this.fetchClient)
  }
}

export class CreateModelCatalogMatch extends CommandMatch {
  isMatch() {
    return this.commands[0] === 'create-model-catalog'
  }

  extractOptions() {
    return {}
  }
}
