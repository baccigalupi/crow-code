import { loadProviderConfig } from './providers/load-provider-config.ts'
import { fetchProviders } from './providers/fetch-providers.ts'
import { defaultModelCatalogPath, writeModelCatalog } from './model-catalog.ts'
import type { Logger } from '../../types.ts'
import type { ModelInfo } from '../types.ts'

class BuildModelCatalog {
  private crowDirectory: string
  private fetchClient: typeof fetch
  private logger: Logger
  private records: ModelInfo[] = []

  constructor(
    crowDirectory: string,
    fetchClient: typeof fetch,
    logger: Logger,
  ) {
    this.crowDirectory = crowDirectory
    this.fetchClient = fetchClient
    this.logger = logger
  }

  async run() {
    this.logStart()
    await this.fetchProviders()
    this.persistModelCatalog()
  }

  private logStart() {
    this.logger.info('Fetching model data and building model catalog...')
  }

  private async fetchProviders() {
    const configs = loadProviderConfig(this.crowDirectory)

    this.records = (
      await Promise.all(
        configs.map((config) =>
          fetchProviders(config, this.logger, this.fetchClient)
        ),
      )
    ).flat()
  }

  private persistModelCatalog() {
    const path = defaultModelCatalogPath(this.crowDirectory)
    writeModelCatalog(path, this.records)
    this.logger.info(`Wrote ${this.records.length} models to ${path}`)
  }
}

export const buildModelCatalog = async (
  crowDirectory: string,
  logger: Logger,
  fetchClient: typeof fetch = fetch,
) => {
  const builder = new BuildModelCatalog(crowDirectory, fetchClient, logger)
  return await builder.run()
}
