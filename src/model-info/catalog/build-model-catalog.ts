import { loadProviderConfig } from '../providers/load-provider-config.ts'
import { fetchProviders } from '../providers/fetch-providers.ts'
import { normalizeRecords } from '../ratings/normalize-records.ts'
import { defaultModelCatalogPath, writeModelCatalog } from './model-catalog.ts'
import { type Environment, loadEnvironmentalVariables } from '../../env-vars.ts'
import type { Logger, ModelInfo } from '../types.ts'

class BuildModelCatalog {
  private crowDirectory: string
  private environment: Environment
  private fetchClient: typeof fetch
  private logger: Logger
  private records: ModelInfo[] = []

  constructor(
    crowDirectory: string,
    environment: Environment,
    fetchClient: typeof fetch,
    logger: Logger,
  ) {
    this.crowDirectory = crowDirectory
    this.environment = environment
    this.fetchClient = fetchClient
    this.logger = logger
  }

  async run() {
    this.logStart()
    await this.fetchProviders()
    await this.normalizeRecords()
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

  private async normalizeRecords() {
    this.records = await normalizeRecords(
      this.records,
      this.environment,
      this.logger,
      this.fetchClient,
    )
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
  environment: Environment = loadEnvironmentalVariables(),
  fetchClient: typeof fetch = fetch,
) => {
  const builder = new BuildModelCatalog(
    crowDirectory,
    environment,
    fetchClient,
    logger,
  )
  return await builder.run()
}
