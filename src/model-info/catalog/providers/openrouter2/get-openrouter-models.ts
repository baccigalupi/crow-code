import { fetchProvider } from '../fetch-provider.ts'
import { parseOpenRouterBody } from './parser.ts'
import type { Logger } from '../../../../types.ts'
import type {
  CatalogModel,
  OpenRouter2ApiBody,
  ProviderConfig,
} from '../../../types.ts'

export const getOpenRouterModels = (
  config: ProviderConfig,
  logger: Logger,
  fetchClient: typeof fetch = fetch,
): Promise<CatalogModel[]> => {
  return fetchProvider<OpenRouter2ApiBody, CatalogModel>(
    `${config.baseUrl}/v1/models`,
    (body) => parseOpenRouterBody(body, 'openrouter'),
    20000,
    logger,
    fetchClient,
  )
}
