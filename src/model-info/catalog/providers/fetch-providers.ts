import { fetchNousModels } from './nous.ts'
import { fetchOllamaModels } from './ollama.ts'
import { fetchOpenRouterModels } from './openrouter.ts'
import type { Logger, ModelInfo, ProviderConfig } from '../../types.ts'

type ProviderFetcher = (
  config: ProviderConfig,
  logger: Logger,
  fetchClient: typeof fetch,
) => Promise<ModelInfo[]>

const providerFetchers: ReadonlyMap<string, ProviderFetcher> = new Map([
  ['nous', fetchNousModels],
  ['ollama', fetchOllamaModels],
  ['openrouter', fetchOpenRouterModels],
])

export const fetchProviders = async (
  config: ProviderConfig,
  logger: Logger,
  fetchClient: typeof fetch = fetch,
) => {
  if (!providerFetchers.has(config.name)) {
    return Promise.resolve([] as ModelInfo[])
  }
  return await providerFetchers.get(config.name)!(config, logger, fetchClient)
}
