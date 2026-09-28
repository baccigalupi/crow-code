import type { DefaultReasoning } from '../types.ts'

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

export type ReasoningSource = {
  architecture?: { modality?: string }
  supported_parameters: string[]
  reasoning?: DefaultReasoning
}

export type Nous2ApiModel = {
  id: string
  name: string
  context_length: number
  pricing: { prompt: string; completion: string }
  architecture?: { modality?: string }
  supported_parameters: string[]
  reasoning?: DefaultReasoning
}

export type Nous2ApiBody = {
  data: Nous2ApiModel[]
}

export type OpenRouter2ApiModel = {
  id: string
  name: string
  context_length: number
  pricing: { prompt: string; completion: string }
  architecture?: { modality?: string }
  supported_parameters: string[]
  reasoning?: DefaultReasoning
}

export type OpenRouter2ApiBody = {
  data: OpenRouter2ApiModel[]
}

export type CatalogModel = {
  id: string
  name: string
  provider: string
  contextLength: number | null
  costInput: number | null
  costOutput: number | null
  dynamicDelegation: boolean
  modality: string
  supportedParameters: string[]
  supportsReasoning: boolean
  canDisableReasoning: boolean
  reasoningOptions: DefaultReasoning
}

export type Ollama2ApiModel = {
  name: string
  model: string
  modified_at: string
  size: number
  digest: string
  details: {
    parent_model: string
    format: string
    family: string
    families: string[] | null
    parameter_size: string
    quantization_level: string
    context_length?: number
    embedding_length?: number
  }
  remote_model?: string
  remote_host?: string
  capabilities?: string[]
}

export type Ollama2ApiBody = {
  models: Ollama2ApiModel[]
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
