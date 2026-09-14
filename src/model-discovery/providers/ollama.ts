import { fetchCatalog } from './fetch-catalog.js'
import { ModelRecord } from '../types.js'

type OllamaModel = {
  name: string
  details?: { parameter_size?: string; context_length?: number }
}

const ollamaUrl = 'http://pile-driver.local:11434/api/tags'

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

const buildOllamaRecord = (model: OllamaModel): ModelRecord => {
  return {
    id: model.name,
    name: model.name,
    providers: ['ollama'],
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

export const parseOllamaResponse = (raw: OllamaApiRecord): ModelRecord[] => {
  if (raw.models === undefined) {
    return []
  }
  return raw.models.map(buildOllamaRecord)
}

export const fetchOllamaModels = (): Promise<ModelRecord[]> => {
  return fetchCatalog<OllamaApiRecord, ModelRecord>(
    ollamaUrl,
    parseOllamaResponse,
    ollamaTimeoutMs,
  )
}
