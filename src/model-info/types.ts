import type pino from 'pino'

export type Logger = pino.Logger

export type EnvironmentValues = Record<string, string>

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

export type NousReasoningOptions = {
  mandatory?: boolean
  default_enabled?: boolean
  default_effort?: string
  supported_efforts?: string[]
  supports_max_tokens?: boolean
}

export type Nous2ApiModel = {
  id: string
  name: string
  context_length: number
  pricing: { prompt: string; completion: string }
  architecture?: { modality?: string }
  supported_parameters: string[]
  reasoning?: NousReasoningOptions
}

export type Nous2ApiBody = {
  data: Nous2ApiModel[]
}

export type CatalogModel = {
  id: string
  name: string
  contextLength: number
  costInput: number
  costOutput: number
  modality: string
  supportedParameters: string[]
  supportsReasoning: boolean
  canDisableReasoning: boolean
  reasoningOptions: NousReasoningOptions
}

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
