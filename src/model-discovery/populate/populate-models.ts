import type { Knex } from 'knex'
import type { Environment } from '../../env-vars.ts'
import type { Logger } from '../../types.ts'
import { providerFindAll } from '../../domain/providers/find-all.ts'
import type { ProviderEntity } from '../../domain/providers/entity.ts'
import { getNousModels } from './nous/get-nous-models.ts'
import { getOllamaModels } from './ollama/get-ollama-models.ts'
import { getOpenRouterModels } from './openrouter/get-openrouter-models.ts'
import type { CatalogModel } from '../types.ts'

type ProviderModelsGetter = (
  provider: ProviderEntity,
  logger: Logger,
  database: Knex,
  fetchClient: typeof fetch,
) => Promise<CatalogModel[]>

const providerGetters: ReadonlyMap<string, ProviderModelsGetter> = new Map([
  ['nous', getNousModels],
  ['ollama', getOllamaModels],
  ['openrouter', getOpenRouterModels],
])

class PopulateModels {
  private environment: Environment
  private database: Knex
  private logger: Logger
  private fetchClient: typeof fetch

  constructor(
    environment: Environment,
    database: Knex,
    logger: Logger,
    fetchClient: typeof fetch,
  ) {
    this.environment = environment
    this.database = database
    this.logger = logger
    this.fetchClient = fetchClient
  }

  async run() {
    const providers = await this.findAllProviders()
    const results = await Promise.all(providers.map((p) => this.getModels(p)))
    return results.flat()
  }

  private findAllProviders() {
    return providerFindAll(
      this.environment,
      this.database,
      this.logger,
    ).all()
  }

  private getModels(provider: ProviderEntity) {
    if (!providerGetters.has(provider.name())) {
      return this.skipProvider(provider.name())
    }
    const getter = providerGetters.get(provider.name())!
    return getter(provider, this.logger, this.database, this.fetchClient)
  }

  private skipProvider(name: string) {
    this.logger.info(`Skipping provider "${name}" (no model getter registered)`)
    return Promise.resolve([])
  }
}

export const populateModels = (
  environment: Environment,
  database: Knex,
  logger: Logger,
  fetchClient: typeof fetch = fetch,
) => new PopulateModels(environment, database, logger, fetchClient).run()
