import { fetchNousModels } from './nous.ts'
import { fetchOllamaModels } from './ollama.ts'
import { fetchOpenRouterModels } from './openrouter.ts'
import type { ModelRecord, ProviderConfig } from '../types.ts'

type ProviderFetcher = (config: ProviderConfig) => Promise<ModelRecord[]>

const providerFetchers: ReadonlyMap<string, ProviderFetcher> = new Map([
  ['nous', fetchNousModels],
  ['ollama', fetchOllamaModels],
  ['openrouter', fetchOpenRouterModels],
])

const fetchProviders = async (
  config: ProviderConfig,
): Promise<ModelRecord[]> => {
  if (!providerFetchers.has(config.name)) {
    return []
  }
  return providerFetchers.get(config.name)!(config)
}

export { fetchProviders }
