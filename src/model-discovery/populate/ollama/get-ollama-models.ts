import type { Knex } from 'knex'
import { fetchProvider } from '../fetch-provider.ts'
import { saveCatalogModels } from '../save-catalog-models.ts'
import { parseOllamaBody } from './parser.ts'
import type { Logger } from '../../../types.ts'
import type { ProviderEntity } from '../../../domain/providers/entity.ts'
import type { CatalogModel, Ollama2ApiBody } from '../../types.ts'

const ollamaTimeoutMs = 5000

const fetchOllamaModels = (
  provider: ProviderEntity,
  logger: Logger,
  fetchClient: typeof fetch,
) => {
  return fetchProvider<Ollama2ApiBody, CatalogModel>(
    provider.modelsUrl(),
    (body) => parseOllamaBody(body, 'ollama'),
    ollamaTimeoutMs,
    logger,
    fetchClient,
  )
}

export const getOllamaModels = async (
  provider: ProviderEntity,
  logger: Logger,
  database: Knex,
  fetchClient: typeof fetch = fetch,
) => {
  const models = await fetchOllamaModels(provider, logger, fetchClient)
  await saveCatalogModels(database, provider.id(), models, logger)
  return models
}
