import type { Knex } from 'knex'
import { fetchProvider } from '../fetch-provider.ts'
import { saveCatalogModels } from '../save-catalog-models.ts'
import { parseOpenRouterBody } from './parser.ts'
import type { Logger } from '../../../types.ts'
import type { ProviderEntity } from '../../../domain/providers/entity.ts'
import type { CatalogModel, OpenRouter2ApiBody } from '../../types.ts'

const fetchOpenRouterModels = (
  provider: ProviderEntity,
  logger: Logger,
  fetchClient: typeof fetch,
) => {
  return fetchProvider<OpenRouter2ApiBody, CatalogModel>(
    provider.modelsUrl(),
    (body) => parseOpenRouterBody(body, 'openrouter'),
    20000,
    logger,
    fetchClient,
  )
}

export const getOpenRouterModels = async (
  provider: ProviderEntity,
  logger: Logger,
  database: Knex,
  fetchClient: typeof fetch = fetch,
) => {
  const models = await fetchOpenRouterModels(provider, logger, fetchClient)
  await saveCatalogModels(database, provider.id(), models, logger)
  return models
}
