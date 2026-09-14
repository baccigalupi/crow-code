import { aiderPolyglotPct } from './ratings/aider-polyglot.js'
import { nullableNumber, resolveCoding } from './record-helpers.js'
import { ModelRecord, OllamaModel } from './types.js'

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

export const buildOllamaRecord = (model: OllamaModel): ModelRecord => {
  const coding = resolveCoding(undefined, aiderPolyglotPct[model.name])
  return {
    id: model.name,
    name: model.name,
    providers: ['ollama'],
    reasoning: null,
    coding: coding.coding,
    codingSource: coding.source,
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
