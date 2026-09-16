import { fetchProvider } from './fetch-provider.ts'
import { ModelRecord, ProviderConfig } from '../types.ts'

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

const buildNousRecord = (
  model: NousModel,
  config: ProviderConfig,
): ModelRecord => {
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
    reasoningMode: reasoningMode(model.reasoning),
    knowledgeCutoff: model.knowledge_cutoff || null,
    size: '',
  }
}

type NousApiRecord = { data?: NousModel[] }

export const parseNousResponse = (
  raw: NousApiRecord,
  config: ProviderConfig,
): ModelRecord[] => {
  if (raw.data === undefined) {
    return []
  }
  return raw.data.map((model) => buildNousRecord(model, config))
}

export const fetchNousModels = (
  config: ProviderConfig,
  fetchClient: typeof fetch = fetch,
): Promise<ModelRecord[]> => {
  return fetchProvider<NousApiRecord, ModelRecord>(
    config.baseUrl + '/v1/models',
    (raw) => parseNousResponse(raw, config),
    nousTimeoutMs,
    fetchClient,
  )
}
