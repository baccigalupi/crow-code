import { fetchProvider } from '../fetch-provider.ts'
import { parseNousBody } from './parser.ts'
import type { Logger } from '../../../types.ts'
import type { ProviderEntity } from '../../../domain/providers/entity.ts'
import type { CatalogModel, Nous2ApiBody } from '../../types.ts'

export const getNousModels = (
  provider: ProviderEntity,
  logger: Logger,
  fetchClient: typeof fetch = fetch,
): Promise<CatalogModel[]> => {
  return fetchProvider<Nous2ApiBody, CatalogModel>(
    `${provider.baseUrl()}/v1/models`,
    (body) => parseNousBody(body, 'nous'),
    20000,
    logger,
    fetchClient,
  )
}
