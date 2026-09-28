import { fetchProvider } from '../fetch-provider.ts'
import { parseOpenRouterBody } from './parser.ts'
import type { Logger } from '../../../types.ts'
import type { ProviderEntity } from '../../../domain/providers/entity.ts'
import type { CatalogModel, OpenRouter2ApiBody } from '../../types.ts'

export const getOpenRouterModels = (
  provider: ProviderEntity,
  logger: Logger,
  fetchClient: typeof fetch = fetch,
): Promise<CatalogModel[]> => {
  return fetchProvider<OpenRouter2ApiBody, CatalogModel>(
    `${provider.baseUrl()}/v1/models`,
    (body) => parseOpenRouterBody(body, 'openrouter'),
    20000,
    logger,
    fetchClient,
  )
}
