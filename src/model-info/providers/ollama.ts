import { fetchProvider } from './fetch-provider.ts'
import type { ModelInfo, ProviderConfig } from '../types.ts'
import type pino from 'pino'

type OllamaModel = {
  name: string
  details?: { parameter_size?: string; context_length?: number }
}

const ollamaTimeoutMs = 5000

const ollamaContextLength = (
  details: OllamaModel['details'],
): number | null => {
  if (details === undefined) {
    return null
  }
  return details.context_length || null
}

const ollamaSize = (details: OllamaModel['details']): string => {
  if (details === undefined || details.parameter_size === undefined) {
    return ''
  }
  return details.parameter_size
}

const buildOllamaRecord = (
  model: OllamaModel,
  config: ProviderConfig,
): ModelInfo => {
  return {
    id: model.name,
    name: model.name,
    providers: [config.name],
    reasoning: null,
    coding: null,
    codingSource: null,
    agentic: null,
    costInput: 0,
    costOutput: 0,
    contextLength: ollamaContextLength(model.details),
    modality: 'local',
    reasoningMode: '-',
    knowledgeCutoff: null,
    size: ollamaSize(model.details),
  }
}

type OllamaApiRecord = { models?: OllamaModel[] }

export const parseOllamaResponse = (
  raw: OllamaApiRecord,
  config: ProviderConfig,
): ModelInfo[] => {
  if (raw.models === undefined) {
    return []
  }
  return raw.models.map((model) => buildOllamaRecord(model, config))
}

export const fetchOllamaModels = (
  config: ProviderConfig,
  logger: pino.Logger,
  fetchClient: typeof fetch = fetch,
): Promise<ModelInfo[]> => {
  return fetchProvider<OllamaApiRecord, ModelInfo>(
    config.modelsUrl ?? config.baseUrl,
    (raw) => parseOllamaResponse(raw, config),
    ollamaTimeoutMs,
    logger,
    fetchClient,
  )
}
