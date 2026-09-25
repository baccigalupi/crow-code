import { fetchProvider } from '../fetch-provider.ts'
import { parseOllamaBody } from './parser.ts'
import type { Logger } from '../../../../types.ts'
import type {
  CatalogModel,
  Ollama2ApiBody,
  ProviderConfig,
} from '../../../types.ts'

const ollamaTimeoutMs = 5000

export const getOllamaModels = (
  config: ProviderConfig,
  logger: Logger,
  fetchClient: typeof fetch = fetch,
): Promise<CatalogModel[]> => {
  return fetchProvider<Ollama2ApiBody, CatalogModel>(
    config.modelsUrl!,
    (body) => parseOllamaBody(body, 'ollama'),
    ollamaTimeoutMs,
    logger,
    fetchClient,
  )
}
