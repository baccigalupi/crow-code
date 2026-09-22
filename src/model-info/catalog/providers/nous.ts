import { fetchProvider } from './fetch-provider.ts'
import { NousParser } from './nous/parser.ts'
import type {
  Logger,
  ModelInfo,
  NousApiRecord,
  ProviderConfig,
} from '../../types.ts'

export const parseNousResponse = (
  raw: NousApiRecord,
  config: ProviderConfig,
) => {
  return new NousParser(config).parseResponse(raw)
}

export const fetchNousModels = (
  config: ProviderConfig,
  logger: Logger,
  fetchClient: typeof fetch = fetch,
) => {
  return fetchProvider<NousApiRecord, ModelInfo>(
    `${config.baseUrl}/v1/models`,
    (raw) => new NousParser(config).parseResponse(raw),
    20000,
    logger,
    fetchClient,
  )
}
