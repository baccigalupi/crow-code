import type { Knex } from 'knex'
import { fetchProvider } from '../fetch-provider.ts'
import { saveCatalogModels } from '../save-catalog-models.ts'
import { parseNousBody } from './parser.ts'
import type { Logger } from '../../../types.ts'
import type { ProviderEntity } from '../../../domain/providers/entity.ts'
import type { CatalogModel, Nous2ApiBody } from '../../types.ts'

const fetchNousModels = (
  provider: ProviderEntity,
  logger: Logger,
  fetchClient: typeof fetch,
) => {
  return fetchProvider<Nous2ApiBody, CatalogModel>(
    `${provider.baseUrl()}/v1/models`,
    (body) => parseNousBody(body, 'nous'),
    20000,
    logger,
    fetchClient,
  )
}

export const getNousModels = async (
  provider: ProviderEntity,
  logger: Logger,
  database: Knex,
  fetchClient: typeof fetch = fetch,
) => {
  const models = await fetchNousModels(provider, logger, fetchClient)
  await saveCatalogModels(database, provider.id(), models, logger)
  return models
}
