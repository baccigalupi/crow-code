import { fetchProvider } from './fetch-provider.ts'
import { OllamaParser } from './ollama/parser.ts'
import type {
  Logger,
  ModelInfo,
  OllamaApiRecord,
  ProviderConfig,
} from '../types.ts'

const ollamaTimeoutMs = 5000

const modelsEndpoint = (config: ProviderConfig) => {
  if (config.modelsUrl === undefined) {
    return `${config.baseUrl}/api/tags`
  }
  return config.modelsUrl
}

export const parseOllamaResponse = (
  raw: OllamaApiRecord,
  config: ProviderConfig,
) => {
  return new OllamaParser(config).parseResponse(raw)
}

export const fetchOllamaModels = (
  config: ProviderConfig,
  logger: Logger,
  fetchClient: typeof fetch = fetch,
) => {
  return fetchProvider<OllamaApiRecord, ModelInfo>(
    modelsEndpoint(config),
    (raw) => new OllamaParser(config).parseResponse(raw),
    ollamaTimeoutMs,
    logger,
    fetchClient,
  )
}
