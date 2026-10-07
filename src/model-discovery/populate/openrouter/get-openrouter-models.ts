import type { ApplicationData } from '../../../application-data.ts'
import { fetchProvider } from '../fetch-provider.ts'
import { saveCatalogModels } from '../save-catalog-models.ts'
import { parseOpenRouterBody } from './parser.ts'
import type { ProviderEntity } from '../../../domain/providers/entity.ts'
import type { CatalogModel, OpenRouter2ApiBody } from '../../types.ts'

const fetchOpenRouterModels = (
  provider: ProviderEntity,
  applicationData: ApplicationData,
) => {
  return fetchProvider<OpenRouter2ApiBody, CatalogModel>(
    applicationData,
    provider.modelsUrl(),
    (body) => parseOpenRouterBody(body, 'openrouter'),
    20000,
  )
}

export const getOpenRouterModels = async (
  provider: ProviderEntity,
  applicationData: ApplicationData,
) => {
  const models = (await fetchOpenRouterModels(provider, applicationData)
    .run()).result()
  await saveCatalogModels(applicationData, provider.id(), models).run()
  return models
}
