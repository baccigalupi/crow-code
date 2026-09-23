import type { Logger } from '../../types.ts'
import { buildModelCatalog } from '../../model-info/catalog/build-model-catalog.ts'

export class FindModels {
  name: string = 'find-models'
  private crowDirectory: string
  private logger: Logger
  private fetchClient: typeof fetch

  constructor(
    crowDirectory: string,
    logger: Logger,
    fetchClient: typeof fetch = fetch,
  ) {
    this.crowDirectory = crowDirectory
    this.logger = logger
    this.fetchClient = fetchClient
  }

  run() {
    return buildModelCatalog(
      this.crowDirectory,
      this.logger,
      this.fetchClient,
    )
  }
}
