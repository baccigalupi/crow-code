import type { CommandApplicationData, Logger } from '../../types.ts'
import { buildModelCatalog } from '../../model-info/catalog/build-model-catalog.ts'
import { CommandMatch } from './command-match.ts'

export class CreateModelCatalog {
  name: string = 'create-model-catalog'
  private crowDirectory: string
  private logger: Logger
  private fetchClient: typeof fetch

  constructor(data: CommandApplicationData) {
    this.crowDirectory = data.crowDirectory
    this.logger = data.logger
    this.fetchClient = data.fetchClient
  }

  run() {
    return buildModelCatalog(
      this.crowDirectory,
      this.logger,
      this.fetchClient,
    )
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
