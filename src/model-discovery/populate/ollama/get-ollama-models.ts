import type { ApplicationData } from '../../../application-data.ts'
import { fetchProvider } from '../fetch-provider.ts'
import { saveCatalogModels } from '../save-catalog-models.ts'
import { parseOllamaBody } from './parser.ts'
import type { ProviderEntity } from '../../../domain/providers/entity.ts'
import type { CatalogModel, Ollama2ApiBody } from '../../types.ts'

const ollamaTimeoutMs = 5000

const fetchOllamaModels = (
  provider: ProviderEntity,
  applicationData: ApplicationData,
) => {
  return fetchProvider<Ollama2ApiBody, CatalogModel>(
    applicationData,
    provider.modelsUrl(),
    (body) => parseOllamaBody(body, 'ollama'),
    ollamaTimeoutMs,
  )
}

export const getOllamaModels = async (
  provider: ProviderEntity,
  applicationData: ApplicationData,
) => {
  const models = await fetchOllamaModels(provider, applicationData)
  await saveCatalogModels(applicationData, provider.id(), models)
  return models
}
