import { fetchNousModels } from './nous.ts'
import { fetchOllamaModels } from './ollama.ts'
import { fetchOpenRouterModels } from './openrouter.ts'
import type { ModelRecord, ProviderConfig } from '../types.ts'

type ProviderFetcher = (
  config: ProviderConfig,
  fetchClient: typeof fetch,
) => Promise<ModelRecord[]>

const providerFetchers: ReadonlyMap<string, ProviderFetcher> = new Map([
  ['nous', fetchNousModels],
  ['ollama', fetchOllamaModels],
  ['openrouter', fetchOpenRouterModels],
])

export const fetchProviders = async (
  config: ProviderConfig,
  fetchClient: typeof fetch = fetch,
): Promise<ModelRecord[]> => {
  if (!providerFetchers.has(config.name)) {
    return Promise.resolve([] as ModelRecord[])
  }
  return await providerFetchers.get(config.name)!(config, fetchClient)
}
