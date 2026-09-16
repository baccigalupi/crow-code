import { fetchProvider } from './fetch-provider.ts'
import { ModelRecord, ProviderConfig } from '../types.ts'

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
): ModelRecord => {
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
): ModelRecord[] => {
  if (raw.models === undefined) {
    return []
  }
  return raw.models.map((model) => buildOllamaRecord(model, config))
}

export const fetchOllamaModels = (
  config: ProviderConfig,
): Promise<ModelRecord[]> => {
  return fetchProvider<OllamaApiRecord, ModelRecord>(
    config.modelsUrl ?? config.baseUrl,
    (raw) => parseOllamaResponse(raw, config),
    ollamaTimeoutMs,
  )
}
