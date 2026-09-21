import type pino from 'pino'

export type Logger = pino.Logger

export type ReasoningOption = 'toggle' | 'effort' | 'budget_tokens'

export type ProviderConfig = {
  name: string
  baseUrl: string
  modelsUrl?: string
  apiKeyEnv?: string
}

export type ModelInfo = {
  id: string
  name: string
  provider: string
  reasoning: boolean | null
  reasoningOptions: ReasoningOption[]
  costInput: number
  costOutput: number
  contextLength: number | null
  modality: string
  knowledgeCutoff: string | null
  size: string
}

export type ModelCatalog = {
  fetchedAt: string
  modelCount: number
  models: ModelInfo[]
}

export type ReasoningMeta = {
  mandatory?: boolean
  default_enabled?: boolean
  default_effort?: string
}

export type NousModel = {
  id: string
  name?: string
  context_length?: number
  knowledge_cutoff?: string
  pricing?: { prompt?: string; completion?: string }
  reasoning?: ReasoningMeta | null
  supported_parameters?: string[]
  architecture?: { modality?: string }
}

export type NousApiRecord = { data?: NousModel[] }

export type OllamaModel = {
  name: string
  details?: { parameter_size?: string; context_length?: number }
}

export type OllamaApiRecord = { models?: OllamaModel[] }

export type OpenRouterPricing = {
  prompt?: string
  completion?: string
}

export type OpenRouterModel = {
  id: string
  name?: string
  context_length?: number
  pricing?: OpenRouterPricing
  supported_parameters?: string[]
  architecture?: { modality?: string }
}

export type OpenRouterApiRecord = { data?: OpenRouterModel[] }

export type ModelsDevEntry = {
  reasoning: boolean | null
  reasoningOptions: ReasoningOption[]
}

export type ModelsDevCatalog = Record<string, Record<string, ModelsDevEntry>>
