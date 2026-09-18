import { fetchProvider } from './fetch-provider.ts'
import type { Logger, ModelInfo, ProviderConfig } from '../types.ts'

type OpenRouterPricing = {
  prompt?: string
  completion?: string
}

type OpenRouterModel = {
  id: string
  name?: string
  context_length?: number
  pricing?: OpenRouterPricing
  architecture?: { modality?: string }
}

const openrouterTimeoutMs = 20000

const modelName = (model: OpenRouterModel) => {
  if (model.name === undefined) {
    return model.id
  }
  return model.name
}

const modality = (model: OpenRouterModel) => {
  if (
    model.architecture === undefined ||
    model.architecture.modality === undefined
  ) {
    return '-'
  }
  return model.architecture.modality
}

const promptPrice = (pricing: OpenRouterPricing | undefined) => {
  if (pricing === undefined) {
    return undefined
  }
  return pricing.prompt
}

const completionPrice = (pricing: OpenRouterPricing | undefined) => {
  if (pricing === undefined) {
    return undefined
  }
  return pricing.completion
}

const toMillionPrice = (pricePerToken: string | undefined) => {
  if (pricePerToken === undefined) {
    return 0
  }
  return parseFloat(pricePerToken) * 1_000_000
}

const buildOpenRouterRecord = (
  model: OpenRouterModel,
  config: ProviderConfig,
) => {
  return {
    id: model.id,
    name: modelName(model),
    providers: [config.name],
    reasoning: null,
    coding: null,
    codingSource: null,
    agentic: null,
    costInput: toMillionPrice(promptPrice(model.pricing)),
    costOutput: toMillionPrice(completionPrice(model.pricing)),
    contextLength: model.context_length || null,
    modality: modality(model),
    reasoningMode: '-',
    knowledgeCutoff: null,
    size: '',
  }
}

type OpenRouterApiRecord = { data?: OpenRouterModel[] }

export const parseOpenRouterResponse = (
  raw: OpenRouterApiRecord,
  config: ProviderConfig,
) => {
  if (raw.data === undefined) {
    return []
  }
  return raw.data.map((model) => buildOpenRouterRecord(model, config))
}

export const fetchOpenRouterModels = (
  config: ProviderConfig,
  logger: Logger,
  fetchClient: typeof fetch = fetch,
) => {
  return fetchProvider<OpenRouterApiRecord, ModelInfo>(
    config.modelsUrl ?? config.baseUrl,
    (raw) => parseOpenRouterResponse(raw, config),
    openrouterTimeoutMs,
    logger,
    fetchClient,
  )
}
