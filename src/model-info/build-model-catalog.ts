import { loadProviderConfig } from './providers/load-provider-config.ts'
import { fetchProviders } from './providers/fetch-providers.ts'
import { appendRatings } from './ratings/append-ratings.ts'
import { defaultModelCatalogPath, writeModelCatalog } from './model-catalog.ts'
import { type Environment, loadEnvironmentalVariables } from '../env-vars.ts'
import type { ModelInfo } from './types.ts'
import type pino from 'pino'
import { mergeModelRecords } from './merge-model-records.ts'

class BuildModelCatalog {
  private crowDirectory: string
  private environment: Environment
  private fetchClient: typeof fetch
  private logger: pino.Logger
  private records: ModelInfo[] = []

  constructor(
    crowDirectory: string,
    environment: Environment,
    fetchClient: typeof fetch,
    logger: pino.Logger,
  ) {
    this.crowDirectory = crowDirectory
    this.environment = environment
    this.fetchClient = fetchClient
    this.logger = logger
  }

  async run() {
    this.logStart()
    await this.fetchProviders()
    this.dedupRecords()
    await this.appendRatings()
    this.persistModelCatalog()
    this.logCompletion()
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

  private dedupRecords() {
    this.records = mergeModelRecords(this.records)
  }

  private async appendRatings() {
    this.records = await appendRatings(
      this.records,
      this.environment,
      this.logger,
      this.fetchClient,
    )
  }

  private persistModelCatalog() {
    writeModelCatalog(
      defaultModelCatalogPath(this.crowDirectory),
      this.records,
    )
  }

  private logCompletion() {
    this.logger.info(
      `Wrote ${this.records.length} models to ${
        defaultModelCatalogPath(
          this.crowDirectory,
        )
      }`,
    )
  }
}

export const buildModelCatalog = async (
  crowDirectory: string,
  logger: pino.Logger,
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
