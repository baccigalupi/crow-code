import { fetchProvider } from '../catalog/providers/fetch-provider.ts'
import { parseNousBody } from './parser.ts'
import type { Logger } from '../../types.ts'
import type { CatalogModel, Nous2ApiBody, ProviderConfig } from '../types.ts'

export const getNousModels = (
  config: ProviderConfig,
  logger: Logger,
  fetchClient: typeof fetch = fetch,
): Promise<CatalogModel[]> => {
  return fetchProvider<Nous2ApiBody, CatalogModel>(
    `${config.baseUrl}/v1/models`,
    parseNousBody,
    20000,
    logger,
    fetchClient,
  )
}
