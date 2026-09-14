import { fetchNousModels } from './nous.js'
import { fetchOllamaModels } from './ollama.js'
import type { ModelRecord, ProviderConfig } from '../types.js'

type ProviderFetcher = (config: ProviderConfig) => Promise<ModelRecord[]>

const providerFetchers: ReadonlyMap<string, ProviderFetcher> = new Map([
  ['nous', fetchNousModels],
  ['ollama', fetchOllamaModels],
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
