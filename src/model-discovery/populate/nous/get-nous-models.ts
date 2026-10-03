import type { ApplicationData } from '../../../application-data.ts'
import { fetchProvider } from '../fetch-provider.ts'
import { saveCatalogModels } from '../save-catalog-models.ts'
import { parseNousBody } from './parser.ts'
import type { ProviderEntity } from '../../../domain/providers/entity.ts'
import type { CatalogModel, Nous2ApiBody } from '../../types.ts'

const fetchNousModels = (
  provider: ProviderEntity,
  applicationData: ApplicationData,
) => {
  return fetchProvider<Nous2ApiBody, CatalogModel>(
    applicationData,
    provider.modelsUrl(),
    (body) => parseNousBody(body, 'nous'),
    20000,
  )
}

export const getNousModels = async (
  provider: ProviderEntity,
  applicationData: ApplicationData,
) => {
  const models = await fetchNousModels(provider, applicationData)
  await saveCatalogModels(applicationData, provider.id(), models)
  return models
}
