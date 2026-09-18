import { fetchProvider } from './fetch-provider.ts'
import { OpenRouterParser } from './openrouter/parser.ts'
import type {
  Logger,
  ModelInfo,
  OpenRouterApiRecord,
  ProviderConfig,
} from '../types.ts'

const openrouterTimeoutMs = 20000

const modelsEndpoint = (config: ProviderConfig) => {
  if (config.modelsUrl === undefined) {
    return config.baseUrl
  }
  return config.modelsUrl
}

export const parseOpenRouterResponse = (
  raw: OpenRouterApiRecord,
  config: ProviderConfig,
) => {
  return new OpenRouterParser(config).parseResponse(raw)
}

export const fetchOpenRouterModels = (
  config: ProviderConfig,
  logger: Logger,
  fetchClient: typeof fetch = fetch,
) => {
  return fetchProvider<OpenRouterApiRecord, ModelInfo>(
    modelsEndpoint(config),
    (raw) => new OpenRouterParser(config).parseResponse(raw),
    openrouterTimeoutMs,
    logger,
    fetchClient,
  )
}
