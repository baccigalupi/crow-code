import { fetchProvider } from '../fetch-provider.ts'
import { parseOllamaBody } from './parser.ts'
import type { Logger } from '../../../types.ts'
import type { ProviderEntity } from '../../../domain/providers/entity.ts'
import type { CatalogModel, Ollama2ApiBody } from '../../types.ts'

const ollamaTimeoutMs = 5000

export const getOllamaModels = (
  provider: ProviderEntity,
  logger: Logger,
  fetchClient: typeof fetch = fetch,
): Promise<CatalogModel[]> => {
  return fetchProvider<Ollama2ApiBody, CatalogModel>(
    provider.modelsUrl(),
    (body) => parseOllamaBody(body, 'ollama'),
    ollamaTimeoutMs,
    logger,
    fetchClient,
  )
}
