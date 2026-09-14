import { aiderPolyglotPct } from './aider-polyglot.js'
import {
  nullableNumber,
  nullableString,
  resolveCoding,
} from './record-helpers.js'
import { AABenchmarks, ModelRecord, NousModel, ReasoningMeta } from './types.js'

const modelName = (model: NousModel): string => {
  if (model.name === undefined) {
    return model.id
  }
  return model.name
}

const modality = (model: NousModel): string => {
  if (
    model.architecture === undefined ||
    model.architecture.modality === undefined
  ) {
    return '-'
  }
  return model.architecture.modality
}

const promptPrice = (pricing: NousModel['pricing']): string | undefined => {
  if (pricing === undefined) {
    return undefined
  }
  return pricing.prompt
}

const completionPrice = (pricing: NousModel['pricing']): string | undefined => {
  if (pricing === undefined) {
    return undefined
  }
  return pricing.completion
}

const toMillionPrice = (pricePerToken: string | undefined): number => {
  if (pricePerToken === undefined) {
    return 0
  }
  return parseFloat(pricePerToken) * 1_000_000
}

const benchmarkIntelligence = (
  benchmark: AABenchmarks | undefined,
): number | null => {
  if (benchmark === undefined) {
    return null
  }
  return benchmark.intelligence
}

const benchmarkAgentic = (
  benchmark: AABenchmarks | undefined,
): number | null => {
  if (benchmark === undefined) {
    return null
  }
  return benchmark.agentic
}

const reasoningModeLabel = (meta: ReasoningMeta): string => {
  if (meta.mandatory === true) {
    return 'forced'
  }
  if (meta.default_enabled === true) {
    return 'on'
  }
  return 'off'
}

const reasoningMode = (meta: ReasoningMeta | null | undefined): string => {
  if (meta === null || meta === undefined) {
    return '-'
  }
  const mode = reasoningModeLabel(meta)
  if (meta.default_effort === undefined) {
    return mode
  }
  return `${mode}/${meta.default_effort}`
}

export const buildNousRecord = (
  model: NousModel,
  benchmark: AABenchmarks | undefined,
): ModelRecord => {
  const coding = resolveCoding(benchmark, aiderPolyglotPct[model.id])
  return {
    id: model.id,
    name: modelName(model),
    providers: ['nous'],
    reasoning: benchmarkIntelligence(benchmark),
    coding: coding.coding,
    codingSource: coding.source,
    agentic: benchmarkAgentic(benchmark),
    costInput: toMillionPrice(promptPrice(model.pricing)),
    costOutput: toMillionPrice(completionPrice(model.pricing)),
    contextLength: nullableNumber(model.context_length),
    modality: modality(model),
    reasoningMode: reasoningMode(model.reasoning),
    knowledgeCutoff: nullableString(model.knowledge_cutoff),
    size: '',
  }
}
