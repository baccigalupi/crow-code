import { fetchCatalog } from '../fetch-catalog.js'
import { ModelRecord } from '../types.js'

type ReasoningMeta = {
  mandatory?: boolean
  default_enabled?: boolean
  default_effort?: string
}

type NousModel = {
  id: string
  name?: string
  context_length?: number
  knowledge_cutoff?: string
  pricing?: { prompt?: string; completion?: string }
  reasoning?: ReasoningMeta | null
  architecture?: { modality?: string }
}

const nousUrl = 'https://inference-api.nousresearch.com/v1/models'

const nousTimeoutMs = 20000

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

const buildNousRecord = (model: NousModel): ModelRecord => {
  return {
    id: model.id,
    name: modelName(model),
    providers: ['nous'],
    reasoning: null,
    coding: null,
    codingSource: null,
    agentic: null,
    costInput: toMillionPrice(promptPrice(model.pricing)),
    costOutput: toMillionPrice(completionPrice(model.pricing)),
    contextLength: model.context_length || null,
    modality: modality(model),
    reasoningMode: reasoningMode(model.reasoning),
    knowledgeCutoff: model.knowledge_cutoff || null,
    size: '',
  }
}

export const parseNousResponse = (raw: unknown): ModelRecord[] => {
  const body = raw as { data?: NousModel[] }
  if (body.data === undefined) {
    return []
  }
  return body.data.map(buildNousRecord)
}

export const fetchNousModels = (): Promise<ModelRecord[]> => {
  return fetchCatalog(nousUrl, parseNousResponse, nousTimeoutMs)
}
