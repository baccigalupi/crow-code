import { ModelRecord } from '../types.js'
import { nullableNumber } from '../record-helpers.js'

type OllamaModel = {
  name: string
  details?: { parameter_size?: string; context_length?: number }
}

export const ollamaUrl = 'http://pile-driver.local:11434/api/tags'

export const ollamaTimeoutMs = 5000

const ollamaContextLength = (
  details: OllamaModel['details'],
): number | null => {
  if (details === undefined) {
    return null
  }
  return nullableNumber(details.context_length)
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

export const parseOllamaResponse = (raw: unknown): ModelRecord[] => {
  const body = raw as { models?: OllamaModel[] }
  if (body.models === undefined) {
    return []
  }
  return body.models.map(buildOllamaRecord)
}
